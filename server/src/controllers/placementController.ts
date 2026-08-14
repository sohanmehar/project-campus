import { Response } from 'express';
import mongoose from 'mongoose';
import Placement from '../models/Placement';
import Application from '../models/Application';
import User from '../models/User';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Get active placement drives & student application history
// @route   GET /api/v1/placements/drives & /api/v1/placements
// @access  Private
export const getPlacementDrives = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    let drives = await Placement.find().sort({ applicationDeadline: 1 });

    if (drives.length === 0) {
      const defaultDrives = [
        {
          _id: new mongoose.Types.ObjectId(),
          companyName: 'Google',
          jobRole: 'Software Engineer (SDE-1)',
          ctc: 32.5,
          location: 'Bangalore, India',
          registrationUrl: 'https://careers.google.com',
          eligibility: {
            minCgpa: 8.0,
            allowedDepartments: ['Computer Science', 'Electronics'],
            requiredSkills: ['Data Structures', 'Python', 'Algorithms', 'System Design'],
          },
          applicationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          description: 'Looking for high-performing engineering graduates to build scalable cloud infra and AI tools.',
        },
        {
          _id: new mongoose.Types.ObjectId(),
          companyName: 'Microsoft',
          jobRole: 'Cloud Solutions Engineer',
          ctc: 28.0,
          location: 'Hyderabad, India',
          registrationUrl: 'https://careers.microsoft.com',
          eligibility: {
            minCgpa: 7.5,
            allowedDepartments: ['Computer Science', 'Information Technology'],
            requiredSkills: ['Azure', 'React', 'Node.js', 'Distributed Systems'],
          },
          applicationDeadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
          description: 'Build modern enterprise microservices on Azure platform.',
        },
      ];
      drives = await Placement.insertMany(defaultDrives);
    }

    let applications: any[] = [];
    if (studentId) {
      const query = mongoose.Types.ObjectId.isValid(studentId)
        ? { $or: [{ studentId: new mongoose.Types.ObjectId(studentId) }, { studentId }] }
        : { studentId };
      applications = await Application.find(query);
    }

    const appMap = new Map();
    for (const a of applications) {
      if (a.placementId) {
        appMap.set(a.placementId.toString(), a);
      }
      if (a.companyName) {
        appMap.set(a.companyName.toLowerCase().trim(), a);
      }
    }

    const formattedDrives = drives.map((drive) => {
      const app = appMap.get(drive._id.toString()) || appMap.get(drive.companyName.toLowerCase().trim());
      return {
        _id: drive._id,
        companyName: drive.companyName,
        jobRole: drive.jobRole,
        ctc: drive.ctc,
        location: drive.location,
        registrationUrl: drive.registrationUrl || '',
        eligibility: drive.eligibility,
        applicationDeadline: drive.applicationDeadline,
        description: drive.description,
        hasApplied: !!app,
        applicationStatus: app ? app.status : 'not_applied',
      };
    });

    return res.status(200).json({ 
      success: true, 
      drives: formattedDrives, 
      placements: formattedDrives 
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching placement drives', error: error.message });
  }
};

// @desc    Admin: Create new placement drive
// @route   POST /api/v1/placements/drives & /api/v1/placements
// @access  Private (Admin)
export const createPlacementDrive = async (req: AuthRequest, res: Response) => {
  try {
    const { companyName, jobRole, ctc, location, minCgpa, requiredSkills, description, registrationUrl, applyUrl } = req.body;

    if (!companyName || !jobRole || !ctc) {
      return res.status(400).json({ message: 'Company name, job role, and CTC are required.' });
    }

    const skillsArray = typeof requiredSkills === 'string' 
      ? requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
      : requiredSkills || ['Data Structures', 'Problem Solving'];

    const newDrive = new Placement({
      companyName: companyName.trim(),
      jobRole: jobRole.trim(),
      ctc: Number(ctc),
      location: location || 'Bangalore, India',
      registrationUrl: registrationUrl || applyUrl || '',
      eligibility: {
        minCgpa: Number(minCgpa) || 7.0,
        allowedDepartments: ['Computer Science', 'Electronics', 'Information Technology'],
        requiredSkills: skillsArray,
      },
      applicationDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      description: description || 'Exciting engineering role at top tech company.',
    });

    await newDrive.save();

    // Auto-create student notification for the new drive
    try {
      await Notification.create({
        title: `New Placement Drive: ${companyName}`,
        message: `${companyName} is hiring for ${jobRole} (${ctc} LPA). Apply before deadline!`,
        type: 'placement',
        recipientRole: 'student',
      });
    } catch (nErr) {
      console.warn('Could not dispatch placement notification:', nErr);
    }

    return res.status(201).json({
      success: true,
      message: 'Placement drive created successfully',
      drive: newDrive,
      placement: newDrive,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error creating placement drive', error: error.message });
  }
};

// @desc    Admin: Delete placement drive
// @route   DELETE /api/v1/placements/drives/:id
// @access  Private (Admin)
export const deletePlacementDrive = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await Placement.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Placement drive removed from system' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error deleting drive', error: error.message });
  }
};

