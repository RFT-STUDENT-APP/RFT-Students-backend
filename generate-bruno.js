const fs = require('fs');
const path = require('path');

const BRUNO_DIR = path.join(__dirname, 'RFT_Student_Bruno');

const environments = {
  "name": "Local",
  "variables": [
    { "name": "baseUrl", "value": "http://localhost:3000/api/v1", "enabled": true },
    { "name": "token", "value": "", "enabled": true }
  ]
};

const collection = {
  "name": "RFT Student API",
  "version": "1.0.0"
};

const requests = [
  {
    name: "Auth/1. Login",
    method: "POST",
    url: "{{baseUrl}}/auth/login",
    body: { email: "admin@rft-student.edu", password: "SuperSecretAdmin123!" }
  },
  {
    name: "Auth/2. Register",
    method: "POST",
    url: "{{baseUrl}}/auth/register",
    body: { email: "student@school.edu", password: "StrongPassword123!", confirmPassword: "StrongPassword123!", fullName: "Student Name", matricNumber: "ENG/2021/045" }
  },
  {
    name: "Auth/3. Get Profile",
    method: "GET",
    url: "{{baseUrl}}/users/me"
  },
  {
    name: "Admin/Schools/1. List Schools",
    method: "GET",
    url: "{{baseUrl}}/admin/schools"
  },
  {
    name: "Admin/Schools/2. Create School",
    method: "POST",
    url: "{{baseUrl}}/admin/schools",
    body: { name: "University of Lagos", contactEmail: "admin@unilag.edu.ng", phone: "+2348012345678" }
  },
  {
    name: "Admin/Departments/1. List Departments",
    method: "GET",
    url: "{{baseUrl}}/admin/departments"
  },
  {
    name: "Admin/Users/1. List Users",
    method: "GET",
    url: "{{baseUrl}}/admin/users"
  },
  {
    name: "Admin/Courses/1. List Courses",
    method: "GET",
    url: "{{baseUrl}}/admin/courses"
  }
];

if (!fs.existsSync(BRUNO_DIR)) {
  fs.mkdirSync(BRUNO_DIR, { recursive: true });
}

fs.writeFileSync(path.join(BRUNO_DIR, 'bruno.json'), JSON.stringify(collection, null, 2));

const envDir = path.join(BRUNO_DIR, 'environments');
if (!fs.existsSync(envDir)) fs.mkdirSync(envDir);
fs.writeFileSync(path.join(envDir, 'Local.bru'), `vars {
  baseUrl: http://localhost:3000/api/v1
  token: 
}
`);

requests.forEach(req => {
  const parts = req.name.split('/');
  const filename = parts.pop() + '.bru';
  
  let currentDir = BRUNO_DIR;
  parts.forEach(part => {
    currentDir = path.join(currentDir, part);
    if (!fs.existsSync(currentDir)) fs.mkdirSync(currentDir);
  });

  const bodyContent = req.body ? `
body:json {
${JSON.stringify(req.body, null, 2)}
}` : '';

  const content = `meta {
  name: ${filename.replace('.bru', '')}
  type: http
  seq: 1
}

${req.method.toLowerCase()} {
  url: ${req.url}
  body: ${req.body ? 'json' : 'none'}
  auth: bearer
}

auth:bearer {
  token: {{token}}
}
${bodyContent}
`;

  fs.writeFileSync(path.join(currentDir, filename), content);
});

console.log('Bruno collection generated in RFT_Student_Bruno directory');
