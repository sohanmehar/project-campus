import { Request, Response } from 'express';

// AuthRequest extends Express Request to include authenticated user info
interface AuthRequest extends Request {
  user?: {
    id: string;
    [key: string]: any;
  };
}
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { generateToken, setAuthCookie, clearAuthCookie } from '../utils/auth';

// @desc    Register a new user
// @route   POST /api/v1/auth/signup
// @access  Public
export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, department, rollNumber } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      passwordHash,
      role: role || 'student',
      department: department || 'Computer Science',
      studentDetails: role === 'student' ? { rollNumber: rollNumber || `STU-${Date.now().toString().slice(-4)}` } : undefined,
    });

    await user.save();

    const token = generateToken(user);
    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error during signup', error: error.message });
  }
};

// @desc    Authenticate user & get token (Bypasses password mismatch for demo emails)
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const trimmedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: trimmedEmail });

    // Demo accounts mapping
    const demoAccounts: Record<string, { name: string; role: string; department: string }> = {
      'alex.student@campusgpt.edu': { name: 'Alex Mercer', role: 'student', department: 'Computer Science' },
      'sarah.faculty@campusgpt.edu': { name: 'Dr. Jenkins', role: 'faculty', department: 'Computer Science' },
      'marcus.coordinator@campusgpt.edu': { name: 'Marcus Vance', role: 'coordinator', department: 'Events & Cultural' },
      'admin@campusgpt.edu': { name: 'Dr. Thorne', role: 'admin', department: 'Central Administration' },
    };

    // If it's a demo account, ensure it exists and auto-update password if needed
    if (demoAccounts[trimmedEmail]) {
      const demoInfo = demoAccounts[trimmedEmail];
      const salt = await bcrypt.genSalt(10);
      const demoPasswordHash = await bcrypt.hash(password || 'Password123!', salt);

      if (!user) {
        // Create the user on the fly in MongoDB
        user = new User({
          name: demoInfo.name,
          email: trimmedEmail,
          passwordHash: demoPasswordHash,
          role: demoInfo.role,
          department: demoInfo.department,
          studentDetails: demoInfo.role === 'student' ? { rollNumber: 'CS-2024-042', semester: 4, cgpa: 8.8 } : undefined,
        });
        await user.save();
      } else {
        // Force update passwordHash so comparison never fails
        user.passwordHash = demoPasswordHash;
        await user.save();
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'User account not found.' });
    }

    // Verify password for non-demo users
    if (!demoAccounts[trimmedEmail]) {
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }
    }

    const token = generateToken(user);
    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatarUrl: user.avatarUrl,
        studentDetails: user.studentDetails,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @desc    Logout user & clear cookie
// @route   POST /api/v1/auth/logout
// @access  Public
export const logout = async (req: Request, res: Response) => {
  clearAuthCookie(res);
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @desc    Get current authenticated user profile
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ success: true, user });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
};

// @desc    Update student profile details
// @route   PUT /api/v1/auth/profile
// @access  Private (Student/Faculty/Admin)
export const updateStudentProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized user.' });
    }

    const {
      name,
      phone,
      bio,
      skills,
      linkedinUrl,
      linkedIn,
      githubUrl,
      resumeUrl,
      currentSemester,
      rollNumber,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User record not found.' });
    }

    // Update root fields
    if (name) user.name = name;
    if (phone) (user as any).phone = phone;

    // Initialize or update studentDetails subdocument
    if (!user.studentDetails) {
      user.studentDetails = {
        rollNumber: '',
        semester: 0,
        cgpa: 0,
        skills: [],
      };
    }

    if (bio !== undefined) user.studentDetails!.bio = bio;
    if (skills !== undefined) user.studentDetails!.skills = Array.isArray(skills) ? skills : skills.split(',').map((s: string) => s.trim());
    // Accept either `linkedinUrl` or `linkedIn` from clients and store both for compatibility
    const resolvedLinkedin = linkedinUrl !== undefined ? linkedinUrl : linkedIn;
    if (resolvedLinkedin !== undefined) {
      user.studentDetails!.linkedinUrl = resolvedLinkedin;
      // keep legacy/alternate property to avoid TS/runtime issues in other parts
      (user.studentDetails as any).linkedIn = resolvedLinkedin;
    }
    if (githubUrl !== undefined) user.studentDetails!.githubUrl = githubUrl;
    if (resumeUrl !== undefined) user.studentDetails!.resumeUrl = resumeUrl;
    if (currentSemester !== undefined) user.studentDetails!.semester = Number(currentSemester);
    if (rollNumber !== undefined) user.studentDetails!.rollNumber = rollNumber;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully in MongoDB Atlas.',
      user,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};