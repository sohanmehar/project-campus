import { Response } from 'express';
import mongoose from 'mongoose';
import Complaint from '../models/Complaint';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Get user grievances (auto-seeds if empty for logged-in student)
// @route   GET /api/v1/complaints/my-tickets
// @access  Private (Student)
export const getComplaints = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.id;

    if (!studentId) {
      return res.status(401).json({ message: 'Unauthorized student access.' });
    }

    const objectStudentId = new mongoose.Types.ObjectId(studentId);
    let complaints = await Complaint.find({
      $or: [{ studentId }, { studentId: objectStudentId }],
    }).sort({ createdAt: -1 });

    if (complaints.length === 0) {
      const defaultComplaints = [
        {
          _id: new mongoose.Types.ObjectId(),
          ticketId: 'CMP-2026-042',
          studentId: objectStudentId,
          category: 'IT & Wi-Fi',
          description: 'Experiencing frequent disconnections and slow speeds in Block C library 3rd floor.',
          location: 'Block C Library',
          priority: 'high',
          status: 'In Progress',
          assignedTo: 'Campus IT Cell',
        },
        {
          _id: new mongoose.Types.ObjectId(),
          ticketId: 'CMP-2026-018',
          studentId: objectStudentId,
          category: 'Academic',
          description: 'Incorrect mid-semester score posted for Advanced Algorithms.',
          location: 'Exam Cell',
          priority: 'medium',
          status: 'Resolved',
          assignedTo: 'Prof. Miller',
          resolutionNotes: 'Grade recalculated and updated in portal.',
        },
      ];

      // cast to any to satisfy TypeScript when inserting default documents
      const inserted = await Complaint.insertMany(defaultComplaints as any);
      complaints = inserted as any;
    }

    return res.status(200).json({ success: true, complaints });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching complaints', error: error.message });
  }
};

// @desc    Submit a new complaint
// @route   POST /api/v1/complaints
// @access  Private (Student)
export const createComplaint = async (req: AuthRequest, res: Response) => {
  try {
    const { category, description, location, priority } = req.body;
    const studentId = req.user?.id;

    if (!studentId) return res.status(401).json({ message: 'Unauthorized access.' });
    if (!description || !category) {
      return res.status(400).json({ message: 'Category and description are required.' });
    }

    const ticketId = `CMP-2026-${Math.floor(100 + Math.random() * 900)}`;

    const complaint = new Complaint({
      ticketId,
      studentId: new mongoose.Types.ObjectId(studentId),
      category,
      description,
      location: location || 'Campus Main',
      priority: priority || 'medium',
      status: 'Submitted',
      assignedTo: category === 'IT & Wi-Fi' ? 'IT Cell' : 'Department Admin',
    });

    await complaint.save();

    return res.status(201).json({
      success: true,
      message: 'Grievance ticket created successfully in MongoDB Atlas.',
      complaint,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error submitting complaint', error: error.message });
  }
};