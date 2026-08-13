import { Response } from 'express';
import mongoose from 'mongoose';
import Assignment from '../models/Assignment';
import Submission from '../models/Submission';
import AttendanceSession from '../models/AttendanceSession';
import Notice from '../models/Notice';
import User from '../models/User';
import Department from '../models/Department';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Get Faculty Dashboard Overview Metrics
// @route   GET /api/v1/faculty/dashboard
// @access  Private (Faculty)
export const getFacultyDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const facultyId = req.user?.id;
    const facultyUser = await User.findById(facultyId);

    const activeAssignments = await Assignment.countDocuments({ createdBy: facultyId });
    const pendingSubmissions = await Submission.countDocuments({ status: 'submitted' });
    const totalAttendanceSessions = await AttendanceSession.countDocuments({ facultyId });
    const totalNotices = await Notice.countDocuments({ postedBy: facultyId });

    const departmentStudents = await User.countDocuments({ 
      role: 'student', 
      department: facultyUser?.department || 'Computer Science' 
    });

    return res.status(200).json({
      success: true,
      metrics: {
        activeAssignments,
        pendingSubmissions,
        totalAttendanceSessions,
        totalNotices,
        totalStudents: departmentStudents,
        department: facultyUser?.department || 'Computer Science',
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching faculty metrics', error: error.message });
  }
};

// ==========================================
// 1. ATTENDANCE ENGINE
// ==========================================

// @desc    Faculty: Take/Submit Attendance Session
// @route   POST /api/v1/faculty/attendance
// @access  Private (Faculty)
export const markAttendanceSession = async (req: AuthRequest, res: Response) => {
  try {
    const facultyId = req.user?.id;
    const facultyUser = await User.findById(facultyId);
    const { subject, slot, date, records, courseId } = req.body;

    if (!subject || !records || !Array.isArray(records)) {
      return res.status(400).json({ message: 'Subject and student attendance records are required.' });
    }

    const formattedRecords = records.map((r: any) => ({
      studentId: mongoose.Types.ObjectId.isValid(r.studentId)
        ? new mongoose.Types.ObjectId(r.studentId)
        : new mongoose.Types.ObjectId(),
      status: r.status || 'present',
    }));

    const session = new AttendanceSession({
      courseId: courseId && mongoose.Types.ObjectId.isValid(courseId)
        ? new mongoose.Types.ObjectId(courseId)
        : new mongoose.Types.ObjectId(),
      facultyId: facultyId && mongoose.Types.ObjectId.isValid(facultyId)
        ? new mongoose.Types.ObjectId(facultyId)
        : new mongoose.Types.ObjectId(),
      facultyName: facultyUser?.name || 'Dr. Sarah Jenkins',
      subject,
      department: facultyUser?.department || 'Computer Science',
      slot: slot || '10:00 AM - 11:00 AM',
      date: date ? new Date(date) : new Date(),
      records: formattedRecords,
    });

    await session.save();

    return res.status(201).json({
      success: true,
      message: `Attendance session for '${subject}' saved successfully to MongoDB.`,
      session,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Error marking attendance' });
  }
};

// @desc    Get saved attendance session for subject & date
// @route   GET /api/v1/faculty/attendance/session
// @access  Private (Faculty)
export const getAttendanceSession = async (req: AuthRequest, res: Response) => {
  try {
    const { subject } = req.query;

    if (!subject) {
      return res.status(400).json({ message: 'Subject parameter is required.' });
    }

    const existingSession = await AttendanceSession.findOne({
      subject: subject as string,
    }).sort({ createdAt: -1 });

    if (!existingSession) {
      return res.status(200).json({ success: true, session: null });
    }

    return res.status(200).json({ success: true, session: existingSession });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching session', error: error.message });
  }
};

// @desc    Get Students List in Faculty's Department to Take Attendance
// @route   GET /api/v1/faculty/students
// @access  Private (Faculty)
export const getStudentsForAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const facultyUser = await User.findById(req.user?.id);
    const dept = facultyUser?.department || 'Computer Science';

    const students = await User.find({ role: 'student', department: dept }).select('name email department studentDetails');

    return res.status(200).json({ success: true, students });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
};

// ==========================================
// 2. ASSIGNMENTS & REVIEWS
// ==========================================

// @desc    Faculty: Create Assignment
// @route   POST /api/v1/faculty/assignments
// @access  Private (Faculty)
export const createAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const facultyId = req.user?.id;
    const facultyUser = await User.findById(facultyId);
    const { title, description, subject, deadline, totalMarks, attachmentUrl } = req.body;

    if (!title || !subject || !deadline) {
      return res.status(400).json({ message: 'Title, subject, and deadline are required.' });
    }

    const assignment = new Assignment({
      title,
      description,
      subject,
      department: facultyUser?.department || 'Computer Science',
      deadline: new Date(deadline),
      totalMarks: Number(totalMarks) || 100,
      attachmentUrl: attachmentUrl || '',
      createdBy: facultyId,
      facultyName: facultyUser?.name || 'Faculty Member',
    });

    await assignment.save();

    return res.status(201).json({
      success: true,
      message: 'Assignment published successfully.',
      assignment,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error creating assignment', error: error.message });
  }
};

// @desc    Faculty: Get all student assignment submissions
// @route   GET /api/v1/faculty/submissions
// @access  Private (Faculty)
export const getFacultySubmissions = async (req: AuthRequest, res: Response) => {
  try {
    let submissions = await Submission.find().sort({ createdAt: -1 });

    // Seed 3 persistent database documents into MongoDB Atlas if collection is completely empty
    if (submissions.length === 0) {
      const seedSubmissions = [
        {
          studentName: 'Alex Mercer',
          rollNumber: 'CS-2024-042',
          assignmentTitle: 'SQL Database Indexing & Optimization',
          fileUrl: 'https://github.com/alex-mercer/sql-index-opt',
          status: 'submitted',
          marksObtained: null,
          totalMarks: 50,
          feedback: '',
        },
        {
          studentName: 'Alex Mercer',
          rollNumber: 'CS-2024-042',
          assignmentTitle: 'Neural Network Mapping & Hyperparameters',
          fileUrl: 'https://github.com/alex-mercer/nn-hyperparams',
          status: 'submitted',
          marksObtained: null,
          totalMarks: 100,
          feedback: '',
        },
        {
          studentName: 'Alex Mercer',
          rollNumber: 'CS-2024-042',
          assignmentTitle: 'Course Submission',
          fileUrl: 'https://github.com/alex-mercer/course-sub',
          status: 'submitted',
          marksObtained: null,
          totalMarks: 100,
          feedback: '',
        },
      ];

      await Submission.insertMany(seedSubmissions as any);
      submissions = await Submission.find().sort({ createdAt: -1 });
    }

    return res.status(200).json({ success: true, submissions });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching submissions', error: error.message });
  }
};

// @desc    Faculty: Review & Grade Student Submission
// @route   PATCH /api/v1/faculty/submissions/:id/grade
// @access  Private (Faculty)
export const gradeSubmission = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const targetId = Array.isArray(id) ? id[0] : id;
    const { marksObtained, feedback } = req.body;

    if (!targetId || !mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ message: 'Invalid submission ObjectId.' });
    }

    const updatedSubmission = await Submission.findByIdAndUpdate(
      targetId,
      {
        $set: {
          marksObtained: Number(marksObtained),
          feedback: feedback || 'Graded by faculty.',
          status: 'graded',
        },
      },
      { new: true }
    );

    if (!updatedSubmission) {
      return res.status(404).json({ message: 'Submission record not found in MongoDB.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Grade updated and saved permanently to MongoDB.',
      submission: updatedSubmission,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error grading submission', error: error.message });
  }
};

// ==========================================
// 3. NOTICES & STUDY MATERIALS
// ==========================================

// @desc    Faculty: Publish Notice or Upload Study Material
// @route   POST /api/v1/faculty/notices
// @access  Private (Faculty)
export const createNotice = async (req: AuthRequest, res: Response) => {
  try {
    const facultyId = req.user?.id;
    const facultyUser = await User.findById(facultyId);
    const { title, content, subject, noticeType, attachmentUrl } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    const notice = new Notice({
      title,
      content,
      subject: subject || 'General',
      department: facultyUser?.department || 'Computer Science',
      attachmentUrl: attachmentUrl || '',
      postedBy: facultyId,
      facultyName: facultyUser?.name || 'Faculty Member',
      noticeType: noticeType || 'announcement',
    });

    await notice.save();

    return res.status(201).json({
      success: true,
      message: `${noticeType === 'study_material' ? 'Study Material' : 'Notice'} published to MongoDB.`,
      notice,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error publishing notice', error: error.message });
  }
};

// @desc    Get All Notices/Materials
// @route   GET /api/v1/faculty/notices
// @access  Private
export const getNotices = async (req: AuthRequest, res: Response) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, notices });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching notices', error: error.message });
  }
};

