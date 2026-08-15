import express from 'express';
import cors from 'cors';
import routes from './api/routes.js';
import { config } from './utils/config.js';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { initWebSocket } from './websocket.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';

const app = express();
const httpServer = createServer(app);

initWebSocket(httpServer);

app.disable("x-powered-by");
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

app.use(( _, res: express.Response) => {
    res.status(404).json({ message: 'Resource not found' });
});

app.use(errorHandler);

const server = httpServer.listen(config.PORT, () => {
    const address = server.address();
    if (address && typeof address !== "string") {
        console.log(`Servidor: http://${address.address}:${address.port}`);
    }
});