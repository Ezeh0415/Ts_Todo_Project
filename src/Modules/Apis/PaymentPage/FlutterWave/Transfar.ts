import axios, { AxiosResponse } from "axios"
import getFlutterwaveToken from "./GetFlutterWaveToken";
import { AuthRequest } from "../../../../Config/Config/JwtAuth";
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

const createTransferRecipient = async (req: AuthRequest): Promise<RecipientResponse | null> => {
    try {
        const token = await getFlutterwaveToken();

        const traceId = crypto.randomUUID();
        const idempotencyKey = crypto.randomUUID();


        const bankDetails: BankDetails = {
            account_number: req.body.accountNumber,
            code: req.body.bankCode,
        }

        const response: AxiosResponse<RecipientResponse> = await axios.post(
            'https://developersandbox-api.flutterwave.com/transfers/recipients',

            {
                type: "bank_ngn",
                bank: {
                    account_number: bankDetails.account_number,
                    code: bankDetails.code
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
    } catch (error) {
        console.error('Error creating transfer recipient:', error);
        throw error;

    }
}

export default createTransferRecipient;