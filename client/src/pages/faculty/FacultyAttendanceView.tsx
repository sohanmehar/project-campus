import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToastStore } from '../../store/useToastStore';
import { Save } from 'lucide-react';

export const FacultyAttendanceView: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('Database Systems & SQL');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 11:00 AM');
  const [lectureDate, setLectureDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, 'present' | 'absent' | 'late'>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSavedSession, setIsSavedSession] = useState(false);
  const { addToast } = useToastStore();

  // Load initial student roster and course list
  useEffect(() => {
    const fetchAttendanceInitData = async () => {
      try {
        const [stuRes, deptRes] = await Promise.all([
          axios.get('/faculty/students'),
          axios.get('/admin/departments'),
        ]);

        const stuList = stuRes.data.students || [];
        setStudents(stuList);

        const allCourses: any[] = [];
        (deptRes.data.departments || []).forEach((d: any) => {
          if (d.activeCourses) {
            d.activeCourses.forEach((c: any) => allCourses.push(c));
          }
        });

        if (allCourses.length > 0) {
          setCourses(allCourses);
          setSelectedSubject(allCourses[0].name);
        } else {
          setCourses([
            { code: 'CS-401', name: 'Database Systems & SQL' },
            { code: 'CS-403', name: 'Operating Systems Architecture' },
            { code: 'CS-405', name: 'Advanced Algorithms' },
          ]);
        }
      } catch (err) {
        console.error('Error fetching attendance init data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceInitData();
  }, []);

  // Fetch saved attendance for the selected subject
  useEffect(() => {
    if (!selectedSubject || students.length === 0) return;

    const fetchExistingSession = async () => {
      try {
        const res = await axios.get('/faculty/attendance/session', {
          params: { subject: selectedSubject, date: lectureDate },
        });

        if (res.data.session && res.data.session.records && res.data.session.records.length > 0) {
          const loadedMap: Record<string, 'present' | 'absent' | 'late'> = {};
          const records = res.data.session.records;

          students.forEach((student, index) => {
            // Check matching ID or match by index position fallback
            const matchedRecord = records.find(
              (r: any) => String(r.studentId) === String(student._id)
            ) || records[index];

            loadedMap[student._id] = matchedRecord ? matchedRecord.status : 'present';
          });

          setAttendanceRecords(loadedMap);
          setIsSavedSession(true);
        } else {
          const defaultMap: Record<string, 'present' | 'absent' | 'late'> = {};
          students.forEach((s) => {
            defaultMap[s._id] = 'present';
          });
          setAttendanceRecords(defaultMap);
          setIsSavedSession(false);
        }
      } catch (err) {
        console.error('Error loading session records', err);
      }
    };

    fetchExistingSession();
  }, [selectedSubject, lectureDate, students]);

  const handleToggleStatus = (studentId: string) => {
    setAttendanceRecords((prev) => {
      const current = prev[studentId] || 'present';
      const next = current === 'present' ? 'absent' : current === 'absent' ? 'late' : 'present';
      return { ...prev, [studentId]: next };
    });
  };

  const handleMarkAll = (status: 'present' | 'absent') => {
    const updatedMap: Record<string, 'present' | 'absent' | 'late'> = {};
    students.forEach((s) => {
      updatedMap[s._id] = status;
    });
    setAttendanceRecords(updatedMap);
  };

  const handleSaveSession = async () => {
    setSaving(true);
    try {
      const recordsArray = Object.entries(attendanceRecords).map(([studentId, status]) => ({
        studentId,
        status,
      }));

      await axios.post('/faculty/attendance', {
        subject: selectedSubject,
        slot: timeSlot,
        date: lectureDate,
        records: recordsArray,
      });

      setIsSavedSession(true);
      addToast('success', 'Attendance Saved', `Saved session for '${selectedSubject}' to MongoDB.`);
    } catch (err: any) {
      addToast('error', 'Submission Error', err.response?.data?.message || 'Error marking attendance');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading class roster and attendance session controls...</p>
      </div>
    );
  }

  const presentCount = Object.values(attendanceRecords).filter((s) => s === 'present').length;
  const absentCount = Object.values(attendanceRecords).filter((s) => s === 'absent').length;
  const lateCount = Object.values(attendanceRecords).filter((s) => s === 'late').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="micro-label text-blue-400">Academic Operations</span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">Take Attendance Session</h1>
        </div>
        <button
          onClick={handleSaveSession}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Session...' : isSavedSession ? 'Update Attendance Session' : 'Submit Attendance Session'}</span>
        </button>
      </div>

      {/* Session Configuration Card */}
      <div className="stitch-card p-6 bg-slate-900 border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="micro-label text-slate-400">Select Subject / Lecture</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
          >
            {courses.map((c, idx) => (
              <option key={idx} value={c.name}>
                {c.code ? `${c.code} - ` : ''}{c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="micro-label text-slate-400">Lecture Date</label>
          <input
            type="date"
            value={lectureDate}
            onChange={(e) => setLectureDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        <div className="space-y-1">
          <label className="micro-label text-slate-400">Time Slot</label>
          <select
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
          >
            <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
            <option value="11:15 AM - 12:15 PM">11:15 AM - 12:15 PM</option>
            <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
            <option value="03:15 PM - 04:15 PM">03:15 PM - 04:15 PM</option>
          </select>
        </div>
      </div>

      {/* Roster & Quick Actions */}
      <div className="stitch-card p-6 bg-slate-900 border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-semibold text-white text-sm">Class Student Roster ({students.length})</h2>
              {isSavedSession && (
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-full">
                  Loaded Saved Session
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">Click any student card to cycle status: Present → Absent → Late</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleMarkAll('present')}
              className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold rounded-lg transition"
            >
              Mark All Present
            </button>
            <button
              onClick={() => handleMarkAll('absent')}
              className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold rounded-lg transition"
            >
              Mark All Absent
            </button>
            <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
              {presentCount} Present • {absentCount} Absent • {lateCount} Late
            </span>
          </div>
        </div>

        {/* Student Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {students.map((student) => {
            const status = attendanceRecords[student._id] || 'present';

            return (
              <div
                key={student._id}
                onClick={() => handleToggleStatus(student._id)}
                className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between select-none ${
                  status === 'present'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                    : status === 'absent'
                    ? 'bg-rose-500/10 border-rose-500/30 text-slate-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-slate-300'
                }`}
              >
                <div>
                  <div className="font-bold text-xs">{student.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{student.studentDetails?.rollNumber || 'CS-2024-042'}</div>
                </div>

                <span
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                    status === 'present'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : status === 'absent'
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {status.toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};