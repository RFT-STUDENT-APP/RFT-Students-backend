const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'admin@rft-student.edu' } });
  console.log(user);
}
main().catch(console.error).finally(() => prisma.$disconnect());
