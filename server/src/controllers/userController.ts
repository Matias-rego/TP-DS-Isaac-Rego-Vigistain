//import connection from "../models/db.js";
import connection from "../models/db.js";
import { Request, Response } from 'express';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import enviarMailVerificador from '../service/mail.service.js';
import parseJwt from '../utils/toke.utils.js';


export const getUser = async (req: Request, res: Response) => {
    const consult = 'SELECT * FROM usuario WHERE nombre_usuario = ?';
    try {
        const [results] = await connection.query(consult, [req.params.username]);
        const rows = results as RowDataPacket[];
        if(rows.length > 0){
            res.json(rows); // ← respondés al cliente
        } else {
            res.status(404).json({ error: 'Usuario no encontrado' });
        }
    } catch(e) {
        console.log('Error en getUser:', e)
        res.status(500).json({ error: e });
    }
}

export const registerUser = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
 
    // Si el usuario subió foto, multer ya la mandó a Cloudinary y dejó la URL en req.file.path
    // Si no subió nada, req.file es undefined → guardamos null
    const fotoUrl = (req.file as any)?.path ?? null;
 
    const hashedPassword = await bcrypt.hash(password, 10);
 
    const consult = 'INSERT INTO usuario (nombre_usuario, email, password_hash, foto_url) VALUES (?, ?, ?, ?)';
 
    try {
        await connection.query(consult, [username, email, hashedPassword, fotoUrl]);
 
        const tokenVerificacion = jwt.sign({ username }, "Stack", { expiresIn: '24h' });
        await enviarMailVerificador(email, tokenVerificacion);
 
        res.json({ message: 'Usuario registrado exitosamente, valida tu cuenta a través del enlace enviado a tu correo electrónico' });
    } catch (e) {
        console.log('Error en registerUser:', e);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
};

export const validaUser = async (req: Request, res: Response) => {
    const { token } = req.params;
    const dataToken = parseJwt(token as string);
    if (!dataToken) {
        return res.status(400).json({ error: 'Token inválido' });
    }
    const { username } = dataToken;
    const consult = 'UPDATE usuario SET activo = ? WHERE nombre_usuario = ?';
    try {
        const [result]: any = await connection.query(consult, ['1', username]);

        if (result.affectedRows === 0) {
            return res.redirect('http://localhost:5173/login?error=Usuario no encontrado');
        }
        res.redirect('http://localhost:5173/login?success=Cuenta validada exitosamente. Ya puedes iniciar sesión.');

    } catch (e) {
        console.log('Error en validaUser:', e);
        res.redirect('http://localhost:5173/login?error=Error interno al validar la cuenta');
    }
}
