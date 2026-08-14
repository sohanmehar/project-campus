# CampusGPT Enterprise University OS — Complete API Documentation

> **Base URL**: `/api/v1`  
> **Protocol**: HTTPS / REST JSON  
> **Authentication**: Bearer JWT (`Authorization: Bearer <token>`) & `campusgpt_token` HttpOnly Cookie  
> **Server Engine**: Node.js / Express / TypeScript / MongoDB Atlas / Google Cloud  

---

## 1. Authentication & Identity Management (`/api/v1/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/signup` | **Public** | Register a new user account (student, faculty, coordinator, admin) with encrypted password hashing. |
| `POST` | `/api/v1/auth/login` | **Public** | Authenticate user with email and password; returns JWT token, user role, and session cookie. |
| `POST` | `/api/v1/auth/google` | **Public** | Google OAuth 2.0 verification via Google ID token. Automatically provisions student accounts or maps existing faculty/admin roles. |
| `POST` | `/api/v1/auth/logout` | **Authenticated** | Clear authenticated session cookies and invalidate client-side token. |
| `GET` | `/api/v1/auth/me` | **Authenticated** | Fetch currently authenticated user session details, role permissions, and profile metadata. |
| `PUT` | `/api/v1/auth/profile` | **Authenticated** | Update user profile fields (phone number, department, bio, skills, LinkedIn/GitHub/portfolio URLs). |

---

## 2. Central Administration & Governance (`/api/v1/admin`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/stats` | **Admin** | Fetch real-time aggregate institutional metrics (enrollments, attendance rates, active placement drives, event passes). |
| `GET` | `/api/v1/admin/users` | **Admin** | Retrieve all system users across all roles with account status and department metadata. |
| `PATCH` | `/api/v1/admin/users/:id/role` | **Admin** | Dynamically update user role permissions (`student`, `faculty`, `coordinator`, `admin`). |
| `DELETE` | `/api/v1/admin/users/:id` | **Admin** | Permanently delete user account and associated profile records from MongoDB Atlas. |
| `GET` | `/api/v1/admin/students` | **Admin** | Retrieve enrolled student registry records with roll numbers, CGPA, and verification status. |
| `POST` | `/api/v1/admin/students` | **Admin** | Manually onboard a single student into the registry. |
| `POST` | `/api/v1/admin/students/bulk-import` | **Admin** | Bulk import and onboard students via Excel (.xlsx) / CSV spreadsheet parser. |
| `PATCH` | `/api/v1/admin/students/:id/status` | **Admin** | Toggle student academic status between `Active` and `Inactive` / `Suspended`. |
| `GET` | `/api/v1/admin/faculty` | **Admin** | Retrieve registered academic faculty members with assigned courses and designations. |
| `POST` | `/api/v1/admin/faculty` | **Admin** | Add a new professor/faculty member and assign designated teaching modules. |
| `POST` | `/api/v1/admin/faculty/bulk-import` | **Admin** | Bulk import and register faculty staff from Excel / CSV spreadsheets. |
| `DELETE` | `/api/v1/admin/faculty/:id` | **Admin** | Remove faculty member from institutional roster. |
| `GET` | `/api/v1/admin/departments` | **Admin, Faculty, Student** | Retrieve academic department list, department heads, and active curriculum course catalogs. |
| `POST` | `/api/v1/admin/departments` | **Admin** | Create a new academic department with designated code, department head, and initial course syllabus. |
| `PUT` | `/api/v1/admin/departments/:id` | **Admin** | Update department details, student capacity, and department head designation. |
| `DELETE` | `/api/v1/admin/departments/:id` | **Admin** | Remove department structure from the academic catalog. |
| `POST` | `/api/v1/admin/departments/:id/courses` | **Admin** | Add a new accredited course module with credits and semester to a department. |
| `DELETE` | `/api/v1/admin/departments/:id/courses/:courseCode` | **Admin** | Remove a course module from a department's syllabus. |
| `GET` | `/api/v1/admin/settings` | **Admin** | Fetch global system configurations (attendance threshold %, maintenance mode, AI model settings). |
| `PUT` | `/api/v1/admin/settings` | **Admin** | Update global platform settings and system operational thresholds. |
| `GET` | `/api/v1/admin/ai-metrics` | **Admin** | Retrieve CampusGPT AI platform metrics (token usage, query volume, active agent sessions). |
| `GET` | `/api/v1/admin/search` | **Authenticated** | Global Ctrl+K command palette search across courses, drives, clubs, and students. |

