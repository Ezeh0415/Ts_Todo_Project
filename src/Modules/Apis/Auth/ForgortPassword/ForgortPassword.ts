import { Request, Response } from "express";
import { z } from "zod";
import { UserModel } from "../../../Modal/UserSchema/User";
import { NewOtp } from "../../../../Utils/GenerateOtp/Otp";
import { SecurityLog } from "../../../Modal/SecurityLog/SecurityLog";


const ForgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {

        // get email from request body and validate it
        const { email } = z
            .object({
                email: z.string().email(),
            })
            .parse(req.body);

        // fetch user from database
        const user = await UserModel.findOne({ email });

        if (!user) {
            res.status(403).json({
                message: "user is invalid check email and try again "
            })
        }

        // password deleted 
        await UserModel.updateOne(
            { _id: user?._id },
            { $set: { password: "", otpAdded: false, otp: NewOtp, otpExpire: new Date(Date.now() + 10 * 60 * 1000) } },
        );

        
        // new otp sent  now it would be sent to the users email 
        // also send the link for the page to reset the password

         const securityLog = new SecurityLog({
              userId: user?._id,
              action: "ForgotPassword",
              status: "success",
              ipAddress: req.ip || req.socket.remoteAddress,
              userAgent: req.headers['user-agent'] || 'Unknown',
              metadata: {
                Method: 'ForgotPassword',
                timestamp: new Date().toISOString()
              }
            })

           await securityLog.save()

           res.status(200).json({message:" otp sent to email"})
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
        }
        res.status(500).json({ message: "Internal server error" });
        return;
    }
}

export default ForgotPassword