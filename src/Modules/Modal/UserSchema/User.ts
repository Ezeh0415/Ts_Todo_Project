import { Schema, Document, model } from "mongoose";
import { string } from "zod";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  otp: string;
  otpExpire: Date;
  role: string;
  status: string;
  refreshToken: string;
}

export const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    otp: { type: String, default: "" },
    otpExpire: { type: Date, default: ""},
    role: { type: String, required: true, default: "user" },
    status: { type: String, required: true, default: "active" },
    refreshToken: { type: string, default: "" },
  },
  { timestamps: true },
);

export const UserModel = model<IUser>("User", UserSchema);
