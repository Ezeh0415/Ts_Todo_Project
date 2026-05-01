"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../../Modal/UserSchema/User");
const GenerateJwt_1 = require("../../../Utils/JWTSetup/GenerateJwt");
const register = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: "authentication failed" });
            return;
        }
        // fetch user from db 
        const FetchUser = await User_1.UserModel.findOne({ email: user?.email });
        if (!FetchUser) {
            res.status(404).json({ message: "user not found" });
            return;
        }
        const token = await (0, GenerateJwt_1.generateAccessToken)(FetchUser._id, FetchUser.email);
        const refreshToken = await (0, GenerateJwt_1.generateRefreshToken)(FetchUser._id, FetchUser.email);
        FetchUser.refreshToken = refreshToken;
        FetchUser.save();
        const userObject = FetchUser.toObject();
        const { password, otp, otpExpire, otpAdded, loginFailedCount, lockedUntil, ...safeUser } = userObject;
        res.status(200).json({ message: "login successful", safeUser, token });
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.default = register;
