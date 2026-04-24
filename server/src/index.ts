import express from 'express';
import cors from 'cors';
import routes from './api/endPoints.js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.development' }); // ← al inicio de todo


const app = express();
const port = 3000;

app.use(cors(
    {
        origin: `http://${process.env.FRONTEND_HOST}:${process.env.FRONTEND_PORT}`,
        methods: ['GET', 'POST'], // Métodos permitidos
    }
));        // ← sin {} adentro si no pasás opciones
app.use(express.json()); // ← necesario para leer el body en POST
app.use(express.urlencoded({ extended: true })); // ← necesario para leer el body en POST con form-data 
app.use('/', routes);

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});