import { Request, Response } from "express";
import { z } from "zod";
import { PaymentModel } from "../../../Modal/PaymentSchema/Payment";
import { SecurityLog } from "../../../Modal/SecurityLog/SecurityLog";
const crypto = require('crypto');
const { WEB_HOOK_SECRET_KEY } = require("../../../../Config/Config");


const PaystackWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!WEB_HOOK_SECRET_KEY) {
            res.status(401).send('webhook key not found');
            return;
        }


        // 2. Get signature from headers
        const signature = req.headers['x-paystack-signature'] as string;
        if (!signature) {
            console.error('❌ No signature found in headers');
            res.status(401).send('No signature provided');
            return;
        }

        const hash = crypto.createHmac('sha512', WEB_HOOK_SECRET_KEY)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (hash !== signature) {
            res.status(401).send('unauthorized');
            return;
        }

        const event = req.body;
        switch (event.event) {
            case 'charge.success':
                // Update  database
                const updatePaymentSuccess = await PaymentModel.findOneAndUpdate(
                    { reference: event.data.reference },  // Find by reference
                    {
                        status: event.data.status,
                        paidAt: new Date(),
                        amount: event.data.amount / 100,  // Convert from kobo/cents
                        currency: event.data.currency,
                        transactionId: event.data.id,
                        paymentMethod: event.data.channel,
                        metadata: event.data.metadata,
                        updatedAt: new Date()
                    },
                    {
                        new: true,  // Return the updated document (not the old one)
                        upsert: false  // Don't create if not found (optional)
                    }
                );

                if (!updatePaymentSuccess) {
                    res.status(404).json({
                        success: false,
                        message: "payment not found"
                    })
                    return;
                }


                const securityLogSuccess = new SecurityLog({
                    userId: event.data.reference,
                    action: "Payment confirmation",
                    status: event.data.status,
                    ipAddress: req.ip || req.socket.remoteAddress,
                    userAgent: req.headers['user-agent'] || 'Unknown',
                    metadata: {
                        paymentMethod: event.data.channel,
                        metadata: event.data.metadata,
                        Method: "Payment confirmation",
                        timestamp: new Date().toISOString()
                    }
                })

                await securityLogSuccess.save();

                break;
            case 'charge.failed':
                // Update  database
                const updatePaymentFailed = await PaymentModel.findOneAndUpdate(
                    { reference: event.data.reference },  // Find by reference
                    {
                        status: event.data.status,
                        paidAt: new Date(),
                        amount: event.data.amount / 100,  // Convert from kobo/cents
                        currency: event.data.currency,
                        transactionId: event.data.id,
                        paymentMethod: event.data.channel,
                        metadata: event.data.metadata,
                        updatedAt: new Date()
                    },
                    {
                        new: true,  // Return the updated document (not the old one)
                        upsert: false  // Don't create if not found (optional)
                    }
                );

                if (!updatePaymentFailed) {
                    res.status(404).json({
                        success: false,
                        message: "payment not found"
                    })
                    return;
                }


                const securityLogFailed = new SecurityLog({
                    userId: event.data.reference,
                    action: "Payment confirmation",
                    status: event.data.status,
                    ipAddress: req.ip || req.socket.remoteAddress,
                    userAgent: req.headers['user-agent'] || 'Unknown',
                    metadata: {
                        paymentMethod: event.data.channel,
                        metadata: event.data.metadata,
                        Method: "Payment confirmation",
                        timestamp: new Date().toISOString()
                    }
                })

                await securityLogFailed.save();
                break;
            default:
                console.log('Unhandled event:', event.event);
        }

        res.status(200).send('payment successful');
        return;



    } catch (error) {
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

        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
        return;
    }

}

export default PaystackWebhook;