import express from 'express';
import cors from 'cors';
import routes from './api/endPoints.js';

const app = express();
const port = 3000;

app.use(cors(
    {
        origin: 'http://localhost:5173', // Cambia esto si tu frontend corre en otro puerto
        methods: ['GET', 'POST'], // Métodos permitidos
    }
));        // ← sin {} adentro si no pasás opciones
app.use(express.json()); // ← necesario para leer el body en POST
app.use(express.urlencoded({ extended: true })); // ← necesario para leer el body en POST con form-data 
app.use('/', routes);

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});