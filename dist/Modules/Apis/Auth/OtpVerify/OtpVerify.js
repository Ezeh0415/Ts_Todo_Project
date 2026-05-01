"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const Otp_1 = require("../../../Validate/OtpValidate/Otp");
const User_1 = require("../../../Modal/UserSchema/User");
const SecurityLog_1 = require("../../../Modal/SecurityLog/SecurityLog");
const VerifyOtp = async (req, res) => {
    try {
        const validatedOtp = await Otp_1.createUserOtpValidation.parse(req.body);
        if (!validatedOtp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        // fetch otp from db
        const FetchOtp = await User_1.UserModel.findOne({ email: validatedOtp.email });
        if (!FetchOtp) {
            return res.status(404).json({ message: "User not found" });
        }
        // check otp expired
        const otpExpired = new Date(FetchOtp.otpExpire);
        const currentTime = new Date();
        if (otpExpired < currentTime) {
            await User_1.UserModel.updateOne({ _id: FetchOtp._id }, { $unset: { otp: "", otpExpire: "" } });
            const securityLog = new SecurityLog_1.SecurityLog({
                userId: FetchOtp._id,
                action: "verifyOtp",
                status: "Failed",
                ipAddress: req.ip || req.socket.remoteAddress,
                userAgent: req.headers['user-agent'] || 'Unknown',
                metadata: {
                    verifyMethod: "email",
                    timestamp: new Date().toISOString(),
                    FailedReason: "Otp expired"
                }
            });
            await securityLog.save();
            return res.status(400).json({ message: "OTP expired" });
        }
        // compare otp
        if (FetchOtp.otp !== validatedOtp.otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        // update otp and otpExpire
        await User_1.UserModel.updateOne({ _id: FetchOtp._id }, { $set: { otp: "", otpExpire: "", otpAdded: true } });
        const securityLog = new SecurityLog_1.SecurityLog({
            userId: FetchOtp._id,
            action: "verifyOtp",
            status: "success",
            ipAddress: req.ip || req.socket.remoteAddress,
            userAgent: req.headers['user-agent'] || 'Unknown',
            metadata: {
                verifyMethod: "email",
                timestamp: new Date().toISOString()
            }
        });
        await securityLog.save();
        return res.status(200).json({ message: "Otp verified successfully" });
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
exports.default = VerifyOtp;
