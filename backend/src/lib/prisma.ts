import { PrismaClient } from '@prisma/client';
import { config } from '../config/env';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: config.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (config.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
