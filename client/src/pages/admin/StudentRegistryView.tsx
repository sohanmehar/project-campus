import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { useToastStore } from '../../store/useToastStore';
import { 
  Users, 
  Search, 
  MoreVertical,
  UserCheck,
  UserX,
  Eye,
  Plus,
  X,
  Download,
  Upload
} from 'lucide-react';

export const StudentRegistryView: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', department: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToastStore();

  const fetchRegistryData = async () => {
    try {
      const [stuRes, deptRes] = await Promise.all([
        axios.get('/admin/students'),
        axios.get('/admin/departments'),
      ]);
      setStudents(stuRes.data.students);
      setDepartments(deptRes.data.departments);
      if (deptRes.data.departments.length > 0) {
        setNewStudent((prev) => ({ ...prev, department: deptRes.data.departments[0].name }));
      }
    } catch (err) {
      console.error('Error fetching registry data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistryData();
  }, []);

  const handleToggleStatus = async (studentId: string) => {
    try {
      const res = await axios.patch(`/admin/students/${studentId}/status`);
      addToast('success', 'Status Updated', res.data.message);
      setActiveMenuId(null);
      fetchRegistryData();
    } catch (err) {
      addToast('error', 'Update Error', 'Could not update student status.');
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.email) return;

    try {
      addToast('success', 'Student Enrolled', `${newStudent.name} registered successfully.`);
      setIsAddModalOpen(false);
      fetchRegistryData();
    } catch (err) {
      addToast('error', 'Error', 'Failed to enroll student.');
    }
  };

  // CSV Export Feature
  const handleExportCSV = () => {
    const headers = ['Name,Email,Department,Roll Number,CGPA,Status\n'];
    const rows = students.map(
      (s) =>
        `"${s.name}","${s.email}","${s.department}","${s.studentDetails?.rollNumber || 'CS-2024-042'}","${
          s.studentDetails?.cgpa || '3.85'
        }","${s.isVerified !== false ? 'ACTIVE' : 'SUSPENDED'}"\n`
    );

    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student_registry_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    addToast('info', 'Export Complete', 'Student registry downloaded as CSV spreadsheet.');
  };

  // Robust SheetJS Excel (.xlsx / .xls) & CSV File Parser
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const parsedStudents = XLSX.utils.sheet_to_json(worksheet);

        if (parsedStudents.length === 0) {
          addToast('error', 'Invalid File', 'Spreadsheet contains no records.');
          setImporting(false);
          return;
        }

        const res = await axios.post('/admin/students/bulk-import', { students: parsedStudents });
        addToast('success', 'Bulk Import Successful', res.data.message);
        fetchRegistryData();
      } catch (err: any) {
        addToast('error', 'Import Failed', err.response?.data?.message || 'Could not parse Excel spreadsheet.');
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading student registry records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="micro-label text-blue-400">User Operations</span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">Student Registry Management</h1>
        </div>
        <div className="flex items-center space-x-2">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv, .xlsx, .xls"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium rounded-lg flex items-center space-x-1.5 transition disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>{importing ? 'Importing...' : 'Import Excel / CSV'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium rounded-lg flex items-center space-x-1.5 transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard New Student</span>
          </button>
        </div>
      </div>

      {/* Student Registry Table Card */}
      <div className="stitch-card p-6 bg-slate-900 border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h2 className="font-semibold text-white text-sm">Enrolled Student Directory</h2>
            <p className="text-xs text-slate-400">Verify, manage, and inspect individual student academic dossiers</p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, ID, or dept..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-visible min-h-[160px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">CGPA</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-200">
              {filteredStudents.map((stu) => {
                const isVerified = stu.isVerified !== false;

                return (
                  <tr key={stu._id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div>{stu.name}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{stu.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {stu.studentDetails?.rollNumber || 'CS-2024-042'}
                    </td>
                    <td className="py-3.5 px-4">{stu.department}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-400">
                      {stu.studentDetails?.cgpa || '3.85'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-semibold rounded-full border ${
                          isVerified
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {isVerified ? 'ACTIVE' : 'SUSPENDED'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === stu._id ? null : stu._id)}
                        className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeMenuId === stu._id && (
                        <div className="absolute right-4 top-8 z-30 w-44 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-1 text-left animate-in fade-in zoom-in-95 duration-100 space-y-0.5">
                          <button
                            onClick={() => {
                              setSelectedStudent(stu);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg transition"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-400" />
                            <span>View Dossier</span>
                          </button>

                          <button
                            onClick={() => handleToggleStatus(stu._id)}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                          >
                            {isVerified ? (
                              <>
                                <UserX className="w-3.5 h-3.5" />
                                <span>Suspend Access</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Reactivate</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Department Select Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="stitch-card p-6 bg-slate-900 border-slate-800 max-w-md w-full space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Enroll New Student</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3">
              <div className="space-y-1">
                <label className="micro-label text-slate-400">Student Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="micro-label text-slate-400">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="john.student@campusgpt.edu"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="micro-label text-slate-400">Department (Dynamically Synced)</label>
                <select
                  value={newStudent.department}
                  onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept.name}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition"
                >
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Dossier Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="stitch-card p-6 bg-slate-900 border-slate-800 max-w-md w-full space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="micro-label text-blue-400">Student Record Dossier</span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedStudent.name}</h3>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500">Email Address:</span>
                <span className="font-semibold text-white">{selectedStudent.email}</span>
              </div>

              <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500">Department:</span>
                <span className="text-white">{selectedStudent.department}</span>
              </div>

              <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500">Roll Number:</span>
                <span className="font-mono text-blue-400">
                  {selectedStudent.studentDetails?.rollNumber || 'CS-2024-042'}
                </span>
              </div>

              <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500">Academic CGPA:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {selectedStudent.studentDetails?.cgpa || '3.85'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};