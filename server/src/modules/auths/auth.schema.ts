import { z } from "zod";
import { username, password, email } from "@/utils/fields.js";

export const loginSchema = z.object({
    username: username,
    password: password
}).strict();

export type LoginDto = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
    username: username,
    password: password,
    email: email,
}).strict();

export type RegisterDto = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
    email: email,
}).strict();

export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
    password: password,
}).strict();

export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;