---

## 3. Faculty Operations & Academics (`/api/v1/faculty`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/faculty/dashboard` | **Faculty, Admin** | Fetch faculty dashboard summary (enrolled students, assigned modules, pending reviews). |
| `GET` | `/api/v1/faculty/students` | **Faculty, Admin** | Retrieve student roster for attendance marking and grading. |
| `POST` | `/api/v1/faculty/attendance` | **Faculty, Admin** | Submit and record a live classroom attendance session (present/absent/late) directly into MongoDB. |
| `GET` | `/api/v1/faculty/attendance/session` | **Faculty, Admin** | Fetch existing attendance session records for a specific date, subject, and time slot. |
| `GET` | `/api/v1/faculty/assignments` | **Faculty, Admin** | Retrieve coursework modules created and published by faculty. |
| `POST` | `/api/v1/faculty/assignments` | **Faculty, Admin** | Create and publish a new student assignment with due dates, rubrics, and total marks. |
| `DELETE` | `/api/v1/faculty/assignments/:id` | **Faculty, Admin** | Delete an assignment and cascade remove student submissions. |
| `GET` | `/api/v1/faculty/submissions` | **Faculty, Admin** | Fetch student assignment submissions roster across all assigned subjects. |
| `PUT` / `PATCH` | `/api/v1/faculty/submissions/:id/grade` | **Faculty, Admin** | Grade student assignment submission with marks obtained and personalized feedback. |
| `POST` | `/api/v1/faculty/notices` | **Faculty, Coordinator, Admin** | Publish campus announcements, exam circulars, and course study materials. |
| `GET` | `/api/v1/faculty/notices` | **Authenticated** | Retrieve all published campus announcements, circulars, and notices. |
| `DELETE` | `/api/v1/faculty/notices/:id` | **Faculty, Coordinator, Admin** | Remove published circular or study material notice. |
| `POST` | `/api/v1/faculty/courses` | **Faculty, Admin** | Add assigned subject to faculty teaching catalog. |
| `DELETE` | `/api/v1/faculty/courses/:code` | **Faculty, Admin** | Remove assigned subject from teaching roster. |
| `PUT` | `/api/v1/faculty/courses/:code/syllabus` | **Faculty, Admin** | Update course syllabus, lecture modules, and reference books. |

---

## 4. Student & Extracurricular Coordinator Operations (`/api/v1/coordinator`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/coordinator/stats` | **Coordinator, Admin** | Fetch real-time coordinator metrics (total active events, registered societies, digital passes, pending student approvals). |
| `POST` | `/api/v1/coordinator/approvals/:id/decide` | **Coordinator, Admin** | Permanently approve or decline student club membership or event organizer pass requests with automatic in-app student notification. |

---

## 5. Attendance Management Engine (`/api/v1/attendance`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/attendance/student` | **Student, Authenticated** | Retrieve student aggregate attendance %, monthly participation trends, and subject-wise breakdowns. |
| `GET` | `/api/v1/attendance/summary` | **Student, Authenticated** | Fetch condensed attendance summary and 75% university eligibility status. |
| `POST` | `/api/v1/attendance/sessions` | **Faculty, Admin** | Create and persist a classroom attendance session. |

---

