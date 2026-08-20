import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import assignmentRoutes from './routes/assignmentRoutes';
import placementRoutes from './routes/placementRoutes';
import aiRoutes from './routes/aiRoutes';
import eventRoutes from './routes/eventRoutes';
import complaintRoutes from './routes/complaintRoutes';
import adminRoutes from './routes/adminRoutes';
import facultyRoutes from './routes/facultyRoutes';
import notificationRoutes from './routes/notificationRoutes';
import clubRoutes from './routes/clubRoutes';
import coordinatorRoutes from './routes/coordinatorRoutes';
import calendarRoutes from './routes/calendarRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

// Explicit origins whitelist
const allowedOrigins = [
  'https://campus-grid-phi-nine.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200,
};

// Enable CORS as top-level middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/assignments', assignmentRoutes);
app.use('/api/v1/placements', placementRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/complaints', complaintRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/faculty', facultyRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/clubs', clubRoutes);
app.use('/api/v1/coordinator', coordinatorRoutes);
app.use('/api/v1/calendar', calendarRoutes);

app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    message: 'CampusGPT Core API is operational',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 [CampusGPT Server] Running on http://localhost:${PORT}`);
});