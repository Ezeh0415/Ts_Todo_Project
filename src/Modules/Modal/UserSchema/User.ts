import { Schema, Document, model } from "mongoose";
import { string } from "zod";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  otp: string;
  otpExpire: Date;
  otpAdded: boolean;
  role: string;
  status: string;
  loginFailedCount: number;
  lockedUntil: Date | null;
  refreshToken: string;
}

export const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    otp: { type: String, default: "" },
    otpExpire: { type: Date, default: "" },
    otpAdded: { type: Boolean, default: "false" },
    role: { type: String, required: true, default: "user" },
    status: { type: String, required: true, default: "active" },
    loginFailedCount: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: "" },
    refreshToken: { type: string, default: "" },
  },
  { timestamps: true },
);

export const UserModel = model<IUser>("User", UserSchema);
