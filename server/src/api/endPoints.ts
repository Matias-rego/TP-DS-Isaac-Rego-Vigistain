import express from 'express';
// Quitamos el 'import type' si no lo vas a usar acá mismo, 
// pero si lo necesitás, recordá que va arriba.
import { getUser } from "../controllers/userController.js";
import { loginUser } from "../controllers/loginController.js";

const router = express.Router();

router.get('/obtener', getUser);

router.post('/Login', loginUser);

// Exportación moderna
export default router;