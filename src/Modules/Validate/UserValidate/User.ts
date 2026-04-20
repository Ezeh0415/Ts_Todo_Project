import { z } from "zod";

export const createUserValidation = z.object({
  name: z.string().min(3).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  otp: z.string().min(6).optional(),
  role: z.enum(["admin", "user", "moderator"]).optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
});


export  const updateUserValidation = createUserValidation.partial();

export type CreateUserInput = z.infer<typeof createUserValidation>;
export type UpdateUserInput = z.infer<typeof updateUserValidation>;