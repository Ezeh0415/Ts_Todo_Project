import { Request, Response } from "express";
import { TransferModel } from "../../../Modal/TransferSchema/TransferSchema";
import verifyFlutterwaveSignature from "./FlutterwaveWebhook";


const TranserWebhook = async (req: Request, res: Response) => {
    try {
        if (!verifyFlutterwaveSignature(req)) {
            console.error('Invalid signature');
             await TransferModel.updateMany(
            { trfId: "trf_OJVgZyuTmEgPdrh4gTtox" },
            {
                $set: {
                    type: "wrong webhook"
                }
            }
        )
            return res.status(401).json({
                success: false,
                message: "Invalid signature"
            });
        }

        const webhook = req.body;

        const { event, data } = webhook;

        console.log(event, data);

        await TransferModel.updateMany(
            { trfId: "trf_OJVgZyuTmEgPdrh4gTtox" },
            {
                $set: {
                    type: "webhook"
                }
            }
        )


    } catch (error) {
        console.error('Webhook error:', error);
        // Still return 200 to prevent Flutterwave from resending
        res.status(200).json({ status: 'error', message: 'Internal error' });
    }
}


export default TranserWebhook;