## 6. Student Coursework & Submissions (`/api/v1/assignments`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/assignments` | **Authenticated** | Retrieve all published coursework modules relevant to student's department. |
| `POST` | `/api/v1/assignments/submit` | **Student** | Submit assignment solution (GitHub repo link, PDF URL, or project archive). |
| `GET` | `/api/v1/assignments/my-submissions` | **Student** | Fetch all submitted solutions with grading status, marks awarded, and faculty feedback. |

---

## 7. Campus Events & Digital QR Passes (`/api/v1/events`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/events` | **Authenticated** | List all upcoming campus hackathons, technical symposiums, and cultural events. |
| `POST` | `/api/v1/events` | **Coordinator, Admin** | Publish a new campus event with venue, date, organizer, and registration links. |
| `DELETE` | `/api/v1/events/:id` | **Coordinator, Admin** | Delete an event and revoke associated registration passes. |
| `POST` | `/api/v1/events/:id/register` | **Student** | Register for event and instantly generate digital QR entry pass with encrypted pass token. |
| `GET` | `/api/v1/events/my-registrations` | **Student** | Retrieve student's registered event passes and dynamic QR codes. |
| `DELETE` | `/api/v1/events/registrations/:id` | **Student** | Cancel event registration and release reserved ticket pass. |

---

## 8. Placement & Career Management Hub (`/api/v1/placements`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/placements` / `/drives` | **Authenticated** | Retrieve all active corporate recruitment drives, CTC packages, and eligibility criteria. |
| `POST` | `/api/v1/placements` / `/drives` | **Admin** | Post a new corporate placement drive (Company, Package, Location, CGPA Criteria). |
| `DELETE` | `/api/v1/placements/drives/:id` | **Admin** | Delete recruitment drive and archive student applications. |
| `POST` | `/api/v1/placements/:id/check-eligibility` | **Student** | AI-assisted eligibility verification against student's CGPA, active backlogs, and resume skills. |
| `POST` | `/api/v1/placements/:id/apply` | **Student** | Submit job application with verified student profile and resume PDF. |
| `GET` | `/api/v1/placements/my-applications` | **Student** | Track submitted placement applications and interview status. |

---

## 9. Clubs & Student Societies (`/api/v1/clubs`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/clubs` | **Authenticated** | Retrieve all registered technical, cultural, and social student clubs with member counts. |
| `POST` | `/api/v1/clubs/:id/join` | **Student** | Join a student society and increment membership roster. |
| `DELETE` | `/api/v1/clubs/:id/leave` | **Student** | Leave a student society and update active memberships. |

---

## 10. Grievance & Complaint Redressal (`/api/v1/complaints`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/complaints` / `/my-tickets` | **Authenticated** | Fetch all submitted grievance tickets with resolution status (`open`, `in_progress`, `resolved`). |
| `POST` | `/api/v1/complaints` | **Authenticated** | File an anonymous or verified campus grievance ticket (Hostel, Academics, Infrastructure, Ragging Prevention). |

---

## 11. Real-time Notifications Engine (`/api/v1/notifications`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/notifications` | **Authenticated** | Fetch real-time in-app notification alerts for the logged-in user with unread counter. |
| `PATCH` | `/api/v1/notifications/:id/read` | **Authenticated** | Mark specific notification alert as read. |

---

## 12. CampusGPT AI Copilot & Chat Engine (`/api/v1/ai`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/ai/query` / `/chat` | **Authenticated** | Multi-tenant AI workspace query with role-tailored prompt engine (Academic, Admin, Coordinator, Student). Supports session persistence. |
| `GET` | `/api/v1/ai/history` | **Authenticated** | Retrieve saved conversation thread history and past message trajectories. |
| `DELETE` | `/api/v1/ai/history/:id` | **Authenticated** | Delete conversation thread from chat history. |

---

## 13. System Health & Monitoring

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | **Public** | Health check endpoint returning API operational status and timestamp. |
