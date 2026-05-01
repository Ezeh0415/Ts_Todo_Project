"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const User_1 = require("../../../Modal/UserSchema/User");
const Otp_1 = require("../../../../Utils/GenerateOtp/Otp");
const SecurityLog_1 = require("../../../Modal/SecurityLog/SecurityLog");
const ResendOtp = async (req, res) => {
    try {
        // get email from request body and validate it
        const { email } = zod_1.z
            .object({
            email: zod_1.z.string().email("invalid email address").transform(email => email.toLowerCase()),
        })
            .parse(req.body);
        // fetch user from database
        const user = await User_1.UserModel.findOne({ email });
        // if user not found, return error
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // update otp to database
        user.otp = Otp_1.NewOtp;
        user.otpExpire = new Date(Date.now() + 10 * 60 * 1000);
        user.save();
        const securityLog = new SecurityLog_1.SecurityLog({
            userId: user._id,
            action: "ResendOtp",
            status: "success",
            ipAddress: req.ip || req.socket.remoteAddress,
            userAgent: req.headers['user-agent'] || 'Unknown',
            metadata: {
                ResendMethod: "email",
                timestamp: new Date().toISOString()
            }
        });
        await securityLog.save();
        // then send otp to user email
        // return success message
        return res.status(200).json({ message: "OTP sent successfully" });
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
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.default = ResendOtp;
