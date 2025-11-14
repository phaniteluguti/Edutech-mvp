import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from './config/env';
import { corsOptions } from './config/cors';
import { requestLogger } from './middleware/logger';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import router from './routes';
import { logger } from './utils/logger';
import prisma from './lib/prisma';
import './lib/redis'; // Initialize Redis connection

const app: Express = express();
const httpServer = createServer(app);

// Socket.IO setup for real-time sync
const io = new Server(httpServer, {
  cors: {
    origin: corsOptions.origin,
    credentials: corsOptions.credentials,
  },
});

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());
app.use(requestLogger);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/', apiLimiter);

// Routes
app.use(router);

// Socket.IO event handlers
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });

  // Test sync events
  socket.on('test:sync', (data) => {
    logger.info('Test sync event received', data);
    // Will implement sync logic later
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  httpServer.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});

// Start server
httpServer.listen(config.PORT, () => {
  logger.info(`🚀 Backend server running on port ${config.PORT}`);
  logger.info(`Environment: ${config.NODE_ENV}`);
  logger.info(`Frontend URL: ${config.FRONTEND_URL}`);
  logger.info(`AI Service URL: ${config.AI_SERVICE_URL}`);
});

export { app, io };
