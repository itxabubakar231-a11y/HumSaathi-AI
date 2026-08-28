import { PrismaClient } from '@prisma/client';

// Serverless-safe singleton: reuse PrismaClient across warm invocations
const globalForPrisma = globalThis;
const prisma = globalForPrisma.__prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prisma = prisma;
}

export default prisma;
