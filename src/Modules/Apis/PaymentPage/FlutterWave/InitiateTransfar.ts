import { Response } from "express";
import { AuthRequest } from "../../../../Config/Config/JwtAuth";
import z from "zod";
import { TransferModel } from "../../../Modal/TransferSchema/TransferSchema";
import axios, { AxiosResponse } from "axios";
import getFlutterwaveToken from "./GetFlutterWaveToken";
import { meta } from "zod/v4/core";
import createTransferRecipient from "./Transfar";

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
        meta: Record<string, any>;  // Empty object
        created_datetime: string;    // ISO date string
    };
}


const initiateTransfer = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { amount, action, narration } = z.object({
            amount: z.number(),
            action: z.string(),
            narration: z.string()
        }).parse(req.body);

        const token = await getFlutterwaveToken();
        const bearerToken = token.access_token || token;

        // const TransferReceipt: any = await createTransferRecipient(req, res);

        const userId = req.user?.userId;

        const transfer = await TransferModel.findOne({ flutterId: TransferReceipt.flutterId });

        if (!transfer) {
            res.status(400).json({
                success: false,
                message: "transfer receipt not found"
            })
        }

        // const nameData = transfer?.name as { name?: object };
        // const name = nameData?.name;

        console.log(transfer);


        // const response: AxiosResponse<ITransferResponse> = await axios.post(
        //     'https://developersandbox-api.flutterwave.com/transfers',

        //     {
        //         'action': action,
        //         'reference': transfer?.traceId,
        //         'narration': narration,
        //         'meta': {
        //             name: name
        //         }
        //     },

        //     {
        //         headers: {
        //             'Authorization': `Bearer ${bearerToken}`,
        //             'Content-Type': 'application/json',
        //             'X-Trace-Id': transfer?.traceId,
        //             'X-Idempotency-Key': transfer?.idempotencyKey,
        //             'X-Scenario-Key': "successful"
        //         }
        //     }
        // )

    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                success: false,
                message: "transfer initiation failed",
                error: error.issues.map((e) => ({
                    field: e.path.join("."),
                    message: e.message
                }))
            })
        }
        res.status(500).json({
            success: false,
            message: "transfer initiation failed"
        })
    }
}

export default initiateTransfer;
