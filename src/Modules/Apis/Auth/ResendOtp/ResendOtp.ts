import { Request, Response } from "express";
import { z } from "zod";
import { UserModel } from "../../../Modal/UserSchema/User";
import { NewOtp } from "../../../../Utils/GenerateOtp/Otp";
import { SecurityLog } from "../../../Modal/SecurityLog/SecurityLog";

const ResendOtp = async (req: Request, res: Response): Promise<object> => {
  try {
    // get email from request body and validate it
    const { email } = z
      .object({
        email: z.string().email(),
      })
      .parse(req.body);

    // fetch user from database
    const user = await UserModel.findOne({ email });

    // if user not found, return error
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // update otp to database
    user.otp = NewOtp;
    user.otpExpire = new Date(Date.now() + 10 * 60 * 1000);
    user.save();

    const securityLog = new SecurityLog({
      userId: user._id,
      action: "ResendOtp",
      status: "success",
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'] || 'Unknown',
      metadata: {
        ResendMethod: "email",
        timestamp: new Date().toISOString()
      }
    })

    await securityLog.save();

    // then send otp to user email

    // return success message
    return res.status(200).json({ message: "OTP sent successfully" });
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

export default ResendOtp;
