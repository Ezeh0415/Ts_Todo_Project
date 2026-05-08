import axios, { AxiosResponse } from "axios"
import getFlutterwaveToken from "./GetFlutterWaveToken";

interface BankDetails {
    account_number: string;
    code: string;
}

interface RecipientRequest {
    type: string;
    bank: BankDetails;
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

const createTransferRecipient = async (): Promise<RecipientResponse | null> => {
    const token = await getFlutterwaveToken();
    // console.log(token.access_token)
    try {
        const response: AxiosResponse<RecipientResponse> = await axios.post(
            'https://developersandbox-api.flutterwave.com/transfers/recipients',

            {
                type: "bank_ngn",
                bank: {
                    account_number: "0690000031",
                    code: "044"
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${token.access_token}`,
                    'Content-Type': 'application/json',
                    'X-Trace-Id': crypto.randomUUID(),
                    'X-Idempotency-Key': crypto.randomUUID()
                },

            }
        )

        console.log(' Recipient Created:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting Flutterwave token:', error);
        throw error;

    }
}

export default createTransferRecipient;
export { RecipientResponse };