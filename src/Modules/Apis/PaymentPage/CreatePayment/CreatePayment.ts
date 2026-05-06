import { Response } from "express";
import { z } from "zod";
import { UserModel } from "../../../Modal/UserSchema/User";
import axios from "axios";
import { PaymentModel } from "../../../Modal/PaymentSchema/Payment";
import { AuthRequest } from "../../../../Config/Config/JwtAuth";
import { SecurityLog } from "../../../Modal/SecurityLog/SecurityLog";
const { PAYSTACK_SECRET_KEY, PAYSTACK_BASE_URL } = require("../../../../Config/Config");



const CreatePayment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {

        const { amount } = z.object({
            amount: z.number()
        }).parse(req.body)

        const isUserExist = await UserModel.findById(req.user?.userId);

        if (!isUserExist) {
            res.status(404).json({
                success: false,
                message: "user not found"
            })
            return;
        }

        if (!PAYSTACK_SECRET_KEY || !PAYSTACK_BASE_URL) {
            res.status(404).json({
                success: false,
                message: "paystack key not found"
            })

            return;
        }

        const response = await axios.post(`${PAYSTACK_BASE_URL}/transaction/initialize`,
            {
                email: isUserExist.email,
                amount: amount * 100,

            },
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                    "Content-Type": "application/json"
                }
            },
        );

        if (response.status !== 200) {
            res.status(404).json({
                success: false,
                message: "payment failed"
            });
            return;
        }

        const PaymentData = {
            reference: response.data.data.reference,
            accessCode: response.data.data.access_code,
            paymentRef: response.data.data.reference,
            authorizationCode: response.data.data?.authorization_url,
            userId: isUserExist._id,
            amount: amount,
            amountInKobo: amount * 100,
            customerEmail: isUserExist.email,
            customerName: isUserExist.name,
            status: response.data.data?.status || "pending"
        }



        const result = await PaymentModel.create(PaymentData);

            const securityLog = new SecurityLog({
              userId: result._id,
              action: "Payment creation",
              status: "success",
              ipAddress: req.ip || req.socket.remoteAddress,
              userAgent: req.headers['user-agent'] || 'Unknown',
              metadata: {
                Method: "Payment creation",
                timestamp: new Date().toISOString()
              }
            })
        
            await securityLog.save();

        if (!result) {
            res.status(404).json({
                success: false,
                message: " failed to save payment to db"
            })
            return;
        }



        res.status(200).json({
            data: response.data
        })

        return;

    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                success: false,
                message: "payment validation failed",
                error: error.issues.map((e) => ({
                    field: e.path.join("."),
                    message: e.message
                }))
            })
        }

        res.status(500).json({
            success: false,
            message: "internal server error"
        })

        return;
    }
}

export default CreatePayment;