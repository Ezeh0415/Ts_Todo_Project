import { Request, Response } from "express";
import { createUserValidation } from "../../../Validate/UserValidate/User";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { UserModel } from "../../../Modal/UserSchema/User";
import { NewOtp } from "../../../../Utils/GenerateOtp/Otp";
const Config = require("../../../../Config/Config");

const SignUp = async (req: Request, res: Response): Promise<object> => {
  try {
    const validatedUser = await createUserValidation.parse(req.body);

    const isExistingUser = await UserModel.findOne({
      email: validatedUser.email,
    });

    if (isExistingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const saltRounds: number = Config.HASH_SALT;
    const HashedPassword = await bcrypt.hash(
      validatedUser.password,
      saltRounds,
    );

    const user = {
      name: validatedUser.name,
      email: validatedUser.email,
      password: HashedPassword,
      otp: NewOtp,
      otpExpire: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    };

    const result = await UserModel.create(user);

    if (!result) {
      return res.status(400).json({ message: "User sign up failed" });
    }

    const userObject = result.toObject();
    const { password, otp, otpExpire, ...safeUser } = userObject;
    // Now safeUser has all fields EXCEPT password

    return res
      .status(201)
      .json({ message: "User created successfully", user: safeUser });
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
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default SignUp;
