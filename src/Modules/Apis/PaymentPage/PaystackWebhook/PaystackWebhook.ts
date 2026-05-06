import { Request, Response } from "express";
import { z } from "zod";
const crypto = require('crypto');
const { WEB_HOOK_SECRET_KEY } = require("../../../../Config/Config");


const PaystackWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
        if (WEB_HOOK_SECRET_KEY === undefined) {
            res.status(401).send('webhook key not found');
            return;
        }

        const hash = crypto.createHmac('sha512', WEB_HOOK_SECRET_KEY)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (hash === req.headers['x-paystack-signature']) {
            res.status(401).send('unauthorized');
            return;
        }

        const event = req.body;

        if (event.event === 'charge.success') {
            console.log(`Payment for reference ${event.data.reference} was successful!`);
        }

        res.status(200).send('ok');
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