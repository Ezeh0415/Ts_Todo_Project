"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const User_1 = require("../../../Modal/UserSchema/User");
const Otp_1 = require("../../../../Utils/GenerateOtp/Otp");
const SecurityLog_1 = require("../../../Modal/SecurityLog/SecurityLog");
const ForgotPassword = async (req, res) => {
    try {
        // get email from request body and validate it
        const { email } = zod_1.z
            .object({
            email: zod_1.z.string().email(),
        })
            .parse(req.body);
        // fetch user from database
        const user = await User_1.UserModel.findOne({ email });
        if (!user) {
            res.status(403).json({
                message: "user is invalid check email and try again "
            });
        }
        // password deleted 
        await User_1.UserModel.updateOne({ _id: user?._id }, { $set: { otpAdded: false, otp: Otp_1.NewOtp, otpExpire: new Date(Date.now() + 10 * 60 * 1000) } });
        // new otp sent  now it would be sent to the users email 
        // also send the link for the page to reset the password
        const securityLog = new SecurityLog_1.SecurityLog({
            userId: user?._id,
            action: "ForgotPassword",
            status: "success",
            ipAddress: req.ip || req.socket.remoteAddress,
            userAgent: req.headers['user-agent'] || 'Unknown',
            metadata: {
                Method: 'ForgotPassword',
                timestamp: new Date().toISOString()
            }
        });
        await securityLog.save();
        res.status(200).json({ message: " otp sent to email" });
        return;
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
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
};
exports.default = ForgotPassword;
