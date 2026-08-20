import { Response } from 'express';
import AttendanceSession from '../models/AttendanceSession';
import Course from '../models/Course';
import User from '../models/User';
import Department from '../models/Department';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Get student attendance summary & risk calculations
// @route   GET /api/v1/attendance/summary
// @access  Private (Student)
export const getStudentAttendanceSummary = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    if (!studentId) return res.status(401).json({ message: 'Unauthorized' });

    // Query all attendance records involving this student
    const sessions = await AttendanceSession.find({ 'records.studentId': studentId }).populate('courseId', 'code name');

    if (sessions.length === 0) {
      // 0 sessions logged for newly enrolled student
      return res.status(200).json({
        success: true,
        overallPercentage: 0.0,
        targetPercentage: 75.0,
        totalClasses: 0,
        attendedClasses: 0,
        safeAbsencesLeft: 0,
        isNewStudent: true,
        subjectWise: [],
        riskAlerts: [],
      });
    }

    let totalAttended = 0;
    let totalSessions = sessions.length;
    const subjectMap: { [key: string]: { name: string; code: string; attended: number; total: number } } = {};

    sessions.forEach((session) => {
      const course = session.courseId as any;
      const record = session.records.find((r) => r.studentId.toString() === studentId);

      if (course && record) {
        if (!subjectMap[course.code]) {
          subjectMap[course.code] = { name: course.name, code: course.code, attended: 0, total: 0 };
        }
        subjectMap[course.code].total += 1;
        if (record.status === 'present' || record.status === 'late') {
          subjectMap[course.code].attended += 1;
          totalAttended += 1;
        }
      }
    });

    const overallPercentage = totalSessions > 0 ? Number(((totalAttended / totalSessions) * 100).toFixed(1)) : 100;
    const subjectWise = Object.values(subjectMap).map((sub) => ({
      courseCode: sub.code,
      courseName: sub.name,
      percentage: Number(((sub.attended / sub.total) * 100).toFixed(1)),
      status: (sub.attended / sub.total) * 100 >= 85 ? 'Optimal' : (sub.attended / sub.total) * 100 >= 75 ? 'Good' : 'Warning',
    }));

    return res.status(200).json({
      success: true,
      overallPercentage,
      targetPercentage: 90.0,
      totalClasses: totalSessions,
      attendedClasses: totalAttended,
      safeAbsencesLeft: Math.max(0, Math.floor(totalAttended - 0.75 * totalSessions)),
      subjectWise,
      riskAlerts: subjectWise.filter((s) => s.percentage < 75),
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching attendance summary', error: error.message });
  }
};

// @desc    Record class attendance session
// @route   POST /api/v1/attendance/sessions
// @access  Private (Faculty/Admin)
export const createAttendanceSession = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, date, records } = req.body;
    const facultyId = req.user?.id;

    if (!courseId || !records || !Array.isArray(records)) {
      return res.status(400).json({ message: 'Missing courseId or student records payload.' });
    }

    const session = new AttendanceSession({
      courseId,
      facultyId,
      date: date || new Date(),
      records,
    });

    await session.save();

    return res.status(201).json({
      success: true,
      message: 'Attendance session saved successfully',
      sessionId: session._id,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error recording attendance session', error: error.message });
  }
};

// @desc    Get real-time attendance analytics & session logs for logged-in student
// @route   GET /api/v1/attendance/student
// @access  Private (Student)
export const getStudentAttendanceAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    if (!studentId) {
      return res.status(401).json({ message: 'Unauthorized student access.' });
    }

    const studentUser = await User.findById(studentId);
    const departmentName = studentUser?.department || 'Computer Science';
    const deptPrefix = departmentName.split(' ')[0] || 'Computer';

    // Fetch active department courses to map all subjects
    const deptDoc = await Department.findOne({
      $or: [
        { name: departmentName },
        { name: { $regex: new RegExp(deptPrefix, 'i') } },
        { code: 'CSE' },
      ],
    }) || await Department.findOne();

    const activeCourses = deptDoc?.activeCourses && deptDoc.activeCourses.length > 0
      ? deptDoc.activeCourses
      : [
          { code: 'CS-401', name: 'Database Systems & SQL' },
          { code: 'CS-403', name: 'Operating Systems Architecture' },
          { code: 'CS-405', name: 'Advanced Algorithms & Complexity' },
          { code: 'CS-407', name: 'Computer Networks & Protocols' },
        ];

    // Query all AttendanceSession documents in MongoDB
    const allSessions = await AttendanceSession.find().sort({ date: -1, createdAt: -1 });

    const subjectMap: Record<string, { code: string; subject: string; attended: number; total: number }> = {};

    activeCourses.forEach((c) => {
      subjectMap[c.name] = {
        code: c.code || 'CS-101',
        subject: c.name,
        attended: 0,
        total: 0,
      };
    });

    const studentLogs: any[] = [];

    allSessions.forEach((session) => {
      // Find logged-in student's record in this session
      const matchedRecord = session.records.find(
        (r: any) => String(r.studentId?._id || r.studentId) === String(studentId)
      );

      if (matchedRecord) {
        const subName = session.subject;
        if (!subjectMap[subName]) {
          subjectMap[subName] = {
            code: session.courseCode || 'CS-401',
            subject: subName,
            attended: 0,
            total: 0,
          };
        }

        subjectMap[subName].total += 1;
        if (matchedRecord.status === 'present' || matchedRecord.status === 'late') {
          subjectMap[subName].attended += 1;
        }

        studentLogs.push({
          _id: session._id,
          subject: session.subject,
          date: new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          slot: session.slot,
          facultyName: session.facultyName || 'Dr. Sarah Jenkins',
          status: matchedRecord.status.toUpperCase(),
        });
      }
    });

    // Format analytics response
    const subjectAnalytics = Object.values(subjectMap).map((sub) => {
      const percentage = sub.total > 0 ? Number(((sub.attended / sub.total) * 100).toFixed(1)) : 0;
      return {
        ...sub,
        percentage,
        status: sub.total === 0 ? 'Not Started' : percentage >= 75 ? 'Optimal' : 'At Risk',
      };
    });

    const totalAttended = studentLogs.filter((l) => l.status === 'PRESENT' || l.status === 'LATE').length;
    const totalLectures = studentLogs.length;
    const overallPercentage = totalLectures > 0 
      ? Number(((totalAttended / totalLectures) * 100).toFixed(1)) 
      : 0.0;

    return res.status(200).json({
      success: true,
      overallPercentage,
      totalAttended,
      totalLectures,
      isNewStudent: totalLectures === 0,
      subjectAnalytics,
      logs: studentLogs,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error calculating attendance analytics', error: error.message });
  }
};