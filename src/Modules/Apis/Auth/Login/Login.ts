import { Request, Response } from "express";
import { z } from "zod";
import { loginValidation } from "../../../Validate/LoginValidate/LoginValidate";
import { UserModel } from "../../../Modal/UserSchema/User";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../../../Utils/JWTSetup/GenerateJwt";

const Login = async (req: Request, res: Response): Promise<object> => {
  try {
    const validatedBody = loginValidation.parse(req.body);

    const user = await UserModel.findOne({ email: validatedBody.email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(
      validatedBody.password,
      user.password,
    );

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // generate jwt tokens
    const token = await generateAccessToken(user._id, user.email);
    const refreshToken = await generateRefreshToken(user._id, user.email);

    // save refresh token
    user.refreshToken = refreshToken;
    user.save(); 

    const userObject = user.toObject();
    const { password, otp, otpExpire, ...safeUser } = userObject;

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
