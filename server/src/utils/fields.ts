import { z } from "zod";
import { $Enums } from "@/database/prisma.js";

type EnumLike = { [k: string]: string | number };

export function enumSchema<const T extends readonly [string, ...string[]]>(
  values: T,
  label: string
): z.ZodEnum<{ [K in T[number]]: K }>;

export function enumSchema<T extends EnumLike>(
  values: T,
  label: string
): z.ZodEnum<T>;

export function enumSchema( values: readonly string[] | EnumLike,label: string): z.ZodType<string> {
  const options = Array.isArray(values) ? values : Object.values(values);

  return z.enum(values as [string, ...string[]], {
    error: `${label} debe ser uno de: ${options.join(", ")}`,
  });
}

export const toBoolean = (name: string) =>
    z.stringbool({
        truthy: ["1"],
        falsy: ["0"],
        case: "sensitive",
        error: `${name} debe ser "1" o "0"`,
    });


export const paymentMethod = enumSchema($Enums.EnumPaymentMethod, "El método de pago");

export const typeOfPayment = enumSchema($Enums.EnumPaymentType, "El tipo de pago");

export const tipo_equipment = enumSchema($Enums.EnumEquipmentType, "El tipo de equipo");

export const EnumRol = enumSchema($Enums.EnumRol, "El rol");

export const EnumOrderStatus = enumSchema($Enums.EnumOrderStatus, "El estado de la orden");

export const EnumBudgetStatus = enumSchema($Enums.EnumBudgetStatus, "El estado del presupuesto");

export const EnumFailureStatus = enumSchema($Enums.EnumFailureStatus, "El estado de la falla");

export const sortOrder = enumSchema(["asc", "desc"], "El orden" );

export const username = z
    .string({
        error: (issue) => {
            if (issue.code === "invalid_type") return "El nombre de usuario debe ser texto";
            return "El nombre de usuario es obligatorio";
        },
    })
    .trim()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
    .max(30, "El nombre de usuario no puede superar los 30 caracteres");

export const password = z
    .string({
        error: (issue) => {
            if (issue.code === "invalid_type") return "La contraseña debe ser texto";
            return "La contraseña es obligatoria";
        },
    })
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(100, "La contraseña no puede superar los 100 caracteres");

export const email = z
    .email({
        error: (issue) => {
            if (issue.code === "invalid_type") return "El email debe ser texto";
            if (issue.code === "invalid_format") return "El email no tiene un formato válido";
            return "El email es obligatorio";
        },
    });

export const name = z
    .string({
        error: (issue) => {
            if (issue.code === "invalid_type") return "El nombre debe ser texto";
            return "El nombre es obligatorio";
        },
    })
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede superar los 100 caracteres");

export const isActiveQuery = toBoolean("El estado activo");

export const cuit = z
    .string({
        error: (issue) => {
            if (issue.code === "invalid_type") return "El CUIT debe ser texto";
            return "El CUIT es obligatorio";
        },
    })
    .trim()
    // Acepta "20-12345678-9" o "20123456789" y lo normaliza a solo dígitos
    .transform((val) => val.replace(/[-\s]/g, ""))
    .refine((val) => /^\d{11}$/.test(val), {
        error: "El CUIT debe tener 11 dígitos numéricos",
        abort: true, // si el formato falla, no evalúa el dígito verificador (evita dos mensajes)
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
        error: "El CUIT no es válido",
    });

export const phone = z.e164({
    error: (issue) => {
        if (issue.code === "invalid_type") return "El teléfono debe ser texto";
        if (issue.code === "invalid_format") return "El teléfono debe estar en formato internacional (ej: +5493415551234)";
        return "El teléfono es obligatorio";
    },
});

export const cant_s = (name: string) => z
    .number({
        error: (issue) => {
            if (issue.code === "invalid_type") {
                return `${name} debe ser un número`;
            }

            return `${name} es obligatorio`;
        },
    })
    .int({
        error: `${name} debe ser un número entero`,
    })
    .nonnegative({
        error: `${name} debe ser cero o mayor`,
    });

