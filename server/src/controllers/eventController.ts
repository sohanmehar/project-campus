import { Response } from 'express';
import mongoose from 'mongoose';
import Event from '../models/Event';
import EventRegistration from '../models/EventRegistration';
import User from '../models/User';
import ActivityApproval from '../models/ActivityApproval';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Get all active campus events (auto-seeds default events if DB is empty)
// @route   GET /api/v1/events
// @access  Private
export const getEvents = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    let events = await Event.find().sort({ date: 1 });

    if (events.length === 0) {
      const defaultEvents = [
        {
          title: 'DevFusion 2026: National Hackathon',
          organizer: 'CSI Student Chapter',
          date: new Date(Date.now() + 604800000), // +7 days
          venue: 'Auditorium Hall A',
          category: 'Technical',
          registrationUrl: 'https://devfolio.co/hackathons',
          description: 'A 24-hour full-stack building hackathon focusing on AI agents and scalable web infrastructure.',
          bannerUrl: '',
        },
        {
          title: 'Annual Campus Cultural Summit',
          organizer: 'Campus Cultural Club',
          date: new Date(Date.now() + 1209600000), // +14 days
          venue: 'Main Campus Ground',
          category: 'Cultural',
          registrationUrl: 'https://forms.google.com/cultural-summit-2026',
          description: 'Live musical performances, inter-college choreography showcases, and interactive arts.',
          bannerUrl: '',
        },
      ];

      await Event.insertMany(defaultEvents);
      events = await Event.find().sort({ date: 1 });
    }

    let userRegistrations: any[] = [];
    if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
      userRegistrations = await EventRegistration.find({
        $or: [{ studentId: new mongoose.Types.ObjectId(studentId) }, { studentId }],
      });
    }

    const regMap = new Map(userRegistrations.map((r) => [r.eventId.toString(), r]));

    const formattedEvents = events.map((ev) => {
      const reg = regMap.get(ev._id.toString());
      return {
        _id: ev._id,
        title: ev.title,
        description: ev.description,
        venue: ev.venue,
        organizer: ev.organizer || 'Campus Committee',
        category: ev.category || 'Technical',
        date: ev.date,
        registrationUrl: ev.registrationUrl || '',
        bannerUrl: ev.bannerUrl || '',
        isRegistered: !!reg,
        registrationId: reg?._id,
        ticketPassId: reg?.ticketPassId,
      };
    });

    return res.status(200).json({ success: true, events: formattedEvents });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
};

// @desc    Create a new campus event
// @route   POST /api/v1/events
// @access  Private (Admin / Coordinator)
export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, venue, organizer, date, category, registrationUrl, bannerUrl } = req.body;

    if (!title || !description || !venue || !date) {
      return res.status(400).json({ message: 'Title, description, venue, and event date are required.' });
    }

    const eventDate = new Date(date);
    if (Number.isNaN(eventDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format.' });
    }

    const coordinatorId = req.user?.id && mongoose.Types.ObjectId.isValid(req.user.id)
      ? new mongoose.Types.ObjectId(req.user.id)
      : undefined;

    const newEvent = new Event({
      title: title.trim(),
      description: description.trim(),
      venue: venue.trim(),
      organizer: organizer || 'Campus Event Committee',
      registrationUrl: registrationUrl || '',
      date: eventDate,
      category: category || 'Technical',
      bannerUrl: bannerUrl || '',
      coordinatorId,
    });

    await newEvent.save();

    // Auto-create student notification
    try {
      await Notification.create({
        title: `New Campus Event: ${title}`,
        message: `${title} scheduled on ${eventDate.toLocaleDateString()} at ${venue}.`,
        type: 'event',
        recipientRole: 'student',
      });
    } catch (nErr) {
      console.warn('Could not dispatch event notification:', nErr);
    }

    return res.status(201).json({
      success: true,
      message: `Event '${title}' created successfully.`,
      event: newEvent,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error creating event', error: error.message });
  }
};

// @desc    Delete a campus event
// @route   DELETE /api/v1/events/:id
// @access  Private (Admin / Coordinator)
export const deleteEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const targetId = Array.isArray(id) ? id[0] : id;
    if (!targetId || !mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ message: 'Valid event ID is required.' });
    }

    await Event.findByIdAndDelete(targetId);
    await EventRegistration.deleteMany({ eventId: new mongoose.Types.ObjectId(targetId) });

    return res.status(200).json({ success: true, message: 'Event and associated registrations deleted.' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error deleting event', error: error.message });
  }
};

// @desc    Register for a campus event
// @route   POST /api/v1/events/:id/register
// @access  Private (Student)
export const registerForEvent = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    const rawEventId = req.params.id;
    const eventId = Array.isArray(rawEventId) ? rawEventId[0] : rawEventId;

    if (!studentId || !eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: 'Invalid event reference.' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event document not found in database.' });
    }

    const userObjId = new mongoose.Types.ObjectId(studentId);
    const evObjId = new mongoose.Types.ObjectId(eventId);

    const existingReg = await EventRegistration.findOne({
      $or: [
        { studentId: userObjId, eventId: evObjId },
        { studentId: studentId as any, eventId: eventId as any },
      ],
    });

    if (existingReg) {
      return res.status(400).json({ message: 'You are already registered for this event.' });
    }

    const studentUser = await User.findById(studentId);
    const ticketPassId = `QR-TICKET-${Date.now().toString().slice(-6)}`;

    const registration = new EventRegistration({
      studentId: userObjId,
      eventId: evObjId,
      studentName: studentUser?.name || 'Student Attendee',
      rollNumber: studentUser?.studentDetails?.rollNumber || 'CS-2024-042',
      eventTitle: event.title,
      ticketPassId,
      qrCodeToken: ticketPassId,
      qrCodeData: JSON.stringify({ ticketPassId, eventTitle: event.title, studentName: studentUser?.name }),
      status: 'registered',
      registeredAt: new Date(),
    });

    await registration.save();

    // Create an ActivityApproval record in MongoDB for Coordinator
    try {
      await ActivityApproval.create({
        studentId: userObjId,
        studentName: studentUser?.name || 'Student Attendee',
        rollNumber: studentUser?.studentDetails?.rollNumber || 'STU-001',
        department: studentUser?.department || 'Computer Science & Engineering',
        requestType: 'Event Organizer Pass',
        targetName: event.title,
        status: 'pending',
        appliedAt: new Date(),
      });
    } catch (err) {
      console.warn('Could not record ActivityApproval for event registration:', err);
    }

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

    const query = mongoose.Types.ObjectId.isValid(studentId)
      ? { $or: [{ studentId: new mongoose.Types.ObjectId(studentId) }, { studentId }] }
      : { studentId };

    const rawRegistrations = await EventRegistration.find(query)
      .populate('eventId')
      .sort({ createdAt: -1 });

    const registrations = rawRegistrations.map((r: any) => {
      const ev = r.eventId || {};
      return {
        _id: r._id,
        eventId: ev._id ? ev._id.toString() : r.eventId?.toString(),
        eventTitle: r.eventTitle || ev.title || 'Campus Event',
        studentName: r.studentName || 'Student Attendee',
        rollNumber: r.rollNumber || 'CS-2024-042',
        ticketPassId: r.ticketPassId || `QR-TICKET-${Date.now().toString().slice(-6)}`,
        qrCodeData: r.qrCodeData || '',
        status: r.status || 'registered',
        venue: ev.venue || 'Campus Auditorium',
        date: ev.date,
        createdAt: r.createdAt,
      };
    });

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