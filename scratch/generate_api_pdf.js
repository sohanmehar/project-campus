const PDFDocument = require('c:/Users/SOHAN/Desktop/campusgpt/server/node_modules/pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({
  margin: 35,
  size: 'A4',
});

const outputPdfPath = path.join(__dirname, '..', 'docs', 'CampusGPT_API_Documentation.pdf');
const brainPdfPath = path.join('C:\\Users\\SOHAN\\.gemini\\antigravity-ide\\brain\\ee085141-5bcb-46b9-8f6f-4317cc79656e', 'CampusGPT_API_Documentation.pdf');

fs.mkdirSync(path.dirname(outputPdfPath), { recursive: true });

const writeStream = fs.createWriteStream(outputPdfPath);
doc.pipe(writeStream);

// Dark Hero Header
doc.rect(0, 0, doc.page.width, 95).fill('#0f172a');
doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold').text('CampusGPT Enterprise University OS', 35, 22);
doc.fillColor('#93c5fd').fontSize(11).font('Helvetica').text('Complete REST API Specification & Endpoint Directory', 35, 48);
doc.fillColor('#94a3b8').fontSize(8.5).font('Helvetica-Oblique').text('Base URL: /api/v1  •  Auth: Bearer JWT & HttpOnly Cookie  •  Protocol: HTTPS JSON', 35, 68);

doc.y = 110;