export const cant_n = (name: string) => z.coerce
    .number({
        error: (issue) => {
            if (issue.code === "invalid_type") {
                return `${name} debe ser un número`;
            }

            return `${name} es obligatorio`;
        },
    })
    .int({
        error: `${name} debe ser un número entero`,
    })
    .nonnegative({
        error: `${name} debe ser cero o mayor`,
    });

export const page = z.coerce
    .number({
        error: (issue) => {
            if (issue.code === "invalid_type") {
                return "La página debe ser un número";
            }

            return "La página es obligatoria";
        },
    })
    .int({
        error: "La página debe ser un número entero",
    })
    .positive({
        error: "La página debe ser mayor a 0",
    });

export const limit = z.coerce
    .number({
        error: (issue) => {
            if (issue.code === "invalid_type") {
                return "El límite debe ser un número";
            }

            return "El límite es obligatorio";
        },
    })
    .int({
        error: "El límite debe ser un número entero",
    })
    .positive({
        error: "El límite debe ser mayor a 0",
    })
    .max(1000, "El límite no puede ser mayor a 1000");

export const id = z
    .uuidv7({
        error: (issue) => {
            if (issue.code === "invalid_type") return "El id debe ser texto";
            if (issue.code === "invalid_format") return "El id no es un UUID v7 válido";
            return "El id es obligatorio";
        },
    })


export const percentage = z
    .number({
        error: (issue) => {
            if (issue.code === "invalid_type") return "El porcentaje debe ser un número";
            return "El porcentaje es obligatorio";
        },
    })
    .min(0, "El porcentaje debe ser al menos 0")
    .max(100, "El porcentaje no puede ser mayor a 100");


export const brand = z
    .string({
        error: (issue) => {
            if (issue.code === "invalid_type") return "La marca debe ser texto";
            return "La marca es obligatoria";
        },
    })
    .trim()
    .min(1, "La marca debe tener al menos 1 caracter")
    .max(100, "La marca no puede superar los 100 caracteres");

export const model = z
    .string({
        error: (issue) => {
            if (issue.code === "invalid_type") return "El modelo debe ser texto";
            return "El modelo es obligatorio";
        },
    })
    .trim()
    .min(1, "El modelo debe tener al menos 1 caracter")
    .max(100, "El modelo no puede superar los 100 caracteres");

export const observations = z
    .string({
        error: (issue) => {
            if (issue.code === "invalid_type") return "Las observaciones deben ser texto";
            return "Las observaciones son obligatorias";
        },
    })
    .trim()
    .min(1, "Las observaciones deben tener al menos 1 caracter")
    .max(500, "Las observaciones no pueden superar los 500 caracteres");

export const description = z
    .string({
        error: (issue) => {
            if (issue.code === "invalid_type") return "La descripción debe ser texto";
            return "La descripción es obligatoria";
        },
    })
    .trim()
    .min(1, "La descripción debe tener al menos 1 caracter")
    .max(500, "La descripción no puede superar los 500 caracteres");

export const date = z.iso.date({
    error: (issue) => {
        if (issue.code === "invalid_type") return "La fecha debe ser texto";
        if (issue.code === "invalid_format") return "La fecha debe tener el formato AAAA-MM-DD";
        return "La fecha es obligatoria";
    },
});

export const url = z.url({
    error: (issue) => {
        if (issue.code === "invalid_type") return "La URL debe ser texto";
        if (issue.code === "invalid_format") return "La URL no es válida";
        return "La URL es obligatoria";
    },
});

export const price = z
    .number({
        error: (issue) => {
            if (issue.code === "invalid_type") return "El precio debe ser un número";
            return "El precio es obligatorio";
        },
    })
    .nonnegative({
        error: "El precio debe ser cero o mayor",
    });

export const isActive = z.boolean({
    error: (issue) => {
        if (issue.code === "invalid_type") return "El estado activo debe ser verdadero o falso";
        return "El estado activo es obligatorio";
    },
});

export const search = z
    .string({
        error: (issue) => {
            if (issue.code === "invalid_type") {
                return "La búsqueda debe ser texto";
            }

            return "La búsqueda es obligatoria";
        },
    })
    .trim()
    .min(1, "La búsqueda no puede estar vacía")
    .max(100, "La búsqueda no puede superar los 100 caracteres");
