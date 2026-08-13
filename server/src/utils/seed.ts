import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is missing in .env');
    }

    await mongoose.connect(mongoUri);
    console.log('🍃 Connected to MongoDB Atlas for seeding...');

    // Clear existing users
    await User.deleteMany({});
    console.log('🧹 Cleared existing users.');

    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('Password123!', salt);

    const users = [
      {
        name: 'Alex Mercer',
        email: 'alex.student@campusgpt.edu',
        passwordHash: defaultPasswordHash,
        role: 'student',
        department: 'Computer Science',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        studentDetails: {
          rollNumber: 'CS-2024-042',
          semester: 4,
          cgpa: 3.85,
          skills: ['React', 'Node.js', 'Python', 'Data Structures', 'Machine Learning'],
          bio: 'Sophomore CS student passionate about full-stack web platforms and AI tools.',
          linkedinUrl: 'https://linkedin.com/in/alex-mercer',
          githubUrl: 'https://github.com/alex-mercer',
        },
      },
      {
        name: 'Dr. Sarah Jenkins',
        email: 'sarah.faculty@campusgpt.edu',
        passwordHash: defaultPasswordHash,
        role: 'faculty',
        department: 'Computer Science',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        facultyDetails: {
          designation: 'Associate Professor',
          officeHours: 'Mon/Wed 2:00 PM - 4:00 PM',
        },
      },
      {
        name: 'Marcus Vance',
        email: 'marcus.coordinator@campusgpt.edu',
        passwordHash: defaultPasswordHash,
        role: 'coordinator',
        department: 'Student Affairs',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      },
      {
        name: 'Dr. Elena Thorne',
        email: 'admin@campusgpt.edu',
        passwordHash: defaultPasswordHash,
        role: 'admin',
        department: 'Administration',
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
        permissions: ['users.manage', 'attendance.manage', 'events.manage', 'placements.manage', 'system.settings'],
      },
    ];

    await User.insertMany(users);
    console.log('✅ Demo users seeded successfully across all 4 roles!');
    console.log('\n--- 🔑 DEMO CREDENTIALS ---');
    console.log('Password for all users: Password123!\n');
    console.log('1. Student:     alex.student@campusgpt.edu');
    console.log('2. Faculty:     sarah.faculty@campusgpt.edu');
    console.log('3. Coordinator: marcus.coordinator@campusgpt.edu');
    console.log('4. Admin:       admin@campusgpt.edu\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();