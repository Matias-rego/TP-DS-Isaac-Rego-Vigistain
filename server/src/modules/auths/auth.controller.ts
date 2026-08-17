import type { NextFunction, Request, Response } from 'express';
import prisma from '@/database/prisma.js';
import jwt from 'jsonwebtoken';
import enviarMailResetPassword from '@/service/mailRec.service.js';
import bcrypt from 'bcrypt';
import { config } from '@/utils/config.js';
import type { AccessTokenPayload, ResetPasswordPayload } from './auth.type.js'
import enviarMailVerificador from '@/service/mail.service.js';
import { EnumRol } from "@/generated/prisma/browser.js";
import type { ForgotPasswordDto, LoginDto, RegisterDto, ResetPasswordDto } from './auth.schema.js';


interface DecodedToken {
    userName: string;
}

export const validateAccountController = async (req: Request, res: Response) => {
    const token = req.params.token;

    if (typeof token !== 'string') {
        return res.status(400).json({
            success: false,
            message: "El token proporcionado no es válido."
        });
    }

    const result = await validateAccount(token);

    if (!result.success) {
        return res.status(400).json(result);
    }

    return res.status(200).json(result);
};

async function validateAccount(token: string) {
    try {

        const decoded = jwt.verify(token, config.JWT_SECRET) as DecodedToken;

        if (!decoded || !decoded.userName) {
            throw new Error("Token inválido o no contiene el ID de usuario");
        }

        const userN = decoded.userName;

        // 2. Actualizar el estado del usuario a 1 en la base de datos con Prisma
        const usuarioActualizado = await prisma.user.update({
            where: {
                userName: userN,
            },
            data: {
                status: true,
            },
        });

        console.log(`Usuario con Nombre ${userN} validado correctamente.`);
        return {
            success: true,
            message: "Cuenta validada con éxito",
            usuario: usuarioActualizado
        };

    } catch (error: unknown) {
        const message =
            error instanceof Error
                ? error.message
                : "Error interno al validar la cuenta";

        console.error("Error al validar la cuenta:", message);

        return {
            success: false,
            message
        };
    }
}


export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    const { username, password }: LoginDto = req.body;
    try {
        // Reemplaza el SELECT * FROM usuario WHERE nombre_usuario = ?
        const user = await prisma.user.findFirst({
            where: { userName: username }
        });

        if (!user) {
            res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
            return;
        }

        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) {
            res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
            return;
        }

        if (!user.status) {
            res.status(403).json({ message: 'Usuario inactivo. Revise su email para activar su cuenta.' });
            return;
        }

        if (!user.validationStatus) {
            res.status(403).json({ message: 'Su cuenta se encuentra activa, espere la validacion del administrador para poder iniciar sesión.' });
            return;
        }

        const token = jwt.sign(
            { id: user.id_user, userName: user.userName, rol: user.rol } as AccessTokenPayload,
            config.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.cookie('access_token', token, {
            httpOnly: true,
            secure: config.NODE_ENV === 'production', // Solo en producción
            sameSite: 'lax', // el sameSite puede ser 'strict', 'lax' o 'none' dependiendo de tus necesidades
            maxAge: 3600000, // 1 hora
        }).json({ message: 'Login successful', });

    } catch (error) {
        next(error);
    }
}

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { email }: ForgotPasswordDto = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(404).json({ error: 'Usuario no encontrado' });
            return;
        }
        const resetToken = jwt.sign({ id_user: user.id_user, userName: user.userName } as ResetPasswordPayload, config.JWT_SECRET + user.password_hash, { expiresIn: '1h' });
        await enviarMailResetPassword(email, resetToken);

        if (!user) {
            res.status(404).json({ error: 'Usuario no registrado con ese email' });
            return;
        }
        res.status(200).json({ message: 'Correo de recuperación enviado' });
    } catch (error) {
        next(error);
    }
}


export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
    const { username, email, password }: RegisterDto = req.body;

    const userCount = await prisma.user.count();
    const role = userCount === 0 ? EnumRol.admin : EnumRol.tecnico;    
    const adminValidation = role === EnumRol.admin ? true : false;
    // Si el usuario subió foto, multer ya la mandó a Cloudinary y dejó la URL en req.file.path
    // Si no subió nada, req.file es undefined → guardamos null
    const fotoUrl = (req.file)?.path;

    const hashedPassword = await bcrypt.hash(password, 10);

    const data = {
        userName: username,
        email: email,
        password_hash: hashedPassword,
        rol: role,
        status: false,
        ...(fotoUrl && { urlPicture: fotoUrl }),
        validationStatus: adminValidation,
    };

        await prisma.user.create({ data });

        const tokenVerificacion = jwt.sign({ userName: username }, config.JWT_SECRET, { expiresIn: '24h' });
        await enviarMailVerificador(email, tokenVerificacion);

        res.json({ message: 'Usuario registrado exitosamente, valida tu cuenta a través del enlace enviado a tu correo electrónico' });
    } catch (error) {
        next(error);
    }
};


export const resetPassword = async (req: Request, res: Response, _next: NextFunction) => {
    const token = String(req.params.token);
    const { password }: ResetPasswordDto = req.body;

    if (typeof password !== 'string' || password.length < 8) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }
    if (password.length > 72) {
        return res.status(400).json({ error: 'La contraseña es demasiado larga' });
    }

    try {
        const decoded = jwt.decode(token) as ResetPasswordPayload;

        if (!decoded?.id_user) {
            return res.status(400).json({ error: 'Token inválido' });
        }

        const user = await prisma.user.findUnique({
            where: { id_user: decoded.id_user }
        });
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

        jwt.verify(token, (config.JWT_SECRET + user.password_hash) as string); // ← as string

        const newHash = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { id_user: decoded.id_user },
            data: { password_hash: newHash }
        });

        res.json({ message: 'Contraseña actualizada correctamente' });

    } catch (e) {
        console.error('Error en resetPassword:', e);
        res.status(400).json({ error: 'El enlace es inválido o ya expiró' });
    }
};

export const getMe = async (req: Request, res: Response) => {

    const user = await prisma.user.findUnique({
        where: {
            id_user: req.user?.id
        },
        select: {
            id_user: true,
            userName: true,
            email: true,
            rol: true,
            urlPicture: true,
            status: true
        }
    });

    if (!user) {
        return res.status(404).json({
            message: "Usuario no encontrado"
        });
    }

    return res.json(user);
};

export const logout = (req: Request, res: Response) => {
    res.clearCookie('access_token').json({ message: 'Logout successful' })
};