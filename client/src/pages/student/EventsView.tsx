import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { Calendar, MapPin, Ticket, QrCode, X, UserCheck, Trash2, Plus, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';

export const EventsView: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const canManageEvents = user?.role === 'admin' || user?.role === 'coordinator';

  const [events, setEvents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [eventForm, setEventForm] = useState({
    title: '',
    organizer: 'CSI Student Chapter',
    venue: 'Auditorium Hall A',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'Technical',
    registrationUrl: '',
    description: '',
  });

  const fetchEventsData = async () => {
    try {
      const [evRes, regRes] = await Promise.allSettled([
        axios.get('/events'),
        axios.get('/events/my-registrations'),
      ]);

      let eventList: any[] = [];
      if (evRes.status === 'fulfilled' && evRes.value.data?.events) {
        eventList = evRes.value.data.events;
      }

      let regList: any[] = [];
      if (regRes.status === 'fulfilled' && regRes.value.data?.registrations) {
        regList = regRes.value.data.registrations;
      }

      setEvents(eventList);
      setRegistrations(regList);
    } catch (err) {
      console.error('Error fetching event details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventsData();
  }, []);

  const handleRegister = async (eventObj: any) => {
    setProcessingId(eventObj._id);
    try {
      // If external registration link is provided, open it
      if (eventObj.registrationUrl) {
        window.open(eventObj.registrationUrl, '_blank', 'noopener,noreferrer');
      }

      const res = await axios.post(`/events/${eventObj._id}/register`);
      addToast('success', 'Registration Confirmed!', `Seat confirmed & pass generated for ${eventObj.title}.`);

      const newReg = res.data?.registration || {
        _id: `temp-${Date.now()}`,
        eventId: eventObj._id,
        eventTitle: eventObj.title,
        studentName: user?.name || 'Student Attendee',
        ticketPassId: `QR-TICKET-${Date.now().toString().slice(-6)}`,
        status: 'registered',
      };

      setEvents((prev) =>
        prev.map((e) => (e._id === eventObj._id ? { ...e, isRegistered: true } : e))
      );
      setRegistrations((prev) => [newReg, ...prev]);
      setSelectedTicket(newReg);

      fetchEventsData();
    } catch (err: any) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('already registered')) {
        setEvents((prev) =>
          prev.map((e) => (e._id === eventObj._id ? { ...e, isRegistered: true } : e))
        );
        addToast('info', 'Already Registered', `You are already registered for ${eventObj.title}.`);
      } else if (eventObj.registrationUrl) {
        addToast('info', 'Registration Form Opened', `Opened registration page for ${eventObj.title}.`);
      } else {
        addToast('error', 'Error', err.response?.data?.message || 'Could not complete registration.');
      }
      fetchEventsData();
    } finally {
      setProcessingId(null);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title.trim() || !eventForm.venue.trim()) {
      addToast('error', 'Validation Error', 'Title and venue are required.');
      return;
    }

    setCreating(true);
    try {
      await axios.post('/events', eventForm);
      addToast('success', 'Event Published', `'${eventForm.title}' was added to the campus calendar.`);
      setIsCreateModalOpen(false);
      setEventForm({
        title: '',
        organizer: 'CSI Student Chapter',
        venue: 'Auditorium Hall A',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'Technical',
        registrationUrl: '',
        description: '',
      });
      fetchEventsData();
    } catch (err: any) {
      addToast('error', 'Error', err.response?.data?.message || 'Could not create event.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteEvent = async (eventId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete '${title}'?`)) return;

    try {
      await axios.delete(`/events/${eventId}`);
      addToast('success', 'Event Deleted', `'${title}' was removed.`);
      fetchEventsData();
    } catch (err: any) {
      addToast('error', 'Error', err.response?.data?.message || 'Could not delete event.');
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-mono">Loading campus events from MongoDB Atlas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="micro-label text-blue-400">Campus Activities</span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">Events & Digital Pass Hub</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20">
            {events.length} Upcoming Events
          </span>

          {canManageEvents && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Event</span>
            </button>
          )}
        </div>
      </div>

      {/* Events Grid */}
      <div className="stitch-card p-6 bg-slate-900 border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="font-semibold text-white text-sm">Upcoming Campus Events</h2>
            <p className="text-xs text-slate-400">Register or apply via official registration link to generate QR pass</p>
          </div>
          <Calendar className="w-4 h-4 text-purple-400" />
        </div>

        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((ev) => {
              const matchedReg = registrations.find((r) => {
                const regEventId = String(r.eventId?._id || r.eventId || '');
                const targetEventId = String(ev._id || '');
                const titleMatch = r.eventTitle && ev.title && r.eventTitle.toLowerCase().trim() === ev.title.toLowerCase().trim();
                return (regEventId && regEventId === targetEventId) || titleMatch;
              });

              const isRegistered = ev.isRegistered || !!matchedReg;
              const activeRegObj = matchedReg || (ev.isRegistered ? {
                _id: ev.registrationId || `temp-${ev._id}`,
                eventId: ev._id,
                eventTitle: ev.title,
                studentName: user?.name || 'Student Attendee',
                ticketPassId: ev.ticketPassId || `QR-TICKET-${Date.now().toString().slice(-6)}`,
                status: 'registered',
              } : null);

              return (
                <div key={ev._id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 font-bold">
                        {ev.category || 'Technical'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{ev.organizer || 'Campus Committee'}</span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-white text-sm">{ev.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{ev.description}</p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-900">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{ev.venue}</span>
                      </span>
                      <span>{new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>

                    {ev.registrationUrl && (
                      <div className="pt-1 flex items-center space-x-1 text-[11px] text-blue-400 font-mono truncate">
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span>Form:</span>
                        <a
                          href={ev.registrationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="underline truncate hover:text-blue-300"
                        >
                          {ev.registrationUrl}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-900 flex items-center justify-between">
                    {canManageEvents ? (
                      <div className="flex items-center justify-between w-full">
                        <button
                          onClick={() => handleDeleteEvent(ev._id, ev.title)}
                          className="text-slate-500 hover:text-rose-400 p-1.5 rounded hover:bg-rose-500/10 transition cursor-pointer text-xs flex items-center space-x-1"
                          title="Delete Event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Event</span>
                        </button>

                        <div className="flex items-center space-x-2">
                          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-full font-mono">
                            PUBLISHED ({ev.seats ? `${ev.seats} SEATS` : 'OPEN SEATS'})
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 ml-auto">
                        {isRegistered && activeRegObj ? (
                          <div className="flex items-center space-x-2">
                            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-full font-mono flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>REGISTERED</span>
                            </span>

                            <button
                              onClick={() => setSelectedTicket(activeRegObj)}
                              className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 text-[11px] font-semibold rounded-lg flex items-center space-x-1 transition cursor-pointer"
                            >
                              <Ticket className="w-3.5 h-3.5" />
                              <span>View Pass</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRegister(ev)}
                            disabled={processingId === ev._id}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold rounded-lg flex items-center space-x-1.5 transition disabled:opacity-50 cursor-pointer shadow-lg shadow-blue-600/20"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>
                              {processingId === ev._id
                                ? 'Registering...'
                                : ev.registrationUrl
                                ? 'Register (Opens Form & Pass)'
                                : 'Register for Event'}
                            </span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">No active events scheduled in MongoDB.</div>
        )}
      </div>

      {/* Create Event Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="stitch-card p-6 bg-slate-900 border-slate-800 max-w-lg w-full space-y-4 relative shadow-2xl rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Post Campus Event</h3>
                  <p className="text-[11px] text-slate-400">Publish event & share registration form link</p>
                </div>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div className="space-y-1">
                <label className="micro-label text-slate-400">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Agents & LLMs Hackathon 2026"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="micro-label text-slate-400">Organizer / Club *</label>
                  <input
                    type="text"
                    required
                    value={eventForm.organizer}
                    onChange={(e) => setEventForm({ ...eventForm, organizer: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="micro-label text-slate-400">Category</label>
                  <select
                    value={eventForm.category}
                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="Technical">Technical / Hackathon</option>
                    <option value="Workshop">Workshop / Bootcamp</option>
                    <option value="Cultural">Cultural / Festival</option>
                    <option value="Academic">Academic Seminar</option>
                    <option value="Sports">Sports Meet</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="micro-label text-slate-400">Event Date *</label>
                  <input
                    type="date"
                    required
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="micro-label text-slate-400">Venue Location *</label>
                  <input
                    type="text"
                    required
                    value={eventForm.venue}
                    onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="micro-label text-slate-400">Registration Link / Form URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://devfolio.co/... or Google Form link"
                  value={eventForm.registrationUrl}
                  onChange={(e) => setEventForm({ ...eventForm, registrationUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="micro-label text-slate-400">Event Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe event schedule, highlights, and perks..."
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50 cursor-pointer"
                >
                  {creating ? 'Publishing...' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Ticket Pass Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="stitch-card p-6 bg-slate-900 border-slate-800 max-w-sm w-full space-y-4 text-center relative shadow-2xl rounded-2xl">
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 pt-2">
              <span className="micro-label text-purple-400">Digital Entry Pass</span>
              <h3 className="text-base font-bold text-white">{selectedTicket.eventTitle || selectedTicket.eventId?.title}</h3>
              <p className="text-xs text-slate-400">Attendee: <strong className="text-slate-200">{selectedTicket.studentName}</strong></p>
            </div>

            {/* QR Visual Box */}
            <div className="p-6 bg-white rounded-2xl max-w-[200px] mx-auto border-4 border-slate-800 space-y-2">
              <QrCode className="w-32 h-32 text-slate-950 mx-auto" />
              <div className="text-[10px] font-mono font-bold text-slate-900">{selectedTicket.ticketPassId || 'QR-TICKET-849201'}</div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-400 font-mono">
              STATUS: <strong className="text-emerald-400">CONFIRMED (VERIFIED)</strong>
            </div>

            <button
              onClick={() => {
                window.print();
                addToast('success', 'Pass Ready', 'QR Entry Pass sent to printer / PDF download.');
              }}
              className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center space-x-2 transition shadow-lg shadow-purple-600/20 cursor-pointer"
            >
              <Ticket className="w-4 h-4" />
              <span>Download / Print Entry Pass</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};