import express from 'express';
import cors from 'cors';
import routes from './api/routes.js';
import { config } from './utils/config.js';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { initWebSocket } from './websocket.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';
import { requestId } from './middlewares/requestId.middleware.js'; 
import { NotFoundError } from './shared/http-errors.js';

const app = express();
const httpServer = createServer(app);

initWebSocket(httpServer);

app.disable("x-powered-by");
app.use(requestId);
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

app.use((_req, _res, next) => next(new NotFoundError('Ruta no encontrada')));

app.use(errorHandler);

const server = httpServer.listen(config.PORT, () => {
    const address = server.address();
    if (address && typeof address !== "string") {
        console.log(`Servidor: http://${address.address}:${address.port}`);
    }
});

function shutdown(signal: string) {
    console.log(`\n${signal} received, shutting down server...`);
    server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
    });

    // In case something is left hanging (open connections, etc.)
    setTimeout(() => {
        console.error('Forcing shutdown after timeout.');
        process.exit(1);
    }, 10000).unref();
}

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled rejection:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    shutdown('uncaughtException');
});