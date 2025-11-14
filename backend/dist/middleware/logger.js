"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
// Custom token to log request body size
morgan_1.default.token('body-size', (req) => {
    return req.headers['content-length'] || '0';
});
// Create format string
const morganFormat = env_1.config.NODE_ENV === 'development'
    ? ':method :url :status :res[content-length] - :response-time ms'
    : ':remote-addr :method :url :status :res[content-length] - :response-time ms';
// Create morgan middleware that logs through Winston
exports.requestLogger = (0, morgan_1.default)(morganFormat, {
    stream: {
        write: (message) => {
            logger_1.logger.info(message.trim());
        },
    },
    skip: (req) => {
        // Skip health check logs to reduce noise
        return req.url === '/health' || req.url === '/api/health';
    },
});
//# sourceMappingURL=logger.js.map