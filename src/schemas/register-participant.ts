import { z } from "zod";

export const ParticipantRegisterForm = z
  .object({
    email: z
      .string()
      .email({ message: "Email is required" }),
    name: z
      .string()
      .min(1, { message: "Username is required" })
      .max(50),
    password: z
      .string()
      .min(6, { message: "Password is too short" })
      .max(24, { message: "Password is too long" })
      .refine(
        (value) => /(?=.*[A-Z])/.test(value),
        "Password should contain at least one uppercase character",
      )
      .refine(
        (value) => /(?=.*[a-z])/.test(value),
        "Password should contain at least one lowercase character",
      )
      .refine(
        (value) => /(?=.*\d)/.test(value),
        "Password should contain at least one digit",
      )
      .refine(
        (value) => /(?=.*[!@#$%^&*()\-__+.])/.test(value),
        "Password should contain at least one special character",
      ),
    confirmPassword: z
      .string()
      .min(6, { message: "Please confirm your password" })
      .max(24),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "The passwords did not match",
      });
    }
  });

export type ParticipantRegisterForm = z.infer<typeof ParticipantRegisterForm>;