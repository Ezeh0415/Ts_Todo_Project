import { NextFunction, Request, Response } from "express";
import { UserModel } from "../../Modal/UserSchema/User";
import { GUser } from "../../../Config/Config/Passport";
import { generateAccessToken, generateRefreshToken } from "../../../Utils/JWTSetup/GenerateJwt";



const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    try {
        const user = req.user as GUser;

        if (!user) {
            res.status(401).json({ message: "authentication failed" });
            return;
        }

        // fetch user from db 
        const FetchUser = await UserModel.findOne({ email: user?.email });

        if (!FetchUser) {
            res.status(404).json({ message: "user not found" });
            return;
        }

        

        const token = await generateAccessToken(FetchUser._id, FetchUser.email)
        const refreshToken = await generateRefreshToken(FetchUser._id, FetchUser.email)

        FetchUser.refreshToken = refreshToken;
        FetchUser.save();

        const userObject = FetchUser.toObject();
        const { password, otp, otpExpire, otpAdded, loginFailedCount, lockedUntil, ...safeUser } = userObject;

        res.status(200).json({ message: "login successful", safeUser, token })
        return;
    } catch (error) {
        next(error);
    }
}

export default register;