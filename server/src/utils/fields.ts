import { z } from "zod";
import { $Enums } from "@/database/prisma.js";

export const username = z
    .string({
        error: (issue) => {
            if (issue.code === "invalid_type") return "Username must be a string";
            return "Username is required";
        },
    })
    .trim()
    .min(3, "Username must be at least 3 characters long")
    .max(30, "Username cannot be longer than 30 characters");

export const password = z
    .string({
        error: (issue) => {
            if (issue.code === "invalid_type") return "Password must be a string";
            return "Password is required";
        },
    })
    .min(6, "Password must be at least 6 characters long")
    .max(100, "Password cannot be longer than 100 characters");

export const email = z
    .email({
        error: (issue) => {
            if (issue.code === "invalid_type") return "Email must be a string";
            if (issue.code === "invalid_format") return "Email must be a valid email address";
            return "Email is required";
        },
    });

export const name = z
    .string({
        error: (issue) => {
            if (issue.code === "invalid_type") return "Name must be a string";
            return "Name is required";
        },
    })
    .trim()
    .min(3, "Name must be at least 3 characters long")
    .max(100, "Name cannot be longer than 100 characters");

export const cuit = z
    .string({
        error: (issue) => {
            if (issue.code === "invalid_type") return "CUIT must be a string";
            return "CUIT is required";
        },
    })
    .trim()
    // Acepta "20-12345678-9" o "20123456789" y lo normaliza a solo dígitos
    .transform((val) => val.replace(/[-\s]/g, ""))
    .refine((val) => /^\d{11}$/.test(val), {
        error: "CUIT must contain 11 numeric digits",
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
        error: "CUIT is invalid",
    });

export const phone = z.e164({
    error: (issue) => {
        if (issue.code === "invalid_type") return "Phone must be a string";
        return "Phone is required";
    },
});

export const cant = z
    .number({
        error: (issue) => {
            if (issue.code === "invalid_type") return "Cant must be a number";
            return "Cant is required";
        },
    })
    .int({
        error: "Cant must be an integer",
    })
    .nonnegative({
        error: "Cant must be zero or greater",
    });

export const id = z.coerce
    .number({
        error: (issue) => {
            if (issue.code === "invalid_type") return "Id must be a number";
            return "Id is required";
        },
    })
    .int({
        error: "Id must be an integer",
    })
    .positive({
        error: "Id must be greater than 0",
    });

export const percentaje = z
    .number({
        error: (issue) => {
            if (issue.code === "invalid_type") return "Percentage must be a number";
            return "Percentage is required";
        },
    })
    .min(0, "Percentage must be at least 0")
    .max(100, "Percentage cannot be greater than 100");

export const paymentMethod = z.enum($Enums.EnumPaymentMethod, {
    error: `Payment method must be one of: ${Object.values($Enums.EnumPaymentMethod).join(", ")}`,
});

export const typeOfPayment = z.enum($Enums.EnumPaymentType, {
    error: `Type of payment must be one of: ${Object.values($Enums.EnumPaymentType).join(", ")}`,
});

export const tipo_equipment = z.enum($Enums.EnumEquipmentType, {
    error: `Equipment type must be one of: ${Object.values($Enums.EnumEquipmentType).join(", ")}`,
});

export const EnumRol = z.enum($Enums.EnumRol, {
    error: `Role must be one of: ${Object.values($Enums.EnumRol).join(", ")}`,
});

export const EnumOrderStatus = z.enum($Enums.EnumOrderStatus, {
    error: `Order status must be one of: ${Object.values($Enums.EnumOrderStatus).join(", ")}`,
});

export const EnumBudgetStatus = z.enum($Enums.EnumBudgetStatus, {
    error: `Budget status must be one of: ${Object.values($Enums.EnumBudgetStatus).join(", ")}`,
});

export const EnumFailureStatus = z.enum($Enums.EnumFailureStatus, {
    error: `Failure status must be one of: ${Object.values($Enums.EnumFailureStatus).join(", ")}`,
});

export const brand = z
    .string({
        error: (issue) => {
            if (issue.code === "invalid_type") return "Brand must be a string";
            return "Brand is required";
        },
    })
    .trim()
    .min(1, "Brand must be at least 1 character long")
    .max(100, "Brand cannot be longer than 100 characters");

export const model = z
    .string({
        error: (issue) => {
            if (issue.code === "invalid_type") return "Model must be a string";
            return "Model is required";
        },
    })
    .trim()
    .min(1, "Model must be at least 1 character long")
    .max(100, "Model cannot be longer than 100 characters");

export const observations = z
    .string({
        error: (issue) => {
            if (issue.code === "invalid_type") return "Observations must be a string";
            return "Observations is required";
        },
    })
    .trim()
    .min(1, "Observations must be at least 1 character long")
    .max(500, "Observations cannot be longer than 500 characters");

export const description = z
    .string({
        error: (issue) => {
            if (issue.code === "invalid_type") return "Description must be a string";
            return "Description is required";
        },
    })
    .trim()
    .min(1, "Description must be at least 1 character long")
    .max(500, "Description cannot be longer than 500 characters");

export const date = z.iso.date({
    error: (issue) => {
        if (issue.code === "invalid_type") return "Date must be a string";
        if (issue.code === "invalid_format") return "Date must be a valid date in YYYY-MM-DD format";
        return "Date is required";
    },
});

export const url = z.url({
    error: (issue) => {
        if (issue.code === "invalid_type") return "URL must be a string";
        if (issue.code === "invalid_format") return "URL must be a valid URL";
        return "URL is required";
    },
});

export const price = z
    .number({
        error: (issue) => {
            if (issue.code === "invalid_type") return "Price must be a number";
            return "Price is required";
        },
    })
    .nonnegative({
        error: "Price must be zero or greater",
    });

export const isActive = z.boolean({
    error: (issue) => {
        if (issue.code === "invalid_type") return "Is active must be a boolean";
        return "Is active is required";
    },
});