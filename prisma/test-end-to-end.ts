const API_BASE = 'http://localhost:3006/v1';

async function runE2ETest() {
  console.log('🧪 Starting End-to-End Test Pass...\n');

  // 1. Verify empty state after clean reset
  console.log('1️⃣ Step 1: Checking Empty State in DB...');
  const initialCoursesRes = await fetch(`${API_BASE}/courses/public`);
  const initialCourses = await initialCoursesRes.json();

  const initialContentRes = await fetch(`${API_BASE}/content/public`);
  const initialContent = await initialContentRes.json();

  console.log(`Initial Courses Count: ${initialCourses.length}`);
  console.log(`Initial Content Count: ${initialContent.length}`);

  if (initialCourses.length !== 0 || initialContent.length !== 0) {
    throw new Error('Database is not clean!');
  }
  console.log('✅ Empty state confirmed!\n');

  // 2. Fetch a School and Department for Lecturer registration
  console.log('2️⃣ Step 2: Fetching School and Department...');
  const schoolsRes = await fetch(`${API_BASE}/schools/public`);
  const schools = await schoolsRes.json();
  const schoolId = schools[0]?.id;

  const deptsRes = await fetch(`${API_BASE}/admin/departments/public/${schoolId}`);
  const depts = await deptsRes.json();
  const departmentId = depts[0]?.id;
  console.log(`Using School ID: ${schoolId}`);
  console.log(`Using Department ID: ${departmentId}\n`);

  // 3. Register & Login New Lecturer Account
  console.log('3️⃣ Step 3: Registering New Lecturer Account...');
  const lecturerEmail = `lecturer_${Date.now()}@rft.edu`;
  const regRes = await fetch(`${API_BASE}/auth/register-lecturer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: lecturerEmail,
      password: 'Password123!',
      fullName: 'Dr. Test Lecturer',
      schoolId,
      departmentId,
    }),
  });
  const regData = await regRes.json();
  console.log(`Lecturer Registered: ${lecturerEmail}`);

  // Login to get auth token
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: lecturerEmail,
      password: 'Password123!',
    }),
  });
  const loginData = await loginRes.json();
  console.log('Login Response:', loginData);
  const lecturerToken = loginData.accessToken;
  const lecturerId = loginData.user.id;
  console.log(`Logged in Lecturer ID: ${lecturerId}`);
  console.log('✅ Lecturer Logged In Successfully!\n');

  // 4. Create New Course
  console.log('4️⃣ Step 4: Lecturer Creating New Course...');
  const courseRes = await fetch(`${API_BASE}/admin/courses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${lecturerToken}`,
    },
    body: JSON.stringify({
      code: 'CS401',
      name: 'Advanced Software Engineering',
      unit: 3,
      level: '400',
      schoolId,
      departmentId,
      lecturerIds: [lecturerId],
    }),
  });
  const newCourse = await courseRes.json();
  console.log('New Course Response:', newCourse);
  console.log(`Created Course: ${newCourse.code} - ${newCourse.name} (ID: ${newCourse.id})\n`);

  // 5. Upload Course Material with PDF
  console.log('5️⃣ Step 5: Lecturer Uploading PDF Content...');
  const contentRes = await fetch(`${API_BASE}/admin/content`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${lecturerToken}`,
    },
    body: JSON.stringify({
      title: 'CS401 Lecture 1 - Architecture Patterns',
      type: 'resource',
      fileType: 'pdf',
      downloadUrl: 'http://localhost:3006/uploads/sample.pdf',
      courseId: newCourse.id,
      schoolId,
      uploaderId: lecturerId,
      price: 0,
    }),
  });
  const newContent = await contentRes.json();
  console.log('New Content Response:', newContent);
  console.log(`Uploaded Content: ${newContent.title}`);
  console.log(`PDF Download URL: ${newContent.downloadUrl}\n`);

  // 6. Student Course Discovery & PDF Access Verification
  console.log('6️⃣ Step 6: Verifying Student Discovery & PDF Opening...');
  const studentCoursesRes = await fetch(`${API_BASE}/courses/public`);
  const studentCourses = await studentCoursesRes.json();
  console.log(`Student Courses Found: ${studentCourses.length}`);

  const studentContentRes = await fetch(`${API_BASE}/content/public?courseId=${newCourse.id}`);
  const studentContent = await studentContentRes.json();
  console.log(`Student Content Items Found for CS401: ${studentContent.length}`);

  const targetPdfUrl = studentContent[0].downloadUrl;
  console.log(`Opening PDF URL: ${targetPdfUrl}`);

  const pdfHead = await fetch(targetPdfUrl, { method: 'HEAD' });
  console.log(`PDF HTTP Status: ${pdfHead.status} ${pdfHead.statusText}`);
  console.log(`PDF Content-Type: ${pdfHead.headers.get('content-type')}`);

  if (pdfHead.status === 200 && pdfHead.headers.get('content-type')?.includes('pdf')) {
    console.log('\n🎉 ALL END-TO-END VERIFICATION CHECKS PASSED PERFECTLY!');
  } else {
    throw new Error('PDF file response invalid!');
  }
}

runE2ETest().catch((err) => {
  console.error('❌ E2E Test Failed:', err.message);
  process.exit(1);
});
