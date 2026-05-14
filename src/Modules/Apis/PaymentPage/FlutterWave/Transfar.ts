import axios, { AxiosResponse } from "axios"
import getFlutterwaveToken from "./GetFlutterWaveToken";
import z from "zod";
import { UserModel } from "../../../Modal/UserSchema/User";
import { TransferModel } from "../../../Modal/TransferSchema/TransferSchema";
import crypto from 'crypto';
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


interface ReceiptData {
    userId: string | object;
    email: string;
    accountNumber: string;
    bankCode: string;
}

const createError = (message: string, statusCode: number = 500, details?: any): Error => {
    const error = new Error(message);
    (error as any).statusCode = statusCode;
    (error as any).details = details;
    return error;
};

const createTransferRecipient = async (ReceiptData: ReceiptData): Promise<RecipientResponse | void> => {
    try {
        const token = await getFlutterwaveToken();
        const bearerToken = token.access_token || token;

        const { userId, email, accountNumber, bankCode } = z.object({
            userId: z.string(),
            email: z.string().email(),
            accountNumber: z.string(),
            bankCode: z.string(),
        }).parse(ReceiptData);



        const traceId = crypto.randomUUID();
        const idempotencyKey = crypto.randomUUID();

        const user = await UserModel.findById(userId);


        if (!user) {
            throw createError("User not found", 404);
        }

        // Check if recipient already exists    


        const existingRecipients = await axios.get('https://developersandbox-api.flutterwave.com/transfers/recipients', {
            headers: {
                'Authorization': `Bearer ${bearerToken}`
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


        const result = await TransferModel.create({
            userId: user?._id,
            flutterId: response.data.data?.id.toString(),
            idempotencyKey: idempotencyKey,
            traceId: traceId,
            status: "recipient_created",
            name: {
                name: response.data.data?.name
            }
        })

        if (!result) {
            throw createError("Error creating transfer recipient", 500);
        }

        return response.data;
    } catch (error: any) {
        const token = await getFlutterwaveToken();
        // Handle duplicate recipient (409 Conflict)
        if (error.response?.status === 409) {
            console.warn(`Recipient already exists: ${error.response.data.message}`);

            try {
                const token = await getFlutterwaveToken();
                const searchResponse: AxiosResponse<any> = await axios.get(
                    `https://developersandbox-api.flutterwave.com/transfers/recipients?account_number=${ReceiptData.accountNumber}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token.access_token}`
                        }
                    }
                );

                if (searchResponse.data?.data) {
                    return searchResponse.data.data;
                }
            } catch (searchError) {
                throw createError("Recipient exists but could not retrieve", 409);
            }
        }

        // Handle Zod validation errors
        if (error instanceof z.ZodError) {
            throw createError(
                "Validation failed",
                400,
                error.issues.map((e) => ({
                    field: e.path.join("."),
                    message: e.message,
                }))
            );
        }
        console.error('Error creating transfer recipient:', error);
        throw error;

    }
}

export default createTransferRecipient;