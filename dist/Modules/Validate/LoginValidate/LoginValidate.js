"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginValidation = void 0;
const zod_1 = require("zod");
exports.loginValidation = zod_1.z.object({
    email: zod_1.z.string().email().transform(email => email.toLowerCase()),
    password: zod_1.z.string()
        .min(6, 'Password must be at least 6 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
});
