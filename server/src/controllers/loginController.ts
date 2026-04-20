import connection from "../models/db.js";
import { Request, Response } from 'express';
import { RowDataPacket } from 'mysql2';
import jwt from 'jsonwebtoken';
 
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body;
    const consult = 'SELECT * FROM usuario WHERE nombre_usuario = ? AND password_hash = ?';

    try {
        const [results] = await connection.query(consult, [username, password]);
        
        // results viene como RowDataPacket[], hay que castearlo
        const rows = results as RowDataPacket[];

        if (rows.length > 0) {
            const token = jwt.sign({username}, "Stack", {
                expiresIn: '3m' 
            });
            res.send({token});
        } else {
            res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }

    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error });
    }
}