// @desc    Faculty: Update Course Syllabus, Units & Reference Books
// @route   PUT /api/v1/faculty/courses/:code/syllabus
// @access  Private (Faculty)
export const updateCourseSyllabus = async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.params;
    const codeParam = Array.isArray(code) ? code[0] : code || '';
    if (!codeParam) return res.status(400).json({ message: 'Course code parameter is required.' });
    const { units, books, instructor } = req.body;

    const codeUpper = codeParam.toUpperCase();
    const dept = await Department.findOne({ 'activeCourses.code': codeUpper });

    if (!dept) {
      return res.status(404).json({ message: `Course ${code} not found in department records.` });
    }

    const courseIndex = dept.activeCourses.findIndex(
      (c) => c.code.toUpperCase() === codeUpper
    );

    if (courseIndex !== -1) {
      const course: any = dept.activeCourses[courseIndex];

      if (units) {
        course.units = Array.isArray(units)
          ? units
          : units.split('\n').filter((u: string) => u.trim().length > 0);
      }
      if (books) course.books = books;
      if (instructor) course.instructor = instructor;

      await dept.save();

      return res.status(200).json({
        success: true,
        message: `Syllabus for ${codeUpper} updated successfully in MongoDB.`,
        course,
      });
    }

    return res.status(400).json({ message: 'Course record matching failed.' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error updating course syllabus', error: error.message });
  }
};