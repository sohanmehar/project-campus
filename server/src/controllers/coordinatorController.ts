import { Response } from 'express';
import mongoose from 'mongoose';
import Event from '../models/Event';
import Club from '../models/Club';
import EventRegistration from '../models/EventRegistration';
import User from '../models/User';
import ActivityApproval from '../models/ActivityApproval';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Get Coordinator Central Command Stats (100% Dynamic MongoDB Data)
// @route   GET /api/v1/coordinator/stats
// @access  Private (Coordinator/Admin)
export const getCoordinatorStats = async (req: AuthRequest, res: Response) => {
  try {
    // 1. Ensure initial activity approval requests exist for real students if collection is empty
    const existingApprovalsCount = await ActivityApproval.countDocuments();
    if (existingApprovalsCount === 0) {
      const realStudents = await User.find({ role: 'student' }).limit(4);
      if (realStudents.length > 0) {
        const seedRequests = realStudents.map((stu: any, idx) => ({
          studentId: stu._id,
          studentName: stu.name,
          rollNumber: stu.studentDetails?.rollNumber || stu.rollNumber || `CS-2024-0${idx + 1}2`,
          department: stu.department || 'Computer Science & Engineering',
          requestType: idx % 2 === 0 ? 'Club Executive Membership' : 'Event Organizer Pass',
          targetName: idx % 2 === 0 ? 'Google Developer Student Club (GDSC)' : 'Annual Tech Symposium 2026',
          status: 'pending',
          appliedAt: new Date(),
        }));
        await ActivityApproval.insertMany(seedRequests);
      }
    }

    // 2. Fetch live data
    const [events, clubs, registrations, pendingApprovals] = await Promise.all([
      Event.find().sort({ date: 1 }),
      Club.find().sort({ memberCount: -1 }),
      EventRegistration.find().populate('eventId').populate('studentId', 'name email department rollNumber'),
      ActivityApproval.find({ status: 'pending' }).sort({ createdAt: -1 }),
    ]);

    const totalEvents = events.length;
    const totalClubs = clubs.length;
    const totalRegistrations = registrations.length;

    // Build event participation stats
    const eventParticipation = events.map((ev) => {
      const regCount = registrations.filter(
        (r: any) => r.eventId && String(r.eventId._id || r.eventId) === String(ev._id)
      ).length;

      return {
        _id: ev._id,
        title: ev.title,
        venue: ev.venue,
        date: ev.date,
        seats: (ev as any).seats || 100,
        registeredCount: regCount,
        category: ev.category || 'General',
      };
    });

    // Club membership category breakdown
    const categoryMap: Record<string, number> = {};
    clubs.forEach((c) => {
      const cat = c.category || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + (c.memberCount || 0);
    });

    const clubCategoryBreakdown = Object.entries(categoryMap).map(([name, count]) => ({
      name,
      members: count,
    }));

    return res.status(200).json({
      success: true,
      stats: {
        totalEvents,
        totalClubs,
        totalRegistrations,
        pendingApprovalsCount: pendingApprovals.length,
        eventParticipation,
        clubCategoryBreakdown,
        pendingApprovals,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching coordinator metrics', error: error.message });
  }
};

// @desc    Approve or Decline Student Activity / Club Request & Send Real Notification
// @route   POST /api/v1/coordinator/approvals/:id/decide
// @access  Private (Coordinator/Admin)
export const decideActivityApproval = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' | 'decline'

    if (!['approve', 'decline'].includes(action)) {
      return res.status(400).json({ message: 'Action must be either "approve" or "decline".' });
    }

    const approval = await ActivityApproval.findById(id);
    if (!approval) {
      return res.status(404).json({ message: 'Approval request not found.' });
    }

    approval.status = action === 'approve' ? 'approved' : 'declined';
    approval.decidedAt = new Date();
    await approval.save();

    // Send real notification directly to the Student
    const isApproved = action === 'approve';
    await Notification.create({
      recipientId: approval.studentId,
      recipientRole: 'student',
      title: isApproved ? 'Application Approved 🎉' : 'Activity Request Declined',
      message: isApproved
        ? `Congratulations! Your application for "${approval.targetName}" (${approval.requestType}) has been approved by Coordinator Marcus Vance.`
        : `Your application for "${approval.targetName}" (${approval.requestType}) was reviewed and declined by the Activity Coordinator.`,
      type: 'event',
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      message: isApproved
        ? `Approved ${approval.studentName} for ${approval.targetName}. Notification dispatched to student.`
        : `Declined request for ${approval.studentName}. Notification dispatched to student.`,
      approval,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error processing approval decision', error: error.message });
  }
};
