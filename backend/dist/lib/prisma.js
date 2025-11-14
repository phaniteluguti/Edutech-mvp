"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const env_1 = require("../config/env");
const prismaClientSingleton = () => {
    return new client_1.PrismaClient({
        log: env_1.config.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
};
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
exports.default = prisma;
if (env_1.config.NODE_ENV !== 'production')
    globalThis.prismaGlobal = prisma;
//# sourceMappingURL=prisma.js.map