import { z } from "zod";

export const LoginForm = z
  .object({
    username_email: z.string().min(1, { message: "Email is required" }).max(50),
    password: z
      .string()
      .min(6, { message: "Password is required" })
      .max(24)
      .refine(
        (value) => /(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()\-__+.])/.test(value),
        "Incorrect Password",
      ),
  });

export type LoginForm = z.infer<typeof LoginForm>;
