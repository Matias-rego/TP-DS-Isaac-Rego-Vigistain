import { Request, Response } from 'express';
import prisma from '@/database/prisma.js';
import jwt from 'jsonwebtoken';
import enviarMailResetPassword from '@/service/mailRec.service.js';
import bcrypt from 'bcrypt';
import { config } from '@/utils/config.js';
import { AccessTokenPayload, ResetPasswordPayload } from './auth.type.js'

export const loginUser = async (req: Request, res: Response) => {
    const { username, password } = req.body;
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
        })
            .json({ token });

    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error });
    }
}

export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
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

        console.error('Error en forgotPassword:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

export const resetPassword = async (req: Request, res: Response) => {
    const token = String(req.params.token);
    const { password } = req.body;

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