"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const bcrypt = require("bcryptjs");
const User_1 = require("../../../Modal/UserSchema/User");
const SecurityLog_1 = require("../../../Modal/SecurityLog/SecurityLog");
const Config = require("../../../../Config/Config");
const ResetPassword = async (req, res) => {
    try {
        const { email, password, otp } = zod_1.z.object({
            email: zod_1.z.string().email().transform(email => email.toLowerCase()),
            password: zod_1.z.string()
                .min(6, 'Password must be at least 6 characters')
                .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
                .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
                .regex(/[0-9]/, 'Password must contain at least one number'),
            otp: zod_1.z
                .string()
                .length(6, "OTP must be exactly 6 characters")
                .regex(/^[a-zA-Z0-9!@#$%^&*()]{6}$/, "OTP can only contain letters (A-Z, a-z), numbers (0-9), and special characters (!@#$%^&*())")
        }).parse(req.body);
        const user = await User_1.UserModel.findOne({ email });
        if (!user) {
            res.status(404).json({
                message: "user is not found try again "
            });
            return;
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (isPasswordValid) {
            res.status(500).json({ message: "you can`t use the same password" });
            return;
        }
        const otpExpire = new Date(user.otpExpire);
        const currentTime = new Date();
        if (otpExpire < currentTime) {
            await User_1.UserModel.updateOne({ _id: user?._id }, { $unset: { otp: "", otpExpire: "" } });
            const securityLog = new SecurityLog_1.SecurityLog({
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
            });
            await securityLog.save();
            res.status(400).json({ message: "OTP expired" });
            return;
        }
        // verify otp if correct
        if (user.otp !== otp) {
            res.status(400).json({
                message: "this otp isn`t what i gave you"
            });
            return;
        }
        const saltRounds = Config.HASH_SALT;
        const HashedPassword = await bcrypt.hash(password, saltRounds);
        const result = await User_1.UserModel.updateOne({ _id: user?._id }, { $set: { otp: "", otpExpire: "", password: HashedPassword, otpAdded: true } });
        if (!result) {
            res.status(500).json({ message: "uploading new password failed" });
            return;
        }
        res.status(200).json({ message: "new password uploaded" });
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
exports.default = ResetPassword;
