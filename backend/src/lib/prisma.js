import { PrismaClient } from '@prisma/client';

// Serverless-safe singleton: reuse PrismaClient across warm invocations
// In production serverless (Vercel), modules may be re-evaluated but globalThis persists
const globalForPrisma = globalThis;

if (!globalForPrisma.__prisma) {
  globalForPrisma.__prisma = new PrismaClient();
}

const prisma = globalForPrisma.__prisma;

export default prisma;
