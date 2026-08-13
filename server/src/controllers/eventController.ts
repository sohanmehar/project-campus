import { Response } from 'express';
import mongoose from 'mongoose';
import Event from '../models/Event';
import EventRegistration from '../models/EventRegistration';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Get all active campus events (auto-seeds 2 events if DB collection is empty)
// @route   GET /api/v1/events
// @access  Private
export const getEvents = async (req: AuthRequest, res: Response) => {
  try {
    let events = await Event.find().sort({ date: 1 });

    if (events.length === 0) {
      const defaultEvents = [
        {
          title: 'DevFusion 2026: National Hackathon',
          organizer: 'CSI Student Chapter',
          date: new Date(Date.now() + 604800000), // +7 days
          venue: 'Auditorium Hall A',
          category: 'Technical',
          description: 'A 24-hour full-stack building hackathon focusing on AI agents and web infrastructure.',
          bannerUrl: '',
        },
        {
          title: 'Annual Campus Cultural Summit',
          organizer: 'Campus Cultural Club',
          date: new Date(Date.now() + 1209600000), // +14 days
          venue: 'Main Campus Ground',
          category: 'Cultural',
          description: 'Live musical performances, inter-college choreography showcases, and food stalls.',
          bannerUrl: '',
        },
      ];

      await Event.insertMany(defaultEvents);
      events = await Event.find().sort({ date: 1 });
    }

    return res.status(200).json({ success: true, events });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
};

// @desc    Register for a campus event
// @route   POST /api/v1/events/:id/register
// @access  Private (Student)
export const registerForEvent = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    // ensure eventId is a string (Express params can be string | string[])
    const rawEventId = req.params.id;
    const eventId = Array.isArray(rawEventId) ? rawEventId[0] : rawEventId;

    if (!studentId || !eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: 'Invalid event reference.' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event document not found in database.' });
    }

    const existingReg = await EventRegistration.findOne({
      studentId: new mongoose.Types.ObjectId(studentId),
      eventId: new mongoose.Types.ObjectId(eventId),
    });

    if (existingReg) {
      return res.status(400).json({ message: 'You are already registered for this event.' });
    }

    const studentUser = await User.findById(studentId);
    const ticketPassId = `QR-TICKET-${Date.now().toString().slice(-6)}`;

    const registration = new EventRegistration({
      studentId: new mongoose.Types.ObjectId(studentId),
      eventId: new mongoose.Types.ObjectId(eventId),
      studentName: studentUser?.name || 'Alex Mercer',
      rollNumber: studentUser?.studentDetails?.rollNumber || 'CS-2024-042',
      eventTitle: event.title,
      ticketPassId,
      qrCodeData: JSON.stringify({ ticketPassId, eventTitle: event.title, studentName: studentUser?.name }),
      status: 'registered',
    });

    await registration.save();

    return res.status(200).json({
      success: true,
      message: `Successfully registered for ${event.title}!`,
      registration,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error registering for event', error: error.message });
  }
};

// @desc    Get user's event registrations
// @route   GET /api/v1/events/my-registrations
// @access  Private (Student)
export const getStudentRegistrations = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    if (!studentId) {
      return res.status(401).json({ message: 'Unauthorized student access.' });
    }

    const registrations = await EventRegistration.find({
      studentId: new mongoose.Types.ObjectId(studentId),
    }).populate('eventId').sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      registrations,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching registrations', error: error.message });
  }
};

// @desc    Cancel event registration
// @route   DELETE /api/v1/events/registrations/:id
// @access  Private (Student)
export const cancelRegistration = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await EventRegistration.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Event registration cancelled.',
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error cancelling registration', error: error.message });
  }
};