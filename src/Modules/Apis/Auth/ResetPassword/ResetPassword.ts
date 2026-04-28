import { Request, Response } from "express";
import { z } from "zod";
import { UserModel } from "../../../Modal/UserSchema/User";
import { SecurityLog } from "../../../Modal/SecurityLog/SecurityLog";

const ResetPassword = async (req: Request, res: Response): Promise<void> => {
    try {

        const { email, password, otp } = z.object({
            email: z.string().email().transform(email => email.toLowerCase()),
            password: z.string()
                .min(6, 'Password must be at least 6 characters')
                .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
                .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
                .regex(/[0-9]/, 'Password must contain at least one number'),
            otp: z
                .string()
                .length(6, "OTP must be exactly 6 characters")
                .regex(
                    /^[a-zA-Z0-9!@#$%^&*()]{6}$/,
                    "OTP can only contain letters (A-Z, a-z), numbers (0-9), and special characters (!@#$%^&*())",
                )
        }).parse(req.body);

        const user = await UserModel.findOne({ email });

        if (!user) {
            res.status(404).json({
                message: "user is not found try again "
            })
            return;
        }

        const otpExpire = new Date(user.otpExpire);
        const currentTime = new Date();
        if (otpExpire < currentTime) {
            await UserModel.updateOne(
                { _id: user?._id },
                { $unset: { otp: "", otpExpire: "" } }
            )
            const securityLog = new SecurityLog({
                userId: user?._id,
                action: "resetPassword-verifyOtp",
                status: "Failed",
                ipAddress: req.ip || req.socket.remoteAddress,
                userAgent: req.headers['user-agent'] || 'Unknown',
                metadata: {
                    verifyMethod: "email",
                    timestamp: new Date().toISOString(),
                    FailedReason: "Otp expired"
                }
            })

            await securityLog.save();
            res.status(400).json({ message: "OTP expired" });
            return;
        }

        // verify otp if correct
        if (user.otp !== otp) {
            res.status(400).json({
                message: "this isn`t what i gave you"
            })
        }

        const result = await UserModel.updateOne({ _id: user?._id }, { $set: { otp: "", otpExpire: "", password: password, otpAdded: true } })

        if (!result) {
            res.status(500).json({ message: "uploading new password failed" })
            return;
        }

        res.status(200).json({ message: "new password uploaded" })

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

export default ResetPassword