"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../../../Validate/UserValidate/User");
const zod_1 = require("zod");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_2 = require("../../../Modal/UserSchema/User");
const Otp_1 = require("../../../../Utils/GenerateOtp/Otp");
const SecurityLog_1 = require("../../../Modal/SecurityLog/SecurityLog");
const Config = require("../../../../Config/Config");
const SignUp = async (req, res) => {
    try {
        const validatedUser = await User_1.createUserValidation.parse(req.body);
        const isExistingUser = await User_2.UserModel.findOne({
            email: validatedUser.email,
        });
        if (isExistingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const saltRounds = Config.HASH_SALT;
        const HashedPassword = await bcryptjs_1.default.hash(validatedUser.password, saltRounds);
        const user = {
            name: validatedUser.name,
            email: validatedUser.email,
            password: HashedPassword,
            otp: Otp_1.NewOtp,
            otpExpire: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
        };
        const result = await User_2.UserModel.create(user);
        if (!result) {
            return res.status(400).json({ message: "User sign up failed" });
        }
        const userObject = result.toObject();
        const { password, otp, otpExpire, otpAdded, loginFailedCount, lockedUntil, ...safeUser } = userObject;
        // Now safeUser has all fields EXCEPT password
        const securityLog = new SecurityLog_1.SecurityLog({
            userId: result._id,
            action: "signup",
            status: "success",
            ipAddress: req.ip || req.socket.remoteAddress,
            userAgent: req.headers['user-agent'] || 'Unknown',
            metadata: {
                Method: "signup",
                timestamp: new Date().toISOString()
            }
        });
        await securityLog.save();
        return res
            .status(201)
            .json({ message: "User created successfully", user: safeUser });
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
exports.default = SignUp;
