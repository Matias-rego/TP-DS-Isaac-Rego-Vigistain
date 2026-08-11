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
});

export type RegisterDto = z.infer<typeof registerSchema>;