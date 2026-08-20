import { Request, Response } from 'express';
import mongoose from 'mongoose';
import AcademicCalendar from '../models/AcademicCalendar';

export const getCalendarEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const events = await AcademicCalendar.find().sort({ startDate: 1 });
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch academic calendar events.', error: error.message });
  }
};

export const createCalendarEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, category, startDate, endDate, description, department } = req.body;
    if (!title || !startDate) {
      res.status(400).json({ success: false, message: 'Title and Start Date are required.' });
      return;
    }

    const userId = (req as any).user?.id || (req as any).user?._id;
    const validCreatedBy = userId && mongoose.Types.ObjectId.isValid(userId) ? userId : undefined;

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = endDate ? new Date(endDate) : parsedStartDate;

    const eventData: any = {
      title: String(title).trim(),
      category: ['holiday', 'exam', 'event', 'deadline'].includes(category) ? category : 'event',
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      description: description ? String(description).trim() : '',
      department: department || 'All Departments',
    };

    if (validCreatedBy) {
      eventData.createdBy = validCreatedBy;
    }

    const newEvent = await AcademicCalendar.create(eventData);

    res.status(201).json({ success: true, message: 'Academic calendar item added.', data: newEvent });
  } catch (error: any) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create calendar event.' });
  }
};

export const updateCalendarEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await AcademicCalendar.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ success: false, message: 'Calendar event not found.' });
      return;
    }
    res.status(200).json({ success: true, message: 'Calendar event updated.', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update calendar event.', error: error.message });
  }
};

export const deleteCalendarEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await AcademicCalendar.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Calendar event not found.' });
      return;
    }
    res.status(200).json({ success: true, message: 'Calendar event removed.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete calendar event.', error: error.message });
  }
};
