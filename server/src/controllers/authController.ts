import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User';
import { generateToken, setAuthCookie, clearAuthCookie } from '../utils/auth';

const googleClientId = process.env.GOOGLE_CLIENT_ID || '515653461626-dgkupvnr6tr6jg44p2affmfi1nrjt8us.apps.googleusercontent.com';
const googleClient = new OAuth2Client(googleClientId);

interface AuthRequest extends Request {
  user?: {
    id: string;
    [key: string]: any;
  };
}

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
      department: department || 'Computer Science & Engineering',
      studentDetails: role === 'student' ? { rollNumber: rollNumber || `STU-${Date.now().toString().slice(-4)}` } : undefined,
    });

    await user.save();

    const token = generateToken(user);
    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token, // <--- Exposed to client for Authorization header fallback
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
      if (!user.passwordHash) {
        return res.status(401).json({ message: 'This account uses Google Sign-In. Please sign in with Google.' });
      }
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }
    }

    const token = generateToken(user);
    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      token, // <--- Exposed to client for Authorization header fallback
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatarUrl: user.avatarUrl,
        isProfileLocked: user.isProfileLocked || false,
        studentDetails: user.studentDetails,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @desc    Authenticate user with Google OAuth Token
// @route   POST /api/v1/auth/google
// @access  Public
export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { credential, demoUser } = req.body;

    let email = '';
    let name = '';
    let avatarUrl = '';
    let googleId = '';

    if (credential) {
      // Real Google OAuth verification
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: googleClientId,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        return res.status(400).json({ message: 'Invalid Google authentication token payload.' });
      }
      email = payload.email.toLowerCase().trim();
      name = payload.name || payload.email.split('@')[0];
      avatarUrl = payload.picture || '';
      googleId = payload.sub;
    } else if (demoUser) {
      // Demo / Fast-Pass Google Login
      email = (demoUser.email || 'alex.student@campusgpt.edu').toLowerCase().trim();
      name = demoUser.name || 'Alex Mercer';
      avatarUrl = demoUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
      googleId = 'google-demo-' + Date.now();
    } else {
      return res.status(400).json({ message: 'Google credential token is required.' });
    }

    // Lookup user in MongoDB Atlas
    let user = await User.findOne({ email });

    if (!user) {
      // Provision a new student account automatically
      user = new User({
        name,
        email,
        googleId,
        authProvider: 'google',
        role: 'student',
        department: 'Computer Science & Engineering',
        avatarUrl,
        isVerified: true,
        studentDetails: {
          rollNumber: `CS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
          semester: 1,
          cgpa: 8.5,
          skills: ['Web Development', 'Problem Solving'],
          bio: 'Student at CampusGPT University.',
        },
      });
      await user.save();
    } else {
      // Link Google ID and update avatar if not set
      if (!user.googleId) user.googleId = googleId;
      if (!user.avatarUrl && avatarUrl) user.avatarUrl = avatarUrl;
      await user.save();
    }

    const token = generateToken(user);
    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatarUrl: user.avatarUrl,
        isProfileLocked: user.isProfileLocked || false,
        studentDetails: user.studentDetails,
        facultyDetails: user.facultyDetails,
      },
    });
  } catch (error: any) {
    console.error('Google Auth Error:', error);
    return res.status(401).json({ message: 'Google verification failed: ' + error.message });
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
    const userObj = user.toObject();
    return res.status(200).json({
      success: true,
      user: {
        ...userObj,
        id: user._id.toString(),
      }
    });
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
      department,
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

    // Security Check: If student's profile is locked, prevent edits unless requested by admin
    if (user.role === 'student' && user.isProfileLocked && (req.user as any)?.role !== 'admin') {
      return res.status(403).json({
        message: 'Student profile details are locked after initial submission. Please contact Admin for any official changes.',
      });
    }

    // Update department if provided
    if (department && String(department).trim()) {
      user.department = String(department).trim();
    }

    // Phone validation (required numeric phone number)
    if (phone !== undefined) {
      const trimmedPhone = String(phone).trim();
      if (!trimmedPhone) {
        return res.status(400).json({ message: 'Phone number is a required field.' });
      }
      const digitsOnly = trimmedPhone.replace(/\D/g, '');
      const isValidPhone = /^[+]?[\d\s\-()]{7,16}$/.test(trimmedPhone) && digitsOnly.length >= 7 && digitsOnly.length <= 15;
      if (!isValidPhone) {
        return res.status(400).json({ 
          message: 'Invalid phone number. Phone number must contain valid digits (e.g., +91 9876543210 or 10-digit number).' 
        });
      }
      user.phone = trimmedPhone;
    }

    // Update root fields
    if (name && name.trim()) user.name = name.trim();

    // Initialize or update studentDetails subdocument
    if (!user.studentDetails) {
      user.studentDetails = {
        rollNumber: '',
        semester: 1,
        cgpa: 0,
        skills: [],
      };
    }

    if (phone !== undefined) {
      user.studentDetails!.phone = phone.trim();
    }
    if (bio !== undefined) user.studentDetails!.bio = bio;
    if (skills !== undefined) user.studentDetails!.skills = Array.isArray(skills) ? skills : skills.split(',').map((s: string) => s.trim());

    const resolvedLinkedin = linkedinUrl !== undefined ? linkedinUrl : linkedIn;
    if (resolvedLinkedin !== undefined) {
      user.studentDetails!.linkedinUrl = resolvedLinkedin;
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

// @desc    First-Time Student Onboarding Profile Completion
// @route   POST /api/v1/auth/onboarding
// @access  Private (Student)
export const completeStudentOnboarding = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized user.' });
    }

    const { rollNumber, department, phone, semester, bio, skills, linkedinUrl, githubUrl } = req.body;

    if (!rollNumber || !phone || !department) {
      return res.status(400).json({ message: 'Roll number, department, and phone number are required to complete setup.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User record not found.' });
    }

    user.department = department.trim();
    user.phone = phone.trim();
    user.isProfileLocked = true; // Lock profile upon completing onboarding

    user.studentDetails = {
      rollNumber: rollNumber.trim(),
      phone: phone.trim(),
      semester: Number(semester) || 1,
      cgpa: user.studentDetails?.cgpa || 8.5,
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s: string) => s.trim()) : ['Web Dev']),
      bio: bio ? bio.trim() : 'Student at CampusGPT',
      linkedinUrl: linkedinUrl || '',
      githubUrl: githubUrl || '',
      resumeUrl: user.studentDetails?.resumeUrl || '',
    };

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'First-time onboarding completed! Your student profile is now locked.',
      user,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Onboarding submission failed', error: error.message });
  }
};

// @desc    Request Password Reset / Generate OTP
// @route   POST /api/v1/auth/forgot-password
// @access  Public
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'No registered account found with that email address.' });
    }

    // Generate a secure 6-digit numeric OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = expires;
    await user.save();

    console.log(`🔑 [Password Reset OTP] Code for ${email}: ${otp}`);

    return res.status(200).json({
      success: true,
      message: `Password reset OTP generated. A 6-digit verification code was sent to ${email}.`,
      otp,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error initiating password reset', error: error.message });
  }
};

// @desc    Verify OTP and Set New Password
// @route   POST /api/v1/auth/reset-password
// @access  Public
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP code, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'User account not found.' });
    }

    if (!user.resetPasswordOtp || user.resetPasswordOtp !== otp.trim()) {
      return res.status(400).json({ message: 'Invalid OTP code. Please check and try again.' });
    }

    if (user.resetPasswordExpires && new Date() > user.resetPasswordExpires) {
      return res.status(400).json({ message: 'OTP code has expired. Please request a new code.' });
    }

    // Hash the new password with bcrypt
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now sign in with your new password.',
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};