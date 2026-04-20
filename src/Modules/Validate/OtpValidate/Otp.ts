import { z } from "zod";

export const createUserOtpValidation = z.object({
  email: z.string().email("Invalid email address"),
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 characters")
    .regex(
      /^[a-zA-Z0-9!@#$%^&*()]{6}$/,
      "OTP can only contain letters (A-Z, a-z), numbers (0-9), and special characters (!@#$%^&*())",
    ),
});

export type VerifyOtpInput = z.infer<typeof createUserOtpValidation>;
