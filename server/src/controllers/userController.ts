//import connection from "../models/db.js";
import connection from "../models/db.js";
import { Request, Response } from 'express';

export const getUser = async (req: Request, res: Response) => {
    const consult = 'SELECT * FROM usuario';
    try {
        const [results] = await connection.query(consult);
        res.json(results); // ← respondés al cliente
    } catch(e) {
        res.status(500).json({ error: e });
    }
}