import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { useToastStore } from '../../store/useToastStore';
import { 
  Users, 
  Plus, 
  Search, 
  X, 
  Download, 
  Upload, 
  MoreVertical, 
  Trash2, 
  Eye 
} from 'lucide-react';

export const FacultyRegistryView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<any | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToastStore();

  const [newFaculty, setNewFaculty] = useState({
    name: '',
    email: '',
    department: '',
    designation: 'Assistant Professor',
    courses: '',
    officeHours: 'Mon/Wed 10:00 AM - 12:00 PM',
  });

  const fetchFacultyData = async () => {
    try {
      const [facRes, deptRes] = await Promise.all([
        axios.get('/admin/faculty'),
        axios.get('/admin/departments'),
      ]);
      setFacultyList(facRes.data.faculty || []);
      setDepartments(deptRes.data.departments || []);
      
      const defaultDept = deptRes.data.departments?.[0]?.name || 'Computer Science';
      setNewFaculty((prev) => ({
        ...prev,
        department: prev.department || defaultDept,
      }));
    } catch (err) {
      console.error('Error fetching faculty data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacultyData();
  }, []);

  const handleAddFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaculty.name || !newFaculty.email) return;

    setSubmitting(true);
    try {
      const coursesArray = newFaculty.courses
        ? newFaculty.courses.split(',').map((c) => c.trim())
        : ['Department Elective'];

      const finalDepartment = newFaculty.department || departments[0]?.name || 'Computer Science';

      await axios.post('/admin/faculty', {
        ...newFaculty,
        department: finalDepartment,
        courses: coursesArray,
      });

      addToast('success', 'Faculty Onboarded', `${newFaculty.name} saved directly to MongoDB.`);
      setIsAddModalOpen(false);
      setNewFaculty({
        name: '',
        email: '',
        department: departments[0]?.name || 'Computer Science',
        designation: 'Assistant Professor',
        courses: '',
        officeHours: 'Mon/Wed 10:00 AM - 12:00 PM',
      });
      fetchFacultyData();
    } catch (err: any) {
      addToast('error', 'Onboarding Error', err.response?.data?.message || 'Could not add faculty.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFaculty = async (id: string, name: string) => {
    try {
      await axios.delete(`/admin/faculty/${id}`);
      addToast('info', 'Faculty Removed', `${name} removed from registry.`);
      setActiveMenuId(null);
      fetchFacultyData();
    } catch (err) {
      addToast('error', 'Error', 'Could not delete faculty member.');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name,Email,Department,Designation,Assigned Courses,Office Hours\n'];
    const rows = facultyList.map(
      (f) =>
        `"${f.name}","${f.email}","${f.department}","${f.designation}","${
          f.courses ? f.courses.join('; ') : ''
        }","${f.officeHours || 'Mon/Wed 10:00 AM - 12:00 PM'}"\n`
    );

    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `faculty_registry_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    addToast('info', 'Export Complete', 'Faculty roster downloaded as CSV.');
  };

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

        const parsedFaculty = XLSX.utils.sheet_to_json(worksheet);

        if (parsedFaculty.length === 0) {
          addToast('error', 'Invalid File', 'Spreadsheet contains no records.');
          setImporting(false);
          return;
        }

        const res = await axios.post('/admin/faculty/bulk-import', { faculty: parsedFaculty });
        addToast('success', 'Bulk Import Successful', res.data.message);
        fetchFacultyData();
      } catch (err: any) {
        addToast('error', 'Import Failed', err.response?.data?.message || 'Could not parse Excel spreadsheet.');
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const filteredFaculty = facultyList.filter(
    (f) =>
      f.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-mono">Loading faculty registry from database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="micro-label text-blue-400">Faculty Operations</span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">Faculty Registry</h1>
        </div>
        <div className="flex items-center space-x-2">
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
            <span>Add New Faculty</span>
          </button>
        </div>
      </div>

      {/* Faculty Table Card */}
      <div className="stitch-card p-6 bg-slate-900 border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h2 className="font-semibold text-white text-sm">Active Academic Staff</h2>
            <p className="text-xs text-slate-400">Manage professor designations, assigned courses, and department allocations</p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search faculty by name or dept..."
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
                <th className="py-3 px-4">Faculty Member</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Assigned Courses</th>
                <th className="py-3 px-4">Office Hours</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-200">
              {filteredFaculty.map((fac) => (
                <tr key={fac._id || fac.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-semibold text-white">
                    <div>{fac.name}</div>
                    <div className="text-[10px] text-slate-500 font-normal">{fac.email}</div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-blue-400">{fac.designation}</td>
                  <td className="py-3.5 px-4">{fac.department}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {fac.courses?.map((c: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] rounded border border-slate-700">
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{fac.officeHours || 'Mon/Wed 10:00 AM - 12:00 PM'}</td>
                  <td className="py-3.5 px-4 text-right relative">
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === fac._id ? null : fac._id)}
                      className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === fac._id && (
                      <div className="absolute right-4 top-8 z-30 w-44 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-1 text-left space-y-0.5">
                        <button
                          onClick={() => {
                            setSelectedFaculty(fac);
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg transition"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-400" />
                          <span>View Details</span>
                        </button>

                        <button
                          onClick={() => handleDeleteFaculty(fac._id, fac.name)}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Member</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard Faculty Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="stitch-card p-6 bg-slate-900 border-slate-800 max-w-md w-full space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Onboard New Faculty</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddFaculty} className="space-y-3">
              <div className="space-y-1">
                <label className="micro-label text-slate-400">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Dr. Jane Doe"
                  value={newFaculty.name}
                  onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="micro-label text-slate-400">University Email</label>
                <input
                  type="email"
                  required
                  placeholder="jane.doe@campusgpt.edu"
                  value={newFaculty.email}
                  onChange={(e) => setNewFaculty({ ...newFaculty, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="micro-label text-slate-400">Department</label>
                  <select
                    value={newFaculty.department}
                    onChange={(e) => setNewFaculty({ ...newFaculty, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept.name}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="micro-label text-slate-400">Designation</label>
                  <select
                    value={newFaculty.designation}
                    onChange={(e) => setNewFaculty({ ...newFaculty, designation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Professor & HOD">Professor & HOD</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="micro-label text-slate-400">Assigned Courses (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Data Structures, Operating Systems"
                  value={newFaculty.courses}
                  onChange={(e) => setNewFaculty({ ...newFaculty, courses: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="micro-label text-slate-400">Office Hours Schedule</label>
                <input
                  type="text"
                  placeholder="e.g. Tue/Thu 10:00 AM - 12:00 PM"
                  value={newFaculty.officeHours}
                  onChange={(e) => setNewFaculty({ ...newFaculty, officeHours: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
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
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save & Assign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Faculty Detail Modal */}
      {selectedFaculty && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="stitch-card p-6 bg-slate-900 border-slate-800 max-w-md w-full space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="micro-label text-blue-400">Academic Roster Dossier</span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedFaculty.name}</h3>
              </div>
              <button onClick={() => setSelectedFaculty(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500">Email:</span>
                <span className="font-semibold text-white">{selectedFaculty.email}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500">Designation:</span>
                <span className="font-bold text-blue-400">{selectedFaculty.designation}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500">Department:</span>
                <span className="text-white">{selectedFaculty.department}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500">Office Hours:</span>
                <span className="font-mono text-emerald-400">{selectedFaculty.officeHours || 'Mon/Wed 10:00 AM - 12:00 PM'}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedFaculty(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};