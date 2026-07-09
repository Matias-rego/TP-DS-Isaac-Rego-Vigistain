import express from 'express';
import cors from 'cors';
import routes from './api/routes.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(cors(
    {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE'], // Métodos permitidos
    }
));        
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use('/api/', routes);

const server = app.listen(process.env.PORT, () => {
    const address = server.address();

    if (address && typeof address !== "string") {
        console.log(`Servidor: http://${address.address}:${address.port}`);
    }
});