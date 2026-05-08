import axios, { AxiosResponse } from "axios";
const { FLUTTER_PUBLIC_KEY, FLUTTER_SECRET_KEY } = require("../../../../Config/Config")

interface TokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
}

const getFlutterwaveToken = async (): Promise<TokenResponse> => {
    try {
        const response: AxiosResponse<TokenResponse> = await axios.post(
            'https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token',

            new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: FLUTTER_PUBLIC_KEY,
                client_secret: FLUTTER_SECRET_KEY,
            }).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }

        )
        // console.log("Access Token", response.data.access_token);
        return response.data;
    } catch (error) {
        console.error('Error getting Flutterwave token:', error);
        throw error;
    }
}

export default getFlutterwaveToken;
export { TokenResponse };