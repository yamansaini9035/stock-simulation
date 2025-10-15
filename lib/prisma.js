import { PrismaClient } from '@prisma/client';

let prismaGlobal;

if (process.env.NODE_ENV !== 'production') {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient();
  }
  prismaGlobal = global.__prisma;
} else {
  prismaGlobal = new PrismaClient();
}

export const prisma = prismaGlobal;






