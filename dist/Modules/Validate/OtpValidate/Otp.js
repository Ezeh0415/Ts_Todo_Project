"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserOtpValidation = void 0;
const zod_1 = require("zod");
exports.createUserOtpValidation = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address").transform(email => email.toLowerCase()),
    otp: zod_1.z
        .string()
        .length(6, "OTP must be exactly 6 characters")
        .regex(/^[a-zA-Z0-9!@#$%^&*()]{6}$/, "OTP can only contain letters (A-Z, a-z), numbers (0-9), and special characters (!@#$%^&*())"),
});
