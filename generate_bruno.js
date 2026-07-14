const fs = require('fs');
const path = require('path');

const BRUNO_DIR = path.join(__dirname, 'RFT_Student_Bruno');

const environments = {
  "name": "Local",
  "variables": [
    { "name": "baseUrl", "value": "http://localhost:3000", "enabled": true },
    { "name": "token", "value": "", "enabled": true },
    { "name": "schoolId", "value": "", "enabled": true },
    { "name": "courseId", "value": "", "enabled": true }
  ]
};

const brunoConfig = {
  "version": "1",
  "name": "RFT Student API",
  "type": "collection",
  "environments": [ environments ]
};

const requests = [
  // Auth
  { folder: 'Auth', name: 'Register', method: 'POST', url: '{{baseUrl}}/auth/register', body: { email: "student@test.com", password: "password123", fullName: "Test Student", matricNumber: "MAT123" } },
  { folder: 'Auth', name: 'Login', method: 'POST', url: '{{baseUrl}}/auth/login', body: { email: "student@test.com", password: "password123" } },
  { folder: 'Auth', name: 'Get Profile', method: 'GET', url: '{{baseUrl}}/auth/me', auth: true },

  // Schools
  { folder: 'Schools', name: 'Create School', method: 'POST', url: '{{baseUrl}}/admin/schools', auth: true, body: { name: "University of Tech", acronym: "UOT" } },
  { folder: 'Schools', name: 'Get All Schools', method: 'GET', url: '{{baseUrl}}/admin/schools', auth: true },

  // Faculties
  { folder: 'Faculties', name: 'Create Faculty', method: 'POST', url: '{{baseUrl}}/admin/faculties', auth: true, body: { name: "Engineering", schoolId: "{{schoolId}}" } },
  { folder: 'Faculties', name: 'Get Faculties by School', method: 'GET', url: '{{baseUrl}}/admin/schools/{{schoolId}}/faculties', auth: true },

  // Departments
  { folder: 'Departments', name: 'Create Department', method: 'POST', url: '{{baseUrl}}/admin/departments', auth: true, body: { name: "Computer Engineering", schoolId: "{{schoolId}}", facultyId: "FACULTY_ID" } },
  { folder: 'Departments', name: 'Get All Departments', method: 'GET', url: '{{baseUrl}}/admin/departments', auth: true },

  // Courses
  { folder: 'Courses', name: 'Create Course', method: 'POST', url: '{{baseUrl}}/admin/courses', auth: true, body: { code: "CPE 101", name: "Intro to Computing", schoolId: "{{schoolId}}", departmentId: "DEPT_ID" } },
  { folder: 'Courses', name: 'Get Admin Courses', method: 'GET', url: '{{baseUrl}}/admin/courses', auth: true },
  { folder: 'Courses', name: 'Get Student Courses', method: 'GET', url: '{{baseUrl}}/courses', auth: true },

  // Content
  { folder: 'Content', name: 'Upload Content', method: 'POST', url: '{{baseUrl}}/admin/content', auth: true, body: { title: "CPE 101 Handout", type: "resource", fileType: "pdf" } },
  { folder: 'Content', name: 'Get All Content', method: 'GET', url: '{{baseUrl}}/admin/content', auth: true },

  // Announcements
  { folder: 'Announcements', name: 'Post Announcement', method: 'POST', url: '{{baseUrl}}/announcements', auth: true, body: { title: "Exam Rescheduled", message: "Exams moved to next week", audienceType: "school" } },
  { folder: 'Announcements', name: 'Get Announcements', method: 'GET', url: '{{baseUrl}}/announcements', auth: true },

  // Class Reps
  { folder: 'Class Reps', name: 'Assign Class Rep', method: 'POST', url: '{{baseUrl}}/admin/class-reps', auth: true, body: { courseId: "{{courseId}}", studentId: "USER_ID" } },

  // Notifications
  { folder: 'Notifications', name: 'Get My Notifications', method: 'GET', url: '{{baseUrl}}/notifications', auth: true },
  { folder: 'Notifications', name: 'Mark Read', method: 'PATCH', url: '{{baseUrl}}/notifications/NOTIF_ID/read', auth: true },

  // Payments
  { folder: 'Payments', name: 'Initialize Payment', method: 'POST', url: '{{baseUrl}}/payments/initialize', auth: true, body: { itemType: "past_question", itemId: "PQ_ID", amount: 5000 } },
  { folder: 'Payments', name: 'Paystack Webhook', method: 'POST', url: '{{baseUrl}}/payments/webhook', headers: { 'x-paystack-signature': 'mock_signature' }, body: { event: "charge.success", data: { reference: "REF_ID" } } },

  // Assessments
  { folder: 'Assessments', name: 'Create Assessment', method: 'POST', url: '{{baseUrl}}/admin/assessments', auth: true, body: { title: "Midterm Quiz", type: "quiz", courseId: "{{courseId}}" } },
  { folder: 'Assessments', name: 'Get Assessments', method: 'GET', url: '{{baseUrl}}/courses/{{courseId}}/assessments', auth: true },
  { folder: 'Assessments', name: 'Submit Assessment', method: 'POST', url: '{{baseUrl}}/assessments/ASSESS_ID/submit', auth: true, body: { fileUrl: "https://example.com/submission.pdf" } },

  // Class Sessions
  { folder: 'Class Sessions', name: 'Schedule Class', method: 'POST', url: '{{baseUrl}}/admin/class-sessions', auth: true, body: { topic: "Data Structures", type: "virtual", courseId: "{{courseId}}", startTime: new Date().toISOString(), endTime: new Date().toISOString() } },

  // Admissions
  { folder: 'Admissions', name: 'Apply', method: 'POST', url: '{{baseUrl}}/admissions/apply', auth: true, body: { schoolId: "{{schoolId}}", departmentId: "DEPT_ID" } },
  { folder: 'Admissions', name: 'Get Pending', method: 'GET', url: '{{baseUrl}}/admissions/admin/pending', auth: true },
  { folder: 'Admissions', name: 'Process Admission', method: 'PATCH', url: '{{baseUrl}}/admissions/admin/REQ_ID/process', auth: true, body: { status: "approved" } },

  // Analytics
  { folder: 'Analytics', name: 'Get Dashboard', method: 'GET', url: '{{baseUrl}}/admin/analytics/dashboard', auth: true },

  // Support & Feedback
  { folder: 'Support', name: 'Create Ticket', method: 'POST', url: '{{baseUrl}}/support/tickets', auth: true, body: { subject: "Can't login", description: "Getting 500 error" } },
  { folder: 'Support', name: 'Get Tickets', method: 'GET', url: '{{baseUrl}}/support/admin/tickets', auth: true },
  { folder: 'Feedback', name: 'Submit Feedback', method: 'POST', url: '{{baseUrl}}/feedback', auth: true, body: { message: "App is great!", type: "general", isAnonymous: true } }
];

