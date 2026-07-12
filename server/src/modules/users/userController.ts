import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import enviarMailVerificador from '@/service/mail.service.js';
import prisma from "@/database/prisma.js";
import { EnumRol } from "@/generated/prisma/browser.js";
import { config } from '@/utils/config.js';
import { AccessTokenPayload } from '@/modules/auths/auth.type.js';

export const getAllUsers = async (req: Request, res: Response) => { }

export const createUser = async (req: Request, res: Response) => { }

export const deleteUser = async (req: Request, res: Response) => { }

export const getUser = async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id_user: Number(req.params.id_user) }
        });

        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

        res.json(user); // ← objeto directo, sin array
    } catch (e) {
        console.error('Error en getUser:', e);
        res.status(500).json({ error: 'Error interno' });
    }
};

export const registerUser = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    // Si el usuario subió foto, multer ya la mandó a Cloudinary y dejó la URL en req.file.path
    // Si no subió nada, req.file es undefined → guardamos null
    const fotoUrl = (req.file as any)?.path;

    const hashedPassword = await bcrypt.hash(password, 10);

    const data: any = {
        userName: username,
        email: email,
        password_hash: hashedPassword,
        rol: EnumRol.tecnico,
        status: false,
    };

    if (fotoUrl) {
        data.urlPicture = fotoUrl;
    }

    //const consult = 'INSERT INTO usuario (nombre_usuario, email, password_hash, foto_url) VALUES (?, ?, ?, ?)';


    try {
        await prisma.user.create({ data });

        const tokenVerificacion = jwt.sign({ userName: username }, config.JWT_SECRET, { expiresIn: '24h' });
        await enviarMailVerificador(email, tokenVerificacion);

        res.json({ message: 'Usuario registrado exitosamente, valida tu cuenta a través del enlace enviado a tu correo electrónico' });
    } catch (e) {
        console.log('Error en registerUser:', e);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
};

export const validaUser = async (req: Request, res: Response) => {
    const { token } = req.params as AccessTokenPayload;
    const dataToken = jwt.verify(token, config.JWT_SECRET)
    if (!dataToken) {
        return res.status(400).json({ error: 'Token inválido' });
    }
    const { userName } = dataToken;
    const loginPath = `${config.FRONTEND_URL}/login`;
    try {
        const rta = await prisma.user.update({
            where: ({ userName: userName }),
            data: ({ status: true })
        })


        if (!rta) {
            return res.redirect(`${loginPath}?error=Usuario no encontrado`);
        }
        res.redirect(`${loginPath}?success=Cuenta validada exitosamente. Ya puedes iniciar sesión.`);

    } catch (e) {
        console.log('Error en validaUser:', e);
        res.redirect(`${loginPath}?error=Error interno al validar la cuenta`);
    }
}


export const modifyUser = async (req: Request, res: Response) => {
    const fotoUrl = (req.file as any)?.path ?? null;

    const data: any = {};
    if (req.body.username) data.userName = req.body.username;
    if (req.body.email) data.email = req.body.email;
    if (fotoUrl) data.urlPicture = fotoUrl;

    if (Object.keys(data).length === 0) {
        return res.status(400).json({ error: 'No hay datos para actualizar' });
    }

    try {
        const rta = await prisma.user.update({
            where: { id_user: Number(req.params.id) },
            data
        });
        res.json({
            user: rta,
            success: 'Usuario modificado exitosamente'
        });
    } catch (e) {
        console.error('Error en modifyUser:', e);
        res.status(500).json({ error: 'Error al modificar usuario' });
    }
};