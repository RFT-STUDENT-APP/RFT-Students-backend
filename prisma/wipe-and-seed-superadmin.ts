import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL || 'postgresql://libertyelec@localhost:5432/rft_students_backend';
const isLocal = !connectionString || connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function wipeAndSeedAllAccounts() {
  console.log('🧹 Executing COMPLETE Database Wipe...');

  // 1. Clear all dependent tables
  await prisma.chatMessage.deleteMany({});
  await prisma.content.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.classRepAssignment.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.assessmentSubmission.deleteMany({});
  await prisma.assessment.deleteMany({});
  await prisma.classSession.deleteMany({});
  await prisma.admissionRequest.deleteMany({});
  await prisma.supportTicket.deleteMany({});
  await prisma.feedback.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.otp.deleteMany({});
  await prisma.revokedToken.deleteMany({});
  await prisma.globalSetting.deleteMany({});

  // 2. Clear core entity tables
  await prisma.course.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.faculty.deleteMany({});
  await prisma.school.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('✅ Entire Database Cleared!');

  console.log('🌱 Seeding Accounts for Super Admin, University, and Lecturer...');
  const salt = await bcrypt.genSalt(10);

  // 1. Super Admin Account
  const superAdminPass = 'SuperSecretAdmin123!';
  const superAdminHash = await bcrypt.hash(superAdminPass, salt);
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@rft-student.edu',
      fullName: 'System Super Admin',
      passwordHash: superAdminHash,
      role: Role.SUPER_ADMIN,
      status: 'ACTIVE',
    },
  });

  // 2. University (School Admin) Account
  const school = await prisma.school.create({
    data: {
      name: 'University of Lagos',
      acronym: 'UNILAG',
      contactEmail: 'unilagadmin@rft-student.edu',
      phone: '+234 800 864 5244',
      address: 'University Road, Akoka, Yaba, Lagos',
      status: 'active',
    },
  });

  const schoolAdminPass = 'UnilagAdmin123!';
  const schoolAdminHash = await bcrypt.hash(schoolAdminPass, salt);
  const schoolAdmin = await prisma.user.create({
    data: {
      email: 'unilagadmin@rft-student.edu',
      fullName: 'UNILAG Vice Chancellor Admin',
      passwordHash: schoolAdminHash,
      role: Role.SCHOOL_ADMIN,
      schoolId: school.id,
      status: 'ACTIVE',
    },
  });

  // 3. Faculty & Department under UNILAG
  const faculty = await prisma.faculty.create({
    data: {
      name: 'Faculty of Science',
      deanName: 'Prof. Adebayo Ogunlesi',
      schoolId: school.id,
      status: 'active',
    },
  });

  const department = await prisma.department.create({
    data: {
      name: 'Computer Science',
      schoolId: school.id,
      facultyId: faculty.id,
    },
  });

  // 4. Lecturer Account under UNILAG & Computer Science
  const lecturerPass = 'LecturerPass123!';
  const lecturerHash = await bcrypt.hash(lecturerPass, salt);
  const lecturer = await prisma.user.create({
    data: {
      email: 'dr.adebayo@unilag.edu.ng',
      fullName: 'Dr. Adebayo Oladimeji',
      passwordHash: lecturerHash,
      role: Role.LECTURER,
      schoolId: school.id,
      departmentId: department.id,
      status: 'ACTIVE',
    },
  });

  console.log('🎉 Seed Completed Successfully!');
  console.log('==================================================');
  console.log('1️⃣ SUPER ADMIN ACCOUNT:');
  console.log(`   Email:    ${superAdmin.email}`);
  console.log(`   Password: ${superAdminPass}`);
  console.log(`   Role:     SUPER_ADMIN`);
  console.log('--------------------------------------------------');
  console.log('2️⃣ UNIVERSITY (SCHOOL ADMIN) ACCOUNT:');
  console.log(`   School:   ${school.name} (${school.acronym})`);
  console.log(`   Email:    ${schoolAdmin.email}`);
  console.log(`   Password: ${schoolAdminPass}`);
  console.log(`   Role:     SCHOOL_ADMIN`);
  console.log('--------------------------------------------------');
  console.log('3️⃣ LECTURER ACCOUNT (Under UNILAG):');
  console.log(`   Name:     ${lecturer.fullName}`);
  console.log(`   Email:    ${lecturer.email}`);
  console.log(`   Password: ${lecturerPass}`);
  console.log(`   Dept:     ${department.name} (${faculty.name})`);
  console.log(`   Role:     LECTURER`);
  console.log('==================================================');
}

wipeAndSeedAllAccounts()
  .catch((e) => {
    console.error('Wipe & Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
