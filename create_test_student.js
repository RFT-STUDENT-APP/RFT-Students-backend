const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const email = 'test.student@example.com';
  const password = 'password123';
  const passwordHash = await bcrypt.hash(password, 10);

  // Check if user exists
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
    console.log('Test user already exists:', email);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
