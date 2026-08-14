import { Response } from 'express';
import mongoose from 'mongoose';
import Club from '../models/Club';
import User from '../models/User';
import ActivityApproval from '../models/ActivityApproval';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Get all campus clubs with student membership status
// @route   GET /api/v1/clubs
// @access  Private
export const getClubs = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    let clubs = await Club.find().sort({ memberCount: -1 });

    if (clubs.length === 0) {
      const defaultClubs = [
        {
          name: 'Google Developer Student Club (GDSC)',
          category: 'Technical',
          description: 'Peer-to-peer learning community focused on Cloud, Android, Web Development, and Google AI Technologies.',
          leadName: 'Rohan Sharma',
          leadEmail: 'gdsc.lead@campusgpt.edu',
          meetingSchedule: 'Tuesdays & Thursdays at 5:00 PM',
          roomLocation: 'Computing Lab 4, Block A',
          memberCount: 0,
          members: [],
          pendingApplicants: [],
        },
        {
          name: 'Robotics & Automation Society (RAS)',
          category: 'Technical',
          description: 'Hands-on building of autonomous bots, IoT sensors, drone flight controllers, and embedded systems.',
          leadName: 'Priya Patel',
          leadEmail: 'robotics@campusgpt.edu',
          meetingSchedule: 'Wednesdays at 4:30 PM',
          roomLocation: 'Mechatronics Workshop 1',
          memberCount: 0,
          members: [],
          pendingApplicants: [],
        },
        {
          name: 'CSI Student Chapter',
          category: 'Academic',
          description: 'Computer Society of India student branch organizing annual technical symposiums, hackathons, and research paper workshops.',
          leadName: 'Ananya Verma',
          leadEmail: 'csi@campusgpt.edu',
          meetingSchedule: 'Fridays at 3:30 PM',
          roomLocation: 'Seminar Hall 2',
          memberCount: 0,
          members: [],
          pendingApplicants: [],
        },
        {
          name: 'AI & Machine Learning Research Cell',
          category: 'Technical',
          description: 'Advanced deep learning group publishing papers, training open-source LLMs, and competing in Kaggle challenges.',
          leadName: 'Dr. Sarah Jenkins & Alex Mercer',
          leadEmail: 'ai.research@campusgpt.edu',
          meetingSchedule: 'Mondays at 4:00 PM',
          roomLocation: 'AI Innovation Hub, Block C',
          memberCount: 0,
          members: [],
          pendingApplicants: [],
        },
        {
          name: 'Campus Cultural & Arts Society',
          category: 'Cultural',
          description: 'Uniting musicians, dancers, theatrical artists, and stage decorators for annual cultural fests and inter-college events.',
          leadName: 'Devansh Kulkarni',
          leadEmail: 'cultural@campusgpt.edu',
          meetingSchedule: 'Saturdays at 2:00 PM',
          roomLocation: 'Main Auditorium Stage',
          memberCount: 0,
          members: [],
          pendingApplicants: [],
        },
        {
          name: 'Rotaract Youth Club',
          category: 'Social',
          description: 'Community service and youth leadership organization conducting campus blood donation drives and literacy programs.',
          leadName: 'Sneha Roy',
          leadEmail: 'rotaract@campusgpt.edu',
          meetingSchedule: 'Sundays at 11:00 AM',
          roomLocation: 'SAC Meeting Room 1',
          memberCount: 0,
          members: [],
          pendingApplicants: [],
        },
      ];
      clubs = (await Club.insertMany(defaultClubs as any)) as any;
    }

    const formattedClubs = clubs.map((club) => {
      const isMember = studentId
        ? club.members?.some((m) => m.toString() === studentId.toString())
        : false;

      const isPending = studentId
        ? club.pendingApplicants?.some((m) => m.toString() === studentId.toString())
        : false;

      // Real member count strictly from actual database members
      const realMemberCount = club.members ? club.members.length : 0;

      return {
        _id: club._id,
        name: club.name,
        category: club.category,
        description: club.description,
        leadName: club.leadName,
        leadEmail: club.leadEmail,
        meetingSchedule: club.meetingSchedule,
        roomLocation: club.roomLocation,
        memberCount: realMemberCount,
        isMember: !!isMember,
        isPending: !!isPending,
      };
    });

    return res.status(200).json({ success: true, clubs: formattedClubs });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching campus clubs', error: error.message });
  }
};

// @desc    Apply for club membership (routes to Coordinator approval queue)
// @route   POST /api/v1/clubs/:id/join
// @access  Private (Student)
export const joinClub = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const studentId = req.user?.id;

    if (!studentId) {
      return res.status(401).json({ message: 'Unauthorized student access.' });
    }

    const club = await Club.findById(id);
    if (!club) {
      return res.status(404).json({ message: 'Club not found.' });
    }

    const userObjId = new mongoose.Types.ObjectId(studentId);
    const alreadyMember = club.members?.some((m) => m.toString() === userObjId.toString());

    if (alreadyMember) {
      return res.status(400).json({ message: `You are already a registered member of ${club.name}.` });
    }

    if (!club.pendingApplicants) {
      club.pendingApplicants = [];
    }

    const alreadyPending = club.pendingApplicants.some((m) => m.toString() === userObjId.toString());
    if (alreadyPending) {
      return res.status(400).json({ message: `Your application for ${club.name} is already pending Coordinator review.` });
    }

    club.pendingApplicants.push(userObjId);
    await club.save();

    // Create an ActivityApproval record in MongoDB for the Coordinator Action Queue
    try {
      const studentUser = await User.findById(studentId);
      await ActivityApproval.create({
        studentId: userObjId,
        studentName: studentUser?.name || 'Student Member',
        rollNumber: studentUser?.studentDetails?.rollNumber || 'STU-001',
        department: studentUser?.department || 'Computer Science & Engineering',
        requestType: 'Club Executive Membership',
        targetName: club.name,
        status: 'pending',
        appliedAt: new Date(),
      });
    } catch (err) {
      console.warn('Could not record ActivityApproval for club join:', err);
    }

    return res.status(200).json({
      success: true,
      message: `Membership application submitted for ${club.name}! Pending Coordinator approval.`,
      club: {
        _id: club._id,
        name: club.name,
        memberCount: club.memberCount,
        isMember: false,
        isPending: true,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error joining club', error: error.message });
  }
};

// @desc    Leave club membership
// @route   DELETE /api/v1/clubs/:id/leave
// @access  Private (Student)
export const leaveClub = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const studentId = req.user?.id;

    if (!studentId) {
      return res.status(401).json({ message: 'Unauthorized student access.' });
    }

    const club = await Club.findById(id);
    if (!club) {
      return res.status(404).json({ message: 'Club not found.' });
    }

    const wasMember = club.members?.some((m) => m.toString() === studentId.toString());
    club.members = (club.members || []).filter((m) => m.toString() !== studentId.toString());
    club.pendingApplicants = (club.pendingApplicants || []).filter((m) => m.toString() !== studentId.toString());
    
    if (wasMember) {
      club.memberCount = Math.max(0, (club.memberCount || 1) - 1);
    }
    await club.save();

    // Cancel any pending approval in MongoDB
    try {
      await ActivityApproval.deleteMany({
        studentId: new mongoose.Types.ObjectId(studentId),
        targetName: club.name,
        status: 'pending',
      });
    } catch (dErr) {
      // Ignore
    }

    return res.status(200).json({
      success: true,
      message: `Left ${club.name}.`,
      club: {
        _id: club._id,
        name: club.name,
        memberCount: club.memberCount,
        isMember: false,
        isPending: false,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error leaving club', error: error.message });
  }
};
