import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL || 'postgresql://libertyelec@localhost:5432/rft_students_backend';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool as any);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@rft-student.edu';
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'SuperSecretAdmin123!';

  // Check if superadmin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });

  if (existingAdmin) {
    console.log(`Super admin already exists with email: ${superAdminEmail}`);
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(superAdminPassword, salt);

  const superAdmin = await prisma.user.create({
    data: {
      email: superAdminEmail,
      fullName: 'System Super Admin',
      passwordHash: passwordHash,
      role: Role.SUPER_ADMIN,
      status: 'active',
    },
  });

  console.log('✅ Super admin successfully created!');
  console.log('-------------------------------------------');
  console.log(`Email:    ${superAdmin.email}`);
  console.log(`Password: ${superAdminPassword}`);
  console.log('-------------------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
