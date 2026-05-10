import axios, { AxiosResponse } from "axios"
import getFlutterwaveToken from "./GetFlutterWaveToken";
import { AuthRequest } from "../../../../Config/Config/JwtAuth";
import z from "zod";
import { Response } from "express";
import { UserModel } from "../../../Modal/UserSchema/User";

interface BankDetails {
    account_number: string;
    code: string;
}

interface RecipientResponse {
    status: string;
    message: string;
    data: {
        id: number;
        name: string;
        account_number: string;
        bank_code: string;
        createdAt: string;
    };
}

const createTransferRecipient = async (req: AuthRequest, res: Response): Promise<RecipientResponse | void> => {
    try {
        const token = await getFlutterwaveToken();
        const userId = req.user?.userId;

        const { email, accountNumber, bankCode } = z.object({
            email: z.string().email(),
            accountNumber: z.string(),
            bankCode: z.string(),
        }).parse(req.body);



        const traceId = crypto.randomUUID();
        const idempotencyKey = crypto.randomUUID();

        const user = await UserModel.findById(userId);



        const existingRecipients = await axios.get('https://developersandbox-api.flutterwave.com/transfers/recipients', {
            headers: {
                'Authorization': `Bearer ${token.access_token}`
            }
        });

        // Check if email exists already
        const recipients = existingRecipients.data.data;

        if (Array.isArray(recipients)) {
            // It's an array - use .find()
            const existing = recipients.find((r: any) => r.email === email);
            if (existing) {
                return existing;
            }
        } else if (recipients && typeof recipients === 'object') {
            // It's a single object
            if (recipients.email === email) {
                return recipients;
            }
        }


        const bankDetails: BankDetails = {
            account_number: accountNumber,
            code: bankCode,
        }

        const response: AxiosResponse<RecipientResponse> = await axios.post(
            'https://developersandbox-api.flutterwave.com/transfers/recipients',

            {
                "type": "bank_ngn",
                "bank": {
                    "account_number": bankDetails.account_number,
                    "code": bankDetails.code,
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${token.access_token}`,
                    'Content-Type': 'application/json',
                    'X-Trace-Id': traceId,
                    'X-Idempotency-Key': idempotencyKey
                },

            }
        )

        console.log(' Recipient Created:', response.data);
        return response.data;
    } catch (error: any) {
        const token = await getFlutterwaveToken();
        if (error.response?.status === 409) {
            console.warn(`Recipient already exists with account number: ${error.response.data.message}`)
            const searchResponse: AxiosResponse<any> = await axios.get(
                `https://developersandbox-api.flutterwave.com/transfers/recipients?account_number=${req.body.accountNumber}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token.access_token}`
                    }

                }
            );
            console.log(searchResponse.data.data);
            return searchResponse.data.data[0];

        }

        if (error instanceof z.ZodError) {
            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: error.issues.map((e) => ({
                    field: e.path.join("."),
                    message: e.message,
                })),
            });
            return;
        }
        console.error('Error creating transfer recipient:', error);
        throw error;

    }
}

export default createTransferRecipient;