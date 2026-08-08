import { z } from "zod";

export const username = z
        .string({
            error: "Username is required",
        })
        .trim()
        .min(3, "Username must be at least 3 characters long")
        .max(30, "Username cannot be longer than 30 characters")
export const password = z
        .string({
            error: "Password is required",
        })
        .min(6, "Password must be at least 6 characters long")
        .max(100, "Password cannot be longer than 100 characters")


