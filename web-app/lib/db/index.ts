import { PrismaNeon } from '@prisma/adapter-neon';
import 'dotenv/config';
import { PrismaClient } from './prisma/generated/client';

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaNeon({ connectionString });
export const prisma = new PrismaClient({ adapter });
