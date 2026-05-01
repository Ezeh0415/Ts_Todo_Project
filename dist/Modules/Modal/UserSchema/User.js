"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = exports.UserSchema = void 0;
const mongoose_1 = require("mongoose");
const zod_1 = require("zod");
exports.UserSchema = new mongoose_1.Schema({
    googleId: { type: zod_1.string },
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
    refreshToken: { type: zod_1.string, default: "" },
}, { timestamps: true });
exports.UserModel = (0, mongoose_1.model)("User", exports.UserSchema);
