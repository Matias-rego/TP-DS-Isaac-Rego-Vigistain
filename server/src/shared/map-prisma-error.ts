// shared/map-prisma-error.ts
import { Prisma } from '@/generated/prisma/client.js';
import { ConflictError, HttpError, NotFoundError, ValidationError } from './http-errors.js';

export function mapPrismaError(err: unknown): HttpError | null {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case 'P2002':
                return new ConflictError('Ya existe un registro con ese valor');
            case 'P2025':
                return new NotFoundError();
            case 'P2003':
                return new ConflictError('El registro está relacionado con otros datos');
            case 'P2000':
                return new ValidationError(undefined, 'Un valor excede el largo permitido');
        }
    }
    if (err instanceof Prisma.PrismaClientValidationError) {
        return new ValidationError(undefined, 'Datos inválidos');
    }
    return null;
}