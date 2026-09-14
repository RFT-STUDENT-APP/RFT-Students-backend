const { PrismaClient } = require('./node_modules/@prisma/client');

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: { url: process.env.DATABASE_URL },
    },
  });

  try {
    const res = await prisma.anonymousMessage.create({
      data: {
        message: 'Test message',
      }
    });
    console.log('Success:', res);
  } catch (err) {
    console.error('Error:', err);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
