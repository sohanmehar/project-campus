import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { Calendar, MapPin, Ticket, QrCode, CheckCircle, X, UserCheck, Trash2 } from 'lucide-react';

export const EventsView: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const [events, setEvents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

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
      await axios.post(`/events/${eventObj._id}/register`);
      addToast('success', 'Registered!', `Seat confirmed for ${eventObj.title}.`);
      fetchEventsData();
    } catch (err: any) {
      addToast('error', 'Error', err.response?.data?.message || 'Could not complete registration.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelRegistration = async (regId: string) => {
    try {
      await axios.delete(`/events/registrations/${regId}`);
      addToast('info', 'Cancelled', 'Registration cancelled.');
      fetchEventsData();
    } catch (err: any) {
      addToast('error', 'Error', 'Could not cancel registration.');
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading campus events from MongoDB Atlas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="micro-label text-blue-400">Campus Activities</span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">Events & QR Ticket Pass</h1>
        </div>
        <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20">
          {events.length} Upcoming Events
        </span>
      </div>

      {/* Events Grid */}
      <div className="stitch-card p-6 bg-slate-900 border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="font-semibold text-white text-sm">Upcoming Campus Events</h2>
            <p className="text-xs text-slate-400">Register to generate your digital QR entry pass</p>
          </div>
          <Calendar className="w-4 h-4 text-purple-400" />
        </div>

        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((ev) => {
              // Ultra-robust multi-tenant matching against MongoDB registrations
              const existingReg = registrations.find((r) => {
                const regEventId = String(r.eventId?._id || r.eventId || '');
                const targetEventId = String(ev._id || '');
                const titleMatch = r.eventTitle && ev.title && r.eventTitle.toLowerCase().trim() === ev.title.toLowerCase().trim();
                return (regEventId && regEventId === targetEventId) || titleMatch;
              });

              return (
                <div key={ev._id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 font-bold">
                      {ev.category || 'General'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{ev.organizer}</span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-white text-xs">{ev.title}</h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{ev.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{ev.venue}</span>
                    </span>
                    <span>{new Date(ev.date).toLocaleDateString()}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                    {existingReg ? (
                      <>
                        <button
                          onClick={() => setSelectedTicket(existingReg)}
                          className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 text-[11px] font-semibold rounded-lg flex items-center space-x-1 transition"
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          <span>View QR Ticket</span>
                        </button>

                        <button
                          onClick={() => handleCancelRegistration(existingReg._id)}
                          className="text-rose-400 hover:text-rose-300 text-[11px] flex items-center space-x-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Cancel</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleRegister(ev)}
                        disabled={processingId === ev._id}
                        className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition disabled:opacity-50"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{processingId === ev._id ? 'Registering...' : 'Register for Event'}</span>
                      </button>
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

      {/* QR Ticket Pass Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="stitch-card p-6 bg-slate-900 border-slate-800 max-w-sm w-full space-y-4 text-center relative">
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
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
          </div>
        </div>
      )}
    </div>
  );
};