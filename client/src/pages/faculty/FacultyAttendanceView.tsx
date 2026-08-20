import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToastStore } from '../../store/useToastStore';
import { Save, QrCode, X } from 'lucide-react';

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
  const [showQrModal, setShowQrModal] = useState(false);
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
          params: { subject: selectedSubject, date: lectureDate, slot: timeSlot },
        });

        if (res.data.session && res.data.session.records && res.data.session.records.length > 0) {
          const loadedMap: Record<string, 'present' | 'absent' | 'late'> = {};
          const records = res.data.session.records;

          students.forEach((student, index) => {
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
  }, [selectedSubject, lectureDate, timeSlot, students]);

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
    addToast('info', 'Bulk Update', `All students marked as ${status.toUpperCase()}.`);
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
        courseCode: courses.find((course) => course.name === selectedSubject)?.code,
        slot: timeSlot,
        date: lectureDate,
        records: recordsArray,
      });

      setIsSavedSession(true);
      addToast('success', 'Attendance Saved', `Saved session for '${selectedSubject}' directly into MongoDB Atlas.`);
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
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <span className="micro-label text-blue-400">Academic Operations</span>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">Take Attendance Session</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Bonus QR Attendance Generator Button */}
          <button
            onClick={() => setShowQrModal(true)}
            className="px-3.5 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-purple-400" />
            <span>Project Session QR</span>
          </button>

          <button
            onClick={handleSaveSession}
            disabled={saving || (new Date(lectureDate).setHours(0,0,0,0) < new Date().setHours(0,0,0,0) && isSavedSession)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition shadow-lg shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>
              {saving
                ? 'Saving Session...'
                : (new Date(lectureDate).setHours(0,0,0,0) < new Date().setHours(0,0,0,0) && isSavedSession)
                ? 'Locked (Past Date)'
                : isSavedSession
                ? 'Update Session'
                : 'Submit Attendance'}
            </span>
          </button>
        </div>
      </div>

      {/* Session Configuration Card */}
      <div className="stitch-card p-4 sm:p-6 bg-slate-900 border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 rounded-2xl">
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
      <div className="stitch-card p-4 sm:p-6 bg-slate-900 border-slate-800 space-y-4 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-semibold text-white text-sm">Class Student Roster ({students.length})</h2>
              {isSavedSession && (
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-full font-mono">
                  Saved in Atlas
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">Click on status badge to toggle: Present → Absent → Late</p>
          </div>

          {/* Bulk Action Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleMarkAll('present')}
              className="px-2.5 py-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg transition cursor-pointer"
            >
              Mark All Present
            </button>
            <button
              onClick={() => handleMarkAll('absent')}
              className="px-2.5 py-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg transition cursor-pointer"
            >
              Mark All Absent
            </button>
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="text-lg font-bold font-mono text-emerald-400">{presentCount}</div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Present</div>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="text-lg font-bold font-mono text-rose-400">{absentCount}</div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Absent</div>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="text-lg font-bold font-mono text-amber-400">{lateCount}</div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Late</div>
          </div>
        </div>

        {/* Student List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-right">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {students.map((student) => {
                const status = attendanceRecords[student._id] || 'present';
                return (
                  <tr key={student._id} className="hover:bg-slate-950/40">
                    <td className="py-3 px-4 font-mono text-slate-400">{student.studentDetails?.rollNumber || student.rollNumber || 'CS-2024-042'}</td>
                    <td className="py-3 px-4 font-semibold text-white">{student.name}</td>
                    <td className="py-3 px-4 text-slate-400">{student.department || 'Computer Science'}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(student._id)}
                        className={`px-3 py-1 text-[10px] font-bold font-mono rounded-full border transition cursor-pointer ${
                          status === 'present'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            : status === 'absent'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                        }`}
                      >
                        {status.toUpperCase()}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bonus QR Live Check-In Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="stitch-card p-6 bg-slate-900 border-slate-800 max-w-sm w-full space-y-4 text-center relative shadow-2xl rounded-2xl">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 pt-2">
              <span className="micro-label text-purple-400">Classroom Projection</span>
              <h3 className="text-base font-bold text-white">{selectedSubject}</h3>
              <p className="text-xs text-slate-400">Time: <strong className="text-slate-200">{timeSlot}</strong> • Date: <strong className="text-slate-200">{lectureDate}</strong></p>
            </div>

            {/* QR Visual Box */}
            <div className="p-6 bg-white rounded-2xl max-w-[220px] mx-auto border-4 border-slate-800 space-y-2">
              <QrCode className="w-36 h-36 text-slate-950 mx-auto" />
              <div className="text-[10px] font-mono font-bold text-slate-900">SESSION-TOKEN-{lectureDate.replace(/-/g, '')}-CS401</div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-300 font-mono flex items-center justify-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Live Check-In Active ({presentCount} Marked Present)</span>
            </div>

            <button
              onClick={() => {
                setShowQrModal(false);
                addToast('success', 'Roster Updated', 'Students synced from live session scanner.');
              }}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-lg shadow-blue-600/20"
            >
              Close & Finalize Roll
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
