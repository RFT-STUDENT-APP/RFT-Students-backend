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

  let superAdmin = existingAdmin;
  if (!superAdmin) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(superAdminPassword, salt);
    superAdmin = await prisma.user.create({
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

  // Seed Schools
  const unilag = await prisma.school.upsert({
    where: { name: 'University of Lagos' },
    update: {},
    create: { name: 'University of Lagos', acronym: 'UNILAG', address: 'Akoka, Yaba, Lagos' },
  });

  const ui = await prisma.school.upsert({
    where: { name: 'University of Ibadan' },
    update: {},
    create: { name: 'University of Ibadan', acronym: 'UI', address: 'Ibadan, Oyo State' },
  });

  const oau = await prisma.school.upsert({
    where: { name: 'Obafemi Awolowo University' },
    update: {},
    create: { name: 'Obafemi Awolowo University', acronym: 'OAU', address: 'Ile-Ife, Osun State' },
  });

  // Seed Faculty & Department
  let scienceFaculty = await prisma.faculty.findFirst({ where: { schoolId: unilag.id, name: 'Faculty of Science' } });
  if (!scienceFaculty) {
    scienceFaculty = await prisma.faculty.create({
      data: { name: 'Faculty of Science', schoolId: unilag.id },
    });
  }

  let csDepartment = await prisma.department.findFirst({ where: { schoolId: unilag.id, name: 'Computer Science' } });
  if (!csDepartment) {
    csDepartment = await prisma.department.create({
      data: { name: 'Computer Science', schoolId: unilag.id, facultyId: scienceFaculty.id },
    });
  }

  // Seed Courses
  let course1 = await prisma.course.findFirst({ where: { code: 'CS301', schoolId: unilag.id } });
  if (!course1) {
    course1 = await prisma.course.create({
      data: {
        code: 'CS301',
        name: 'Data Structures & Algorithms',
        unit: 3,
        credits: 3,
        semester: 1,
        level: '300',
        schoolId: unilag.id,
        departmentId: csDepartment.id,
      },
    });
  }

  let course2 = await prisma.course.findFirst({ where: { code: 'CS302', schoolId: unilag.id } });
  if (!course2) {
    course2 = await prisma.course.create({
      data: {
        code: 'CS302',
        name: 'Database Management Systems',
        unit: 3,
        credits: 3,
        semester: 2,
        level: '300',
        schoolId: unilag.id,
        departmentId: csDepartment.id,
      },
    });
  }

  // Seed Past Question Content
  const sampleContent = await prisma.content.findFirst({ where: { title: 'CS301 2023 First Semester Exam Past Question' } });
  if (!sampleContent) {
    await prisma.content.create({
      data: {
        title: 'CS301 2023 First Semester Exam Past Question',
        type: 'past_question',
        fileType: 'pdf',
        downloadUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        price: 500,
        schoolId: unilag.id,
        courseId: course1.id,
      },
    });
  }

  // Seed Announcements
  const announcementCount = await prisma.announcement.count();
  if (announcementCount === 0) {
    await prisma.announcement.create({
      data: {
        title: 'Welcome to RFT Edutech Portal!',
        message: 'Exams start next month. Download past questions from the library.',
        audienceType: 'ALL',
        schoolId: unilag.id,
        authorId: superAdmin.id,
      },
    });
  }

  console.log('✅ Default Schools, Departments, Courses, Contents, and Announcements seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
