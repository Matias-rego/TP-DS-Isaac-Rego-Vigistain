// shared/errors/http-errors.ts
export type ErrorCode =
    | 'VALIDATION_ERROR'
    | 'BAD_REQUEST'
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'NOT_FOUND'
    | 'CONFLICT'
    | 'PAYLOAD_TOO_LARGE'
    | 'INTERNAL_ERROR';

export class HttpError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly code: ErrorCode = 'INTERNAL_ERROR',
        public readonly details?: unknown,
    ) {
        super(message);
        this.name = new.target.name;
    }
}

export class ValidationError extends HttpError {
    constructor(details?: unknown, message = 'Datos inválidos') {
        super(message, 400, 'VALIDATION_ERROR', details);
    }
}

export class UnauthorizedError extends HttpError {
    constructor(message = 'No autenticado') {
        super(message, 401, 'UNAUTHORIZED');
    }
}

export class ForbiddenError extends HttpError {
    constructor(message = 'No tenés permisos para realizar esta acción') {
        super(message, 403, 'FORBIDDEN');
    }
}

export class NotFoundError extends HttpError {
    constructor(message = 'Recurso no encontrado') {
        super(message, 404, 'NOT_FOUND');
    }
}

export class ConflictError extends HttpError {
    constructor(message = 'El recurso ya existe') {
        super(message, 409, 'CONFLICT');
    }
}
export class BadRequestError extends HttpError {
    constructor(message = 'Solicitud inválida', details?: unknown) {
        super(message, 400, 'BAD_REQUEST', details);
    }
}