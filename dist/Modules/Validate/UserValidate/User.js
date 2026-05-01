"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserValidation = exports.createUserValidation = void 0;
const zod_1 = require("zod");
exports.createUserValidation = zod_1.z.object({
    name: zod_1.z.string().min(3).max(100),
    email: zod_1.z.string().email("invalid email address").transform(email => email.toLowerCase()),
    password: zod_1.z.string()
        .min(6, 'Password must be at least 6 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    otp: zod_1.z.string().min(6).optional(),
    role: zod_1.z.enum(["admin", "user", "moderator"]).optional(),
    status: zod_1.z.enum(["active", "inactive", "suspended"]).optional(),
});
exports.updateUserValidation = exports.createUserValidation.partial();
