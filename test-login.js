const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://libertyelec@localhost:5432/rft_students_backend'
    }
  }
});

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'admin@rft-student.edu' } });
  if (!user) {
    console.log("User not found in DB!");
    return;
  }
  console.log("User found:", user.email);
  
  const ok = await bcrypt.compare('SuperSecretAdmin123!', user.passwordHash);
  console.log("Password matches:", ok);
}

main().catch(console.error).finally(() => prisma.$disconnect());
