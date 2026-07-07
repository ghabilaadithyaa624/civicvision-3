import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Must be a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long"),
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name is too long"),
    role: z.enum(["CITIZEN", "FIELD_AGENT", "ADMIN"]).optional(),
    adminSecret: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Must be a valid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

export type RegisterBody = z.infer<typeof registerSchema>["body"];
export type LoginBody = z.infer<typeof loginSchema>["body"];
