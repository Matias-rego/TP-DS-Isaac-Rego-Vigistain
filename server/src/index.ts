import express from 'express';
import cors from 'cors';
import routes from './api/routes.js';
import { config } from './utils/config.js';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cors(
    {
        origin: config.FRONTEND_URL,
        credentials: true,
        methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE'], // Métodos permitidos
    }
));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/', routes);

app.use(( _ , res: express.Response) => {
    res.status(404).json({ message: 'Resource not found' });
});

const server = app.listen(config.PORT, () => {
    const address = server.address();
    if (address && typeof address !== "string") {
        console.log(`Servidor: http://${address.address}:${address.port}`);
    }
});