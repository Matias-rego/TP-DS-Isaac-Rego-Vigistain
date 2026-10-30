import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { $Enums } from "@/database/prisma.js";
import { config } from '@/utils/config.js';
import type { AccessTokenPayload } from "@/modules/auths/auth.type.js";
import { ForbiddenError, UnauthorizedError } from "@/shared/http-errors.js";

export const authenticate = (allowedRoles: $Enums.EnumRol[] = []) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const token = req.cookies?.access_token;

    if (!token) {
      throw new UnauthorizedError("Tenés que iniciar sesión para continuar");
    }

    let data: AccessTokenPayload;
    try {
      data = jwt.verify(token, config.JWT_SECRET) as AccessTokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError("Tu sesión expiró. Iniciá sesión nuevamente");
      }
      throw new UnauthorizedError("Sesión inválida");
    }

    // Guardar la información del usuario para los siguientes middlewares
    req.user = data;

    if (allowedRoles.length > 0 && !allowedRoles.includes(data.role)) {
      throw new ForbiddenError("No tenés permisos para acceder a este recurso");
    }

    next();
  };
};

export default authenticate;