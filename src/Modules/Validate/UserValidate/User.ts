import { z } from "zod";

export const createUserValidation = z.object({
  name: z.string().min(3).max(100),
  email: z.string().email("invalid email address").transform(email => email.toLowerCase()),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  otp: z.string().min(6).optional(),
  role: z.enum(["admin", "user", "moderator"]).optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
});


export const updateUserValidation = createUserValidation.partial();

export type CreateUserInput = z.infer<typeof createUserValidation>;
export type UpdateUserInput = z.infer<typeof updateUserValidation>;