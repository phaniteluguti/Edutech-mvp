"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const env_1 = require("./config/env");
const cors_2 = require("./config/cors");
const logger_1 = require("./middleware/logger");
const rateLimiter_1 = require("./middleware/rateLimiter");
const errorHandler_1 = require("./middleware/errorHandler");
const notFoundHandler_1 = require("./middleware/notFoundHandler");
const routes_1 = __importDefault(require("./routes"));
const logger_2 = require("./utils/logger");
const prisma_1 = __importDefault(require("./lib/prisma"));
require("./lib/redis"); // Initialize Redis connection
const app = (0, express_1.default)();
exports.app = app;
const httpServer = (0, http_1.createServer)(app);
// Socket.IO setup for real-time sync
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: cors_2.corsOptions.origin,
        credentials: cors_2.corsOptions.credentials,
    },
});
exports.io = io;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)(cors_2.corsOptions));
app.use((0, compression_1.default)());
app.use(logger_1.requestLogger);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Rate limiting
app.use('/api/', rateLimiter_1.apiLimiter);
// Routes
app.use(routes_1.default);
// Socket.IO event handlers
io.on('connection', (socket) => {
    logger_2.logger.info(`Client connected: ${socket.id}`);
    socket.on('disconnect', () => {
        logger_2.logger.info(`Client disconnected: ${socket.id}`);
    });
    // Test sync events
    socket.on('test:sync', (data) => {
        logger_2.logger.info('Test sync event received', data);
        // Will implement sync logic later
    });
});
// Error handling
app.use(notFoundHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
// Graceful shutdown
process.on('SIGTERM', async () => {
    logger_2.logger.info('SIGTERM received, shutting down gracefully');
    httpServer.close(async () => {
        await prisma_1.default.$disconnect();
        process.exit(0);
    });
});
// Start server
httpServer.listen(env_1.config.PORT, () => {
    logger_2.logger.info(`🚀 Backend server running on port ${env_1.config.PORT}`);
    logger_2.logger.info(`Environment: ${env_1.config.NODE_ENV}`);
    logger_2.logger.info(`Frontend URL: ${env_1.config.FRONTEND_URL}`);
    logger_2.logger.info(`AI Service URL: ${env_1.config.AI_SERVICE_URL}`);
});
//# sourceMappingURL=server.js.map