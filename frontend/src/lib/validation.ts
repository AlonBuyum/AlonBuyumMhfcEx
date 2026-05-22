import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email").trim(),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email").trim(),
  name: z.string().min(1, "Name is required").max(100, "Name too long").trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password too long"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
