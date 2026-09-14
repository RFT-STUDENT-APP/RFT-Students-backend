import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'test.student@example.com';
  const password = 'password123';
  const passwordHash = await bcrypt.hash(password, 10);

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: 'Test Student',
        role: 'STUDENT',
        status: 'ACTIVE',
      },
    });
    console.log('Created test user:', email);
  } else {
    // update password just in case
    await prisma.user.update({
       where: { email },
       data: { passwordHash }
    });
    console.log('Test user already exists, updated password:', email);
  }
}

main().catch(console.error).finally(() => pool.end());
