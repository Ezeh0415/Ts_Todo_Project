import { Request, Response } from "express";
import { z } from "zod";
import { loginValidation } from "../../../Validate/LoginValidate/LoginValidate";
import { UserModel } from "../../../Modal/UserSchema/User";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../../../Utils/JWTSetup/GenerateJwt";
import { SecurityLog } from "../../../Modal/SecurityLog/SecurityLog";

const Login = async (req: Request, res: Response): Promise<object> => {
  try {
    const validatedBody = loginValidation.parse(req.body);

    const user = await UserModel.findOne({ email: validatedBody.email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      return res.status(403).json({
        message: `Account is locked. Please try again in ${remainingMinutes} minutes`
      });
    }

    // Lock account after 5 failed attempts
    if (user.loginFailedCount >= 5) {
      user.lockedUntil = new Date(Date.now() + 10 * 60 * 1000); // Lock for 10 minutes
      user.loginFailedCount = 0 //lock count reset
      await user.save();

      const securityLog = new SecurityLog({
        userId: user._id,
        action: "login",
        status: "failed",
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'] || 'Unknown',
        metadata: {
          loginMethod: 'password',
          timestamp: new Date().toISOString(),
          FailedReason: "Too many failed attempts. Account locked for 10 minutes"
        }
      })

      await securityLog.save();

      return res.status(403).json({
        message: "Too many failed attempts. Account locked for 10 minutes",
        lockedUntil: user.lockedUntil
      });
    }

    const isPasswordValid = await bcrypt.compare(
      validatedBody.password,
      user.password,
    );

    if (!isPasswordValid) {
      // Increment failed login attempts
      user.loginFailedCount = (user.loginFailedCount || 0) + 1;
      user.save();
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.otpAdded === false) {
      return res.status(403).json({
        message: "otp verification is missing verify"
      })
    }

    // generate jwt tokens
    const token = await generateAccessToken(user._id, user.email);
    const refreshToken = await generateRefreshToken(user._id, user.email);

    // save refresh token
    user.refreshToken = refreshToken;
    user.loginFailedCount = 0 //lock count reset
    user.save();

    const securityLog = new SecurityLog({
      userId: user._id,
      action: "login",
      status: "success",
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'] || 'Unknown',
      metadata: {
        loginMethod: 'password',
        timestamp: new Date().toISOString()
      }
    })

    await securityLog.save();

    const userObject = user.toObject();
    const { password, otp, otpExpire, otpAdded, loginFailedCount, lockedUntil, ...safeUser } = userObject;

    return res
      .status(200)
      .json({
        message: "Login successful",
        user: safeUser,
        token: token,
      });
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
    return res.status(500).json({ message: "login Internal server error" });
  }
};

export default Login;
