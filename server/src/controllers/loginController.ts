import connection from "../models/db.js";
import { Request, Response } from 'express';
import { RowDataPacket } from 'mysql2';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
 
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body;
    const consult = 'SELECT * FROM usuario WHERE nombre_usuario = ?';

    try {
        const [results] = await connection.query(consult, [username]);

        const rows = results as RowDataPacket[];

        if (rows.length === 0) {
            res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
            return; 
        };
        const match = await bcrypt.compare(password, rows[0].password_hash);
        if(match){
            if(rows[0].activo === 0){
                res.status(403).json({ message: 'Usuario inactivo. Revise su email para activar su cuenta.' });
                return;
            }else{         
            const token = jwt.sign({username}, "Stack", {expiresIn: '2m'});
            res.json({ token });
            }
        }else{
            res.status(401).json({ message: 'Usuario o contraseña incorrectos' }); 
        }
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error });
    }
}