const apiSections = [
  {
    title: '1. Authentication & Identity Management (/api/v1/auth)',
    endpoints: [
      { method: 'POST', endpoint: '/api/v1/auth/signup', access: 'Public', desc: 'Register new user account (student, faculty, coordinator, admin) with bcrypt password hashing.' },
      { method: 'POST', endpoint: '/api/v1/auth/login', access: 'Public', desc: 'Authenticate with email & password; returns JWT token, user object, and session cookie.' },
      { method: 'POST', endpoint: '/api/v1/auth/google', access: 'Public', desc: 'Google OAuth 2.0 verification via ID token. Auto-provisions student accounts or maps staff.' },
      { method: 'POST', endpoint: '/api/v1/auth/logout', access: 'Authenticated', desc: 'Clear authenticated session cookies and invalidate client-side token.' },
      { method: 'GET', endpoint: '/api/v1/auth/me', access: 'Authenticated', desc: 'Fetch currently authenticated user session details, role permissions, and profile metadata.' },
      { method: 'PUT', endpoint: '/api/v1/auth/profile', access: 'Authenticated', desc: 'Update profile details (phone, department, bio, skills, LinkedIn/GitHub/portfolio URLs).' },
    ]
  },
  {
    title: '2. Central Administration & Governance (/api/v1/admin)',
    endpoints: [
      { method: 'GET', endpoint: '/api/v1/admin/stats', access: 'Admin', desc: 'Fetch institutional metrics (enrollments, attendance rates, placement drives, event passes).' },
      { method: 'GET', endpoint: '/api/v1/admin/users', access: 'Admin', desc: 'Retrieve all system users across all roles with account status and department metadata.' },
      { method: 'PATCH', endpoint: '/api/v1/admin/users/:id/role', access: 'Admin', desc: 'Dynamically update user role permissions (student, faculty, coordinator, admin).' },
      { method: 'DELETE', endpoint: '/api/v1/admin/users/:id', access: 'Admin', desc: 'Permanently delete user account and associated profile records from MongoDB Atlas.' },
      { method: 'GET', endpoint: '/api/v1/admin/students', access: 'Admin', desc: 'Retrieve enrolled student registry records with roll numbers, CGPA, and verification status.' },
      { method: 'POST', endpoint: '/api/v1/admin/students', access: 'Admin', desc: 'Manually onboard a single student into the registry.' },
      { method: 'POST', endpoint: '/api/v1/admin/students/bulk-import', access: 'Admin', desc: 'Bulk import and onboard students via Excel (.xlsx) / CSV spreadsheet parser.' },
      { method: 'PATCH', endpoint: '/api/v1/admin/students/:id/status', access: 'Admin', desc: 'Toggle student academic status between Active and Inactive / Suspended.' },
      { method: 'GET', endpoint: '/api/v1/admin/faculty', access: 'Admin', desc: 'Retrieve registered academic faculty members with assigned courses and designations.' },
      { method: 'POST', endpoint: '/api/v1/admin/faculty', access: 'Admin', desc: 'Add a new professor/faculty member and assign designated teaching modules.' },
      { method: 'POST', endpoint: '/api/v1/admin/faculty/bulk-import', access: 'Admin', desc: 'Bulk import and register faculty staff from Excel / CSV spreadsheets.' },
      { method: 'DELETE', endpoint: '/api/v1/admin/faculty/:id', access: 'Admin', desc: 'Remove faculty member from institutional roster.' },
      { method: 'GET', endpoint: '/api/v1/admin/departments', access: 'Admin, Faculty, Student', desc: 'Retrieve academic department list, department heads, and course catalogs.' },
      { method: 'POST', endpoint: '/api/v1/admin/departments', access: 'Admin', desc: 'Create new academic department with code, department head, and initial course syllabus.' },
      { method: 'PUT', endpoint: '/api/v1/admin/departments/:id', access: 'Admin', desc: 'Update department details, student capacity, and department head designation.' },
      { method: 'DELETE', endpoint: '/api/v1/admin/departments/:id', access: 'Admin', desc: 'Remove department structure from the academic catalog.' },
      { method: 'POST', endpoint: '/api/v1/admin/departments/:id/courses', access: 'Admin', desc: 'Add a new accredited course module with credits and semester to a department.' },
      { method: 'DELETE', endpoint: '/api/v1/admin/departments/:id/courses/:courseCode', access: 'Admin', desc: 'Remove a course module from a department syllabus.' },
      { method: 'GET', endpoint: '/api/v1/admin/settings', access: 'Admin', desc: 'Fetch global system configurations (attendance threshold %, maintenance mode, AI model).' },
      { method: 'PUT', endpoint: '/api/v1/admin/settings', access: 'Admin', desc: 'Update global platform settings and system operational thresholds.' },
      { method: 'GET', endpoint: '/api/v1/admin/ai-metrics', access: 'Admin', desc: 'Retrieve AI platform metrics (token usage, query volume, active agent sessions).' },
      { method: 'GET', endpoint: '/api/v1/admin/search', access: 'Authenticated', desc: 'Global search across courses, drives, clubs, and students.' },
    ]
  },
  {
    title: '3. Faculty Operations & Academics (/api/v1/faculty)',
    endpoints: [
      { method: 'GET', endpoint: '/api/v1/faculty/dashboard', access: 'Faculty, Admin', desc: 'Fetch faculty dashboard summary (enrolled students, assigned modules, pending reviews).' },
      { method: 'GET', endpoint: '/api/v1/faculty/students', access: 'Faculty, Admin', desc: 'Retrieve student roster for attendance marking and grading.' },
      { method: 'POST', endpoint: '/api/v1/faculty/attendance', access: 'Faculty, Admin', desc: 'Submit and record a live classroom attendance session (present/absent/late) in MongoDB.' },
      { method: 'GET', endpoint: '/api/v1/faculty/attendance/session', access: 'Faculty, Admin', desc: 'Fetch attendance session records for a specific date, subject, and time slot.' },
      { method: 'GET', endpoint: '/api/v1/faculty/assignments', access: 'Faculty, Admin', desc: 'Retrieve coursework modules created and published by faculty.' },
      { method: 'POST', endpoint: '/api/v1/faculty/assignments', access: 'Faculty, Admin', desc: 'Create and publish a new student assignment with due dates, rubrics, and total marks.' },
      { method: 'DELETE', endpoint: '/api/v1/faculty/assignments/:id', access: 'Faculty, Admin', desc: 'Delete an assignment and cascade remove student submissions.' },
      { method: 'GET', endpoint: '/api/v1/faculty/submissions', access: 'Faculty, Admin', desc: 'Fetch student assignment submissions roster across all assigned subjects.' },
      { method: 'PUT', endpoint: '/api/v1/faculty/submissions/:id/grade', access: 'Faculty, Admin', desc: 'Grade student assignment submission with marks obtained and personalized feedback.' },
      { method: 'POST', endpoint: '/api/v1/faculty/notices', access: 'Faculty, Coordinator, Admin', desc: 'Publish campus announcements, exam circulars, and course study materials.' },
      { method: 'GET', endpoint: '/api/v1/faculty/notices', access: 'Authenticated', desc: 'Retrieve all published campus announcements, circulars, and notices.' },
      { method: 'DELETE', endpoint: '/api/v1/faculty/notices/:id', access: 'Faculty, Coordinator, Admin', desc: 'Remove published circular or study material notice.' },
      { method: 'POST', endpoint: '/api/v1/faculty/courses', access: 'Faculty, Admin', desc: 'Add assigned subject to faculty teaching catalog.' },
      { method: 'DELETE', endpoint: '/api/v1/faculty/courses/:code', access: 'Faculty, Admin', desc: 'Remove assigned subject from teaching roster.' },
      { method: 'PUT', endpoint: '/api/v1/faculty/courses/:code/syllabus', access: 'Faculty, Admin', desc: 'Update course syllabus, lecture modules, and reference books.' },
    ]
  },
  {
    title: '4. Student & Extracurricular Coordinator Operations (/api/v1/coordinator)',
    endpoints: [
      { method: 'GET', endpoint: '/api/v1/coordinator/stats', access: 'Coordinator, Admin', desc: 'Fetch real-time coordinator metrics (events, societies, digital passes, pending approvals).' },
      { method: 'POST', endpoint: '/api/v1/coordinator/approvals/:id/decide', access: 'Coordinator, Admin', desc: 'Approve or decline student club membership or event organizer pass requests with notifications.' },
    ]
  },
  {
    title: '5. Attendance Management Engine (/api/v1/attendance)',
    endpoints: [
      { method: 'GET', endpoint: '/api/v1/attendance/student', access: 'Student, Authenticated', desc: 'Retrieve student aggregate attendance %, monthly trends, and subject-wise breakdowns.' },
      { method: 'GET', endpoint: '/api/v1/attendance/summary', access: 'Student, Authenticated', desc: 'Fetch condensed attendance summary and 75% university eligibility status.' },
      { method: 'POST', endpoint: '/api/v1/attendance/sessions', access: 'Faculty, Admin', desc: 'Create and persist a classroom attendance session.' },
    ]
  },
  {
    title: '6. Student Coursework & Submissions (/api/v1/assignments)',
    endpoints: [
      { method: 'GET', endpoint: '/api/v1/assignments', access: 'Authenticated', desc: 'Retrieve all published coursework modules relevant to student department.' },
      { method: 'POST', endpoint: '/api/v1/assignments/submit', access: 'Student', desc: 'Submit assignment solution (GitHub repo link, PDF URL, or project archive).' },
      { method: 'GET', endpoint: '/api/v1/assignments/my-submissions', access: 'Student', desc: 'Fetch all submitted solutions with grading status, marks awarded, and faculty feedback.' },
    ]
  },
  {
    title: '7. Campus Events & Digital QR Passes (/api/v1/events)',
    endpoints: [
      { method: 'GET', endpoint: '/api/v1/events', access: 'Authenticated', desc: 'List all upcoming campus hackathons, technical symposiums, and cultural events.' },
      { method: 'POST', endpoint: '/api/v1/events', access: 'Coordinator, Admin', desc: 'Publish a new campus event with venue, date, organizer, and registration links.' },
      { method: 'DELETE', endpoint: '/api/v1/events/:id', access: 'Coordinator, Admin', desc: 'Delete an event and revoke associated registration passes.' },
      { method: 'POST', endpoint: '/api/v1/events/:id/register', access: 'Student', desc: 'Register for event and instantly generate digital QR entry pass with encrypted token.' },
      { method: 'GET', endpoint: '/api/v1/events/my-registrations', access: 'Student', desc: 'Retrieve student registered event passes and dynamic QR codes.' },
      { method: 'DELETE', endpoint: '/api/v1/events/registrations/:id', access: 'Student', desc: 'Cancel event registration and release reserved ticket pass.' },
    ]
  },
  {
    title: '8. Placement & Career Management Hub (/api/v1/placements)',
    endpoints: [
      { method: 'GET', endpoint: '/api/v1/placements/drives', access: 'Authenticated', desc: 'Retrieve all active corporate recruitment drives, CTC packages, and eligibility criteria.' },
      { method: 'POST', endpoint: '/api/v1/placements/drives', access: 'Admin', desc: 'Post a new corporate placement drive (Company, Package, Location, CGPA Criteria).' },
      { method: 'DELETE', endpoint: '/api/v1/placements/drives/:id', access: 'Admin', desc: 'Delete recruitment drive and archive student applications.' },
      { method: 'POST', endpoint: '/api/v1/placements/:id/check-eligibility', access: 'Student', desc: 'AI-assisted eligibility verification against student CGPA, backlogs, and resume skills.' },
      { method: 'POST', endpoint: '/api/v1/placements/:id/apply', access: 'Student', desc: 'Submit job application with verified student profile and resume PDF.' },
      { method: 'GET', endpoint: '/api/v1/placements/my-applications', access: 'Student', desc: 'Track submitted placement applications and interview status.' },
    ]
  },
  {
    title: '9. Clubs & Student Societies (/api/v1/clubs)',
    endpoints: [
      { method: 'GET', endpoint: '/api/v1/clubs', access: 'Authenticated', desc: 'Retrieve registered technical, cultural, and social student clubs with member counts.' },
      { method: 'POST', endpoint: '/api/v1/clubs/:id/join', access: 'Student', desc: 'Join a student society and increment membership roster.' },
      { method: 'DELETE', endpoint: '/api/v1/clubs/:id/leave', access: 'Student', desc: 'Leave a student society and update active memberships.' },
    ]
  },
  {
    title: '10. Grievance & Complaint Redressal (/api/v1/complaints)',
    endpoints: [
      { method: 'GET', endpoint: '/api/v1/complaints', access: 'Authenticated', desc: 'Fetch submitted grievance tickets with resolution status (open, in_progress, resolved).' },
      { method: 'POST', endpoint: '/api/v1/complaints', access: 'Authenticated', desc: 'File an anonymous or verified campus grievance ticket.' },
    ]
  },
  {
    title: '11. Real-time Notifications Engine (/api/v1/notifications)',
    endpoints: [
      { method: 'GET', endpoint: '/api/v1/notifications', access: 'Authenticated', desc: 'Fetch real-time in-app notification alerts for the logged-in user with unread counter.' },
      { method: 'PATCH', endpoint: '/api/v1/notifications/:id/read', access: 'Authenticated', desc: 'Mark specific notification alert as read.' },
    ]
  },
  {
    title: '12. CampusGPT AI Copilot & Chat Engine (/api/v1/ai)',
    endpoints: [
      { method: 'POST', endpoint: '/api/v1/ai/query', access: 'Authenticated', desc: 'Multi-tenant AI workspace query with role-tailored prompt engine (Gemini & Groq).' },
      { method: 'GET', endpoint: '/api/v1/ai/history', access: 'Authenticated', desc: 'Retrieve saved conversation thread history and past message trajectories.' },
      { method: 'DELETE', endpoint: '/api/v1/ai/history/:id', access: 'Authenticated', desc: 'Delete conversation thread from chat history.' },
    ]
  },
  {
    title: '13. System Health & Monitoring',
    endpoints: [
      { method: 'GET', endpoint: '/api/v1/health', access: 'Public', desc: 'Health check endpoint returning API operational status and timestamp.' },
    ]
  }
];

const colWidths = [45, 160, 95, 225];
const startX = 35;
const pageWidth = doc.page.width - 70;

for (const sec of apiSections) {
  if (doc.y > doc.page.height - 110) {
    doc.addPage();
  }

  doc.moveDown(0.5);
  doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text(sec.title);
  doc.moveDown(0.25);

  const headerY = doc.y;
  doc.rect(startX, headerY, pageWidth, 18).fill('#e2e8f0');
  doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold');
  doc.text('METHOD', startX + 5, headerY + 5, { width: colWidths[0] });
  doc.text('ENDPOINT', startX + colWidths[0] + 5, headerY + 5, { width: colWidths[1] });
  doc.text('ACCESS', startX + colWidths[0] + colWidths[1] + 5, headerY + 5, { width: colWidths[2] });
  doc.text('DESCRIPTION', startX + colWidths[0] + colWidths[1] + colWidths[2] + 5, headerY + 5, { width: colWidths[3] });
  doc.y = headerY + 20;

  let rowCount = 0;
  for (const ep of sec.endpoints) {
    const rowHeight = doc.heightOfString(ep.desc, { width: colWidths[3] - 10, fontSize: 7.2 }) + 8;
    const finalHeight = Math.max(rowHeight, 16);

    if (doc.y + finalHeight > doc.page.height - 40) {
      doc.addPage();
    }

    const currentY = doc.y;
    if (rowCount % 2 === 1) {
      doc.rect(startX, currentY, pageWidth, finalHeight).fill('#f8fafc');
    }
    doc.rect(startX, currentY, pageWidth, finalHeight).stroke('#e2e8f0');

    let methodColor = '#2563eb';
    if (ep.method === 'POST') methodColor = '#16a34a';
    if (ep.method === 'PUT' || ep.method === 'PATCH') methodColor = '#d97706';
    if (ep.method === 'DELETE') methodColor = '#dc2626';

    doc.fillColor(methodColor).fontSize(7.2).font('Helvetica-Bold').text(ep.method, startX + 5, currentY + 4, { width: colWidths[0] - 8 });
    doc.fillColor('#0f172a').fontSize(7.2).font('Courier-Bold').text(ep.endpoint, startX + colWidths[0] + 5, currentY + 4, { width: colWidths[1] - 8 });
    doc.fillColor('#475569').fontSize(7.2).font('Helvetica-Bold').text(ep.access, startX + colWidths[0] + colWidths[1] + 5, currentY + 4, { width: colWidths[2] - 8 });
    doc.fillColor('#334155').fontSize(7.2).font('Helvetica').text(ep.desc, startX + colWidths[0] + colWidths[1] + colWidths[2] + 5, currentY + 4, { width: colWidths[3] - 10 });

    doc.y = currentY + finalHeight;
    rowCount++;
  }
}

doc.end();

writeStream.on('finish', () => {
  console.log('Clean PDF Generated at:', outputPdfPath);
  fs.copyFileSync(outputPdfPath, brainPdfPath);
});
