import { Request, Response } from 'express';
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

    const newEvent = await AcademicCalendar.create({
      title,
      category: category || 'event',
      startDate,
      endDate: endDate || startDate,
      description: description || '',
      department: department || 'All Departments',
      createdBy: (req as any).user?._id,
    });

    res.status(201).json({ success: true, message: 'Academic calendar item added.', data: newEvent });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create calendar event.', error: error.message });
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
