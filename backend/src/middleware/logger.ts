import morgan from 'morgan';
import { config } from '../config/env';
import { logger } from '../utils/logger';

// Custom token to log request body size
morgan.token('body-size', (req: any) => {
  return req.headers['content-length'] || '0';
});

// Create format string
const morganFormat =
  config.NODE_ENV === 'development'
    ? ':method :url :status :res[content-length] - :response-time ms'
    : ':remote-addr :method :url :status :res[content-length] - :response-time ms';

// Create morgan middleware that logs through Winston
export const requestLogger = morgan(morganFormat, {
  stream: {
    write: (message: string) => {
      logger.info(message.trim());
    },
  },
  skip: (req) => {
    // Skip health check logs to reduce noise
    return req.url === '/health' || req.url === '/api/health';
  },
});