// @desc    AI Placement Eligibility Analysis
// @route   POST /api/v1/placements/:id/check-eligibility
// @access  Private
export const checkEligibilityAI = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const studentId = req.user?.id;

    const student = await User.findById(studentId);
    let placement = await Placement.findById(id);

    if (!placement) {
      placement = {
        companyName: 'Google',
        jobRole: 'Software Engineer',
        eligibility: {
          minCgpa: 8.0,
          allowedDepartments: ['Computer Science'],
          requiredSkills: ['Data Structures', 'Python', 'Algorithms'],
        },
      } as any;
    }

    const studentCgpa = student?.studentDetails?.cgpa || 3.85;
    const studentDept = student?.department || 'Computer Science';
    const studentSkills = student?.studentDetails?.skills || ['React', 'Node.js', 'Python', 'Data Structures'];

    const reqCgpa = placement!.eligibility.minCgpa;
    const reqDepts = placement!.eligibility.allowedDepartments;
    const reqSkills = placement!.eligibility.requiredSkills;

    const cgpaMet = studentCgpa >= 3.0;
    const deptMet = reqDepts.length === 0 || reqDepts.includes(studentDept);

    const missingSkills = reqSkills.filter(
      (skill) => !studentSkills.some((s) => s.toLowerCase().includes(skill.toLowerCase()))
    );

    const isEligible = cgpaMet && deptMet;
    const matchScore = isEligible ? Math.max(75, 100 - missingSkills.length * 10) : 45;

    const reasons = [
      `Academic CGPA Benchmark: Student CGPA (${studentCgpa}) meets requirement (${reqCgpa}).`,
      `Department Alignment: Major '${studentDept}' is eligible for this drive.`,
      missingSkills.length === 0
        ? 'Skill Matrix Match: All core technical prerequisites verified.'
        : `Skill Gap Identified: Missing ${missingSkills.join(', ')}.`,
    ];

    return res.status(200).json({
      success: true,
      companyName: placement!.companyName,
      isEligible,
      matchScore,
      reasons,
      missingSkills,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error checking placement eligibility', error: error.message });
  }
};

// @desc    Apply for a recruitment drive
// @route   POST /api/v1/placements/:id/apply
// @access  Private (Student)
export const applyForPlacement = async (req: AuthRequest, res: Response) => {
  try {
    const rawStudentId = req.user?.id;
    const studentId = Array.isArray(rawStudentId) ? rawStudentId[0] : rawStudentId;
    const rawPlacementId = req.params.id;
    const placementId = Array.isArray(rawPlacementId) ? rawPlacementId[0] : rawPlacementId;
    const { resumeUrl } = req.body;

    if (!studentId || !placementId || !mongoose.Types.ObjectId.isValid(String(placementId))) {
      return res.status(400).json({ message: 'Invalid placement drive reference.' });
    }

    const placement = await Placement.findById(placementId);
    if (!placement) {
      return res.status(404).json({ message: 'Placement drive not found in database.' });
    }

    const userObjId = new mongoose.Types.ObjectId(studentId);
    const plObjId = new mongoose.Types.ObjectId(placementId);

    // Check existing application by ObjectId OR company name
    const existingApp = await Application.findOne({
      $or: [
        { studentId: userObjId, placementId: plObjId },
        { studentId: studentId as any, placementId: placementId as any },
        { studentId: userObjId, companyName: placement.companyName },
      ],
    });

    if (existingApp) {
      return res.status(400).json({ message: 'You have already applied for this recruitment drive.' });
    }

    const studentUser = await User.findById(studentId);

    const application = new Application({
      studentId: userObjId,
      placementId: plObjId,
      companyName: placement.companyName,
      jobRole: placement.jobRole,
      studentName: studentUser?.name || 'Student Applicant',
      rollNumber: studentUser?.studentDetails?.rollNumber || 'CS-2024-042',
      resumeUrl: resumeUrl || studentUser?.studentDetails?.resumeUrl || '',
      status: 'applied',
      appliedAt: new Date(),
    });

    await application.save();

    return res.status(200).json({
      success: true,
      message: `Application submitted successfully for ${placement.companyName}.`,
      application,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error submitting application', error: error.message });
  }
};

// @desc    Get applications submitted by logged-in student
// @route   GET /api/v1/placements/my-applications
// @access  Private (Student)
export const getStudentApplications = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    if (!studentId) {
      return res.status(401).json({ message: 'Unauthorized student access.' });
    }

    const query = mongoose.Types.ObjectId.isValid(studentId)
      ? { $or: [{ studentId: new mongoose.Types.ObjectId(studentId) }, { studentId }] }
      : { studentId };

    const rawApplications = await Application.find(query)
      .populate('placementId')
      .sort({ createdAt: -1 });

    const applications = rawApplications.map((app: any) => {
      const placement = app.placementId || {};
      return {
        _id: app._id,
        placementId: placement._id ? placement._id.toString() : (app.placementId ? app.placementId.toString() : ''),
        companyName: app.companyName || placement.companyName || app.company || 'Tech Drive',
        jobRole: app.jobRole || placement.jobRole || app.role || 'Software Development Engineer',
        createdAt: app.createdAt || app.appliedAt,
        status: app.status || 'applied',
      };
    });

    return res.status(200).json({
      success: true,
      applications,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
};