function sanitizeStr(str) {
  return str.replace(/[^a-zA-Z0-9 -]/g, '').trim();
}

if (!fs.existsSync(BRUNO_DIR)) {
  fs.mkdirSync(BRUNO_DIR, { recursive: true });
}

fs.writeFileSync(path.join(BRUNO_DIR, 'bruno.json'), JSON.stringify(brunoConfig, null, 2));

const envDir = path.join(BRUNO_DIR, 'environments');
if (!fs.existsSync(envDir)) fs.mkdirSync(envDir);
fs.writeFileSync(path.join(envDir, 'Local.bru'), `vars {
  baseUrl: http://localhost:3000
  token: 
  schoolId: 
  courseId: 
}`);

requests.forEach(req => {
  const folderPath = path.join(BRUNO_DIR, sanitizeStr(req.folder));
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

  const fileName = `${sanitizeStr(req.name)}.bru`;
  const filePath = path.join(folderPath, fileName);

  let bruContent = `meta {
  name: ${req.name}
  type: http
  seq: 1
}

${req.method.toLowerCase()} {
  url: ${req.url}
  body: ${req.body ? 'json' : 'none'}
  auth: ${req.auth ? 'bearer' : 'none'}
}

`;

  if (req.headers) {
    bruContent += `headers {\n`;
    for (const [k, v] of Object.entries(req.headers)) {
      bruContent += `  ${k}: ${v}\n`;
    }
    bruContent += `}\n\n`;
  }

  if (req.auth) {
    bruContent += `auth:bearer {
  token: {{token}}
}

`;
  }

  if (req.body) {
    bruContent += `body:json {
  ${JSON.stringify(req.body, null, 2).split('\n').join('\n  ')}
}
`;
  }

  fs.writeFileSync(filePath, bruContent);
});

console.log('Complete Bruno collection successfully generated in RFT_Student_Bruno');
