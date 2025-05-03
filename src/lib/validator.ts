import { z } from "zod";

// Email validation schema
export const emailSchema = z
  .string()
  .email("Please enter a valid email address");

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

// Username validation schema
export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be at most 20 characters")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Username can only contain letters, numbers, underscores, and hyphens",
  );

// User schema for sign up
export const signUpSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

// User schema for sign in
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;

// Function to validate form fields
export function validateField<T>(schema: z.ZodType<T>, value: T) {
  try {
    schema.parse(value);
    return { valid: true, error: "" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0].message };
    }
    return { valid: false, error: "Invalid input" };
  }
}
