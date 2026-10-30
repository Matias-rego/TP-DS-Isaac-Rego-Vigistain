import type { ErrorRequestHandler } from 'express';
import { z, ZodError } from 'zod'
import { config } from '@/utils/config.js';
import { HttpError, ValidationError, type ErrorCode } from '@/shared/http-errors.js';
import { mapPrismaError } from '@/shared/map-prisma-error.js';

// El error de body-parser (express.json) no viene tipado como una clase propia,
// así que extendemos el shape que realmente trae en runtime.
interface BodyParserError extends Error {
    status?: number;
    statusCode?: number;
    type?: string; // 'entity.parse.failed' cuando el JSON está mal formado
    expose?: boolean;
}

function codeFromStatus(status: number): ErrorCode {
    if (status === 413) return 'PAYLOAD_TOO_LARGE';
    return 'BAD_REQUEST';
}

/** Convierte cualquier error conocido en HttpError. Devuelve null si es inesperado. */
function normalize(err: BodyParserError): HttpError | null {
    if (err instanceof HttpError) return err;

    if (err instanceof ZodError) {
        return new ValidationError(z.flattenError(err).fieldErrors);
    }

    // Errores de body-parser (JSON inválido, body demasiado grande, etc.)
    if (err.type === 'entity.parse.failed') {
        return new ValidationError(undefined, 'El cuerpo de la petición no es un JSON válido');
    }
    const status = err.status ?? err.statusCode;
    if (err.expose && status && status >= 400 && status < 500) {
        return new HttpError(err.message, status, codeFromStatus(status));
    }

    return mapPrismaError(err);
}

export const errorHandler: ErrorRequestHandler = (err: BodyParserError, req, res, next) => {
    if (res.headersSent) return next(err);

    const known = normalize(err);
    const httpError = known ?? new HttpError('Error interno del servidor', 500, 'INTERNAL_ERROR');

    // Lo inesperado y los 5xx se loguean completos; los errores "normales" (404, 409...) no ensucian el log
    if (!known || httpError.status >= 500) {
        console.error(`[${req.id}] ${req.method} ${req.originalUrl}`, err);
    }

    // En desarrollo, los errores inesperados incluyen el mensaje real (como hacías antes)
    const details =
        !known && config.NODE_ENV !== 'production' ? err.message : (httpError.details ?? null);

    res.status(httpError.status).json({
        error: {
            code: httpError.code,
            message: httpError.message,
            details,
            requestId: req.id,
        },
    });
};