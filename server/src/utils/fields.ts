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

export const email = z
    .email({
        error: "Email is required",
    })

export const clientName = z
    .string({
        error: "Client name is required",
    })
    .trim()
    .min(3, "Client name must be at least 3 characters long")
    .max(100, "Client name cannot be longer than 100 characters")

export const cuit = z
    .string()
    .trim()
    // Acepta "20-12345678-9" o "20123456789" y lo normaliza a solo dígitos
    .transform((val) => val.replace(/[-\s]/g, ""))
    .refine((val) => /^\d{11}$/.test(val), {
        error: "CUIT must have 11 numeric digits",
    })
    .refine((val) => {
        // Algoritmo de módulo 11 para el dígito verificador
        const digitos = val.split("").map(Number);
        const multiplicadores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
        const resto = (digitos
            .slice(0, 10)
            .reduce((acc, digito, i) => acc + digito * multiplicadores[i], 0)
        ) % 11;
        const verificadorEsperado = resto === 0 ? 0 : 11 - resto;

        if (verificadorEsperado === 10) return false;
        return verificadorEsperado === digitos[10];
    }, {
        error: "CUIT is invalid (incorrect check digit)",
    });

export const phone = z.e164({
    error: "Invalid phone number",
    });