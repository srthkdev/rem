import { z } from "zod";

// Email validation schema
export const emailSchema = z.string().email({
  message: "Please enter a valid email address",
});

// Password validation schema
export const passwordSchema = z.string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .refine((password) => /[A-Z]/.test(password), {
    message: "Password must contain at least one uppercase letter",
  })
  .refine((password) => /[a-z]/.test(password), {
    message: "Password must contain at least one lowercase letter",
  })
  .refine((password) => /[0-9]/.test(password), {
    message: "Password must contain at least one number",
  });

// User schema for sign up
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// User schema for sign in
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Password is required" }),
});

// Function to validate form fields
export const validateField = (schema: z.ZodType<any>, value: any): { valid: boolean; error?: string } => {
  try {
    schema.parse(value);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0].message };
    }
    return { valid: false, error: "Invalid input" };
  }
}; 