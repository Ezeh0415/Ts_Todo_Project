import { Response } from "express";
import { AuthRequest } from "../../../../Config/Config/JwtAuth";
import z from "zod";
import { TransferModel } from "../../../Modal/TransferSchema/TransferSchema";
import axios, { AxiosResponse } from "axios";
import getFlutterwaveToken from "./GetFlutterWaveToken";
import createTransferRecipient from "./Transfar";
import { UserModel } from "../../../Modal/UserSchema/User";

interface ITransferResponse {
    status: string;
    message: string;
    data: {
        id: string;
        type: string;
        action: string;
        reference: string;
        status: string;
        narration: string;
        source_currency: string;
        destination_currency: string;
        amount: {
            value: number;
            applies_to: string;
        };
        callback_url: string;
        recipient: {
            type: string;
            currency: string;
            bank: {
                account_number: string;
                code: string;
            };
            id: string;
        };
        meta: Record<string, any>;
        created_datetime: string;
    };
}

const initiateTransfer = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { accountNumber, bankCode, amount, action, narration, name } = z.object({
            accountNumber: z.string(),
            bankCode: z.string(),
            amount: z.number(),
            action: z.string(),
            narration: z.string(),
            name: z.string().optional()  // Added name field
        }).parse(req.body);

        const token = await getFlutterwaveToken();
        const bearerToken = token.access_token || token;

        const userId = req.user?.userId;

        const user = await UserModel.findById(userId);

        if (!user) {
            res.status(400).json({
                success: false,
                message: "user not found"
            });
            return;  //  Added return
        }

        const ReceiptData = {
            userId: userId,
            email: user.email,
            accountNumber: accountNumber,
            bankCode: bankCode
        };

        const TransferReceipt: any = await createTransferRecipient(ReceiptData);

        if (!TransferReceipt) {
            res.status(400).json({
                success: false,
                message: "transfer receipt not found"
            });
            return;  // Added return
        }

        const transfer = await TransferModel.findOne({ flutterId: TransferReceipt.data?.id });

        if (!transfer) {
            res.status(400).json({
                success: false,
                message: "transfer receipt not found"
            });
            return;  //  Added return
        }

        const payload = {
            action: "instant",
            type: "wallet",
            reference: transfer?.traceId,
            narration: narration,
            payment_instruction: {
                source_currency: "NGN",
                destination_currency: "NGN",
                amount: {
                    applies_to: "destination_currency",
                    value: amount
                },
                recipient_id: TransferReceipt.data?.id  //  Fixed: recipient_id, not recipient
            }
        };

        // console.log('Sending payload:', JSON.stringify(payload, null, 2));
        // console.log('Recipient ID being sent:', TransferReceipt.data?.id);
        // console.log(payload, transfer, TransferReceipt);


        try {
            const response: AxiosResponse<ITransferResponse> = await axios.post(
                'https://developersandbox-api.flutterwave.com/transfers',
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${bearerToken}`,
                        'Content-Type': 'application/json',
                        'X-Trace-Id': transfer?.traceId,
                        'X-Idempotency-Key': transfer?.idempotencyKey,
                        'X-Scenario-Key': "successful"
                    }
                }
            );

            console.log('Transfer successful:', response.data);

            const responseData = response.data.data; // The inner data object

            await TransferModel.updateMany(
                { flutterId: TransferReceipt.data?.id },
                {
                    $set: {
                        trfId: responseData.id,                    // "trf_ykwGUdHBVtsqkOuhvoxxz"
                        flutterId: responseData.recipient.id,       // "rcb_IiWisy68V4"
                        amount: responseData.amount,                // { value: 2000, applies_to: "destination_currency" }
                        status: responseData.status,                // "NEW"
                        narration: responseData.narration,          // "example"
                        reference: responseData.reference,          // "290be140-270e-468a-a89c-9ea25a87d325"
                        action: responseData.action,                // "instant"
                        type: responseData.type,                    // "bank"
                        sourceCurrency: responseData.source_currency,   // "NGN"
                        destinationCurrency: responseData.destination_currency, // "NGN"
                        recipient: responseData.recipient,          // Full recipient object
                        createdDateTime: responseData.created_datetime,
                        metadata: {} // Add any additional metadata
                    }
                }
            )


            //  Send success response
            res.status(200).json({
                success: true,
                message: "Transfer initiated successfully",
                data: response.data
            });
            return;

        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Status:', error.response?.status);
                console.error('Full error response:', JSON.stringify(error.response?.data, null, 2));

                // ✅ This will show you the specific validation errors
                if (error.response?.data?.error?.validation_errors) {
                    console.error('Validation errors:', error.response.data.error.validation_errors);
                }

                res.status(500).json({
                    success: false,
                    message: error.response?.data?.message || 'Transfer failed',
                    validation_errors: error.response?.data?.error?.validation_errors
                });
                return;
            }
            throw error;
        }

    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                success: false,
                message: "Validation failed",
                error: error.issues.map((e) => ({
                    field: e.path.join("."),
                    message: e.message
                }))
            });
            return;  // Added return
        }

        //  Handle other errors
        res.status(500).json({
            success: false,
            message: "Transfer initiation failed",
            error
        });
        return;
    }
};

export default initiateTransfer;