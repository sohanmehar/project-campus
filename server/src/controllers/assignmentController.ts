import { Response } from 'express';
import mongoose from 'mongoose';
import Assignment from '../models/Assignment';
import Submission from '../models/Submission';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Get all assignments for student with submission status
// @route   GET /api/v1/assignments
// @access  Private
export const getAssignments = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    let assignments = await Assignment.find().sort({ deadline: 1 });

    // Seed mock assignments into MongoDB if collection is empty so we have valid ObjectIds
    if (assignments.length === 0) {
      const validFacultyId = (studentId && mongoose.Types.ObjectId.isValid(studentId))
        ? new mongoose.Types.ObjectId(studentId)
        : new mongoose.Types.ObjectId('665000000000000000000001');

      const defaultAssignments: {
        _id: mongoose.Types.ObjectId;
        title: string;
        subject: string;
        courseName: string;
        courseCode: string;
        facultyId: mongoose.Types.ObjectId;
        deadline: Date;
        totalMarks: number;
        priority: 'high' | 'medium' | 'low';
        description: string;
      }[] = [
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Neural Network Mapping & Hyperparameters',
          subject: 'Cognitive Neuroscience',
          courseName: 'Cognitive Neuroscience',
          courseCode: 'BIO-302',
          facultyId: validFacultyId,
          deadline: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours left
          totalMarks: 100,
          priority: 'high',
          description: 'Implement a 3-layer neural map visualizing synaptic transmission probabilities.',
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'SQL Database Indexing & Optimization',
          subject: 'Database Systems & SQL',
          courseName: 'Database Systems & SQL',
          courseCode: 'CS-401',
          facultyId: validFacultyId,
          deadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
          totalMarks: 50,
          priority: 'medium',
          description: 'Analyze query execution plans and create B-Tree indexes for high concurrency.',
        },
      ];

      assignments = await Assignment.insertMany(defaultAssignments);
    }

    const submissions = studentId ? await Submission.find({ studentId }) : [];
    const submissionMap = new Map(
      submissions
        .filter((s) => s.assignmentId !== undefined && s.assignmentId !== null)
        .map((s) => [s.assignmentId!.toString(), s])
    );

    const formattedAssignments = assignments.map((asg) => {
      const sub = submissionMap.get(asg._id.toString());
      return {
        _id: asg._id,
        title: asg.title,
        subject: asg.subject || asg.courseName,
        courseName: asg.courseName,
        courseCode: asg.courseCode,
        deadline: asg.deadline,
        totalMarks: asg.totalMarks,
        priority: asg.priority,
        description: asg.description,
        status: sub ? 'submitted' : 'pending',
        submissionDetails: sub || null,
      };
    });

    return res.status(200).json({ success: true, assignments: formattedAssignments });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching assignments', error: error.message });
  }
};

// @desc    Submit solution for an assignment
// @route   POST /api/v1/assignments/submit
// @access  Private (Student)
export const submitAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    const { assignmentId, fileUrl, submissionUrl } = req.body;
    const finalUrl = fileUrl || submissionUrl || '';

    if (!finalUrl) {
      return res.status(400).json({ message: 'Solution URL or attachment link is required.' });
    }

    const studentUser = await User.findById(studentId);
    const studentName = studentUser?.name || 'Alex Mercer';
    const rollNumber = studentUser?.studentDetails?.rollNumber || 'CS-2024-042';

    let assignmentTitle = 'Course Submission';
    let totalMarks = 100;

    if (assignmentId && mongoose.Types.ObjectId.isValid(assignmentId)) {
      const assignmentDoc = await Assignment.findById(assignmentId);
      if (assignmentDoc) {
        assignmentTitle = assignmentDoc.title;
        totalMarks = assignmentDoc.totalMarks || 100;
      }
    }

    // Check if student already submitted solution
    let submission = await Submission.findOne({
      studentId: studentId ? new mongoose.Types.ObjectId(studentId) : undefined,
      assignmentTitle,
    });

    if (submission) {
      submission.fileUrl = finalUrl;
      submission.status = 'submitted';
      await submission.save();
    } else {
      submission = new Submission({
        assignmentId: assignmentId && mongoose.Types.ObjectId.isValid(assignmentId) ? assignmentId : undefined,
        studentId: studentId && mongoose.Types.ObjectId.isValid(studentId) ? studentId : undefined,
        studentName,
        rollNumber,
        assignmentTitle,
        fileUrl: finalUrl,
        status: 'submitted',
        marksObtained: null,
        totalMarks,
      });
      await submission.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Solution submitted successfully to MongoDB Atlas.',
      submission,
    });
  } catch (error: any) {
    console.error('Error submitting assignment:', error);
    return res.status(500).json({ message: 'Error submitting solution', error: error.message });
  }
};

// @desc    Get submissions submitted specifically by logged-in student
// @route   GET /api/v1/assignments/my-submissions
// @access  Private (Student)
export const getMySubmissions = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.id;

    if (!studentId) {
      return res.status(401).json({ message: 'Unauthorized student access.' });
    }

    const submissions = await Submission.find({
      studentId: new mongoose.Types.ObjectId(studentId),
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      submissions,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching student submissions', error: error.message });
  }
};

// @desc    Re-open assignment submission window for a specific student
// @route   POST /api/v1/assignments/:id/reopen
// @access  Private (Faculty/Admin)
export const reopenSubmission = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { studentId, extensionHours } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required to re-open submission.' });
    }

    const hours = Number(extensionHours) || 24;
    const reopenedUntil = new Date(Date.now() + hours * 60 * 60 * 1000);

    const assignmentDoc = await Assignment.findById(id);
    const studentUser = await User.findById(studentId);

    let submission = await Submission.findOne({
      assignmentId: new mongoose.Types.ObjectId(id),
      studentId: new mongoose.Types.ObjectId(studentId),
    });

    if (submission) {
      submission.isReopened = true;
      submission.reopenedUntil = reopenedUntil;
      await submission.save();
    } else {
      submission = new Submission({
        assignmentId: new mongoose.Types.ObjectId(id),
        studentId: new mongoose.Types.ObjectId(studentId),
        studentName: studentUser?.name || 'Student',
        rollNumber: studentUser?.studentDetails?.rollNumber || 'CS-STU',
        assignmentTitle: assignmentDoc?.title || 'Assignment',
        status: 'submitted',
        fileUrl: '',
        isReopened: true,
        reopenedUntil,
      });
      await submission.save();
    }

    return res.status(200).json({
      success: true,
      message: `Submission window successfully reopened for student until ${reopenedUntil.toLocaleString()}`,
      submission,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error reopening assignment submission', error: error.message });
  }
};