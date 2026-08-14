import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { CheckCircle, X, Edit3, Save, Plus, Trash2, BookOpen, Search, GraduationCap, Sparkles } from 'lucide-react';

export const FacultyCourseCatalogView: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addingCourse, setAddingCourse] = useState(false);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);
  
  // Syllabus Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [unitsText, setUnitsText] = useState('');
  const [booksText, setBooksText] = useState('');
  const [saving, setSaving] = useState(false);

  // New Course Form State
  const [newCourseForm, setNewCourseForm] = useState({
    code: '',
    name: '',
    credits: '4',
    sem: '4',
    departmentName: user?.department || 'Computer Science & Engineering',
    instructor: user?.name || 'Dr. Sarah Jenkins',
    units: 'Unit 1: Foundations & Architecture\nUnit 2: Algorithmic Modeling\nUnit 3: Implementation & Execution\nUnit 4: Real-World Case Studies',
    books: 'Standard Core University Textbook & Reference Manual',
  });

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/admin/departments');
      if (response.data.departments && response.data.departments.length > 0) {
        setDepartments(response.data.departments);
      }
    } catch (err) {
      console.error('Error fetching course catalog', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenCourseModal = (course: any) => {
    setSelectedCourse(course);
    setIsEditing(false);
    
    const effectiveUnits = (course.units && course.units.length > 0)
      ? course.units
      : [
          'Unit 1: Theoretical Foundations & Architecture',
          'Unit 2: Core Algorithmic Principles & Implementation',
          'Unit 3: System Modeling & Optimization Strategies',
          'Unit 4: Advanced Real-World Applications',
        ];

    setUnitsText(effectiveUnits.join('\n'));
    setBooksText(course.books || 'Standard University Core Reference Textbook (3rd Edition)');
  };

  const handleSaveSyllabus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    setSaving(true);
    try {
      const unitsArray = unitsText.split('\n').filter((u) => u.trim().length > 0);

      await axios.put(`/faculty/courses/${selectedCourse.code}/syllabus`, {
        units: unitsArray,
        books: booksText,
        instructor: user?.name || selectedCourse.instructor,
      });

      addToast('success', 'Syllabus Saved', `Updated units for ${selectedCourse.code}.`);
      
      const updatedCourse = {
        ...selectedCourse,
        units: unitsArray,
        books: booksText,
        instructor: user?.name || selectedCourse.instructor,
      };

      setSelectedCourse(updatedCourse);
      setIsEditing(false);
      fetchDepartments();
    } catch (err: any) {
      addToast('error', 'Error', err.response?.data?.message || 'Could not update course syllabus.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseForm.code.trim() || !newCourseForm.name.trim()) {
      addToast('error', 'Validation Error', 'Course code and name are required.');
      return;
    }

    setAddingCourse(true);
    try {
      await axios.post('/faculty/courses', {
        ...newCourseForm,
        code: newCourseForm.code.trim().toUpperCase(),
        credits: Number(newCourseForm.credits) || 4,
        sem: Number(newCourseForm.sem) || 4,
      });

      addToast('success', 'Course Registered', `'${newCourseForm.name}' (${newCourseForm.code.toUpperCase()}) added to catalogue.`);
      setIsAddModalOpen(false);
      setNewCourseForm({
        code: '',
        name: '',
        credits: '4',
        sem: '4',
        departmentName: user?.department || 'Computer Science & Engineering',
        instructor: user?.name || 'Dr. Sarah Jenkins',
        units: 'Unit 1: Foundations & Architecture\nUnit 2: Algorithmic Modeling\nUnit 3: Implementation & Execution\nUnit 4: Real-World Case Studies',
        books: 'Standard Core University Textbook & Reference Manual',
      });
      await fetchDepartments();
    } catch (err: any) {
      console.error('Error adding course:', err);
      addToast('error', 'Error', err.response?.data?.message || 'Could not register course.');
    } finally {
      setAddingCourse(false);
    }
  };

  const handleDeleteCourse = async (code: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove '${name}' (${code}) from the catalogue?`)) {
      return;
    }

    setDeletingCode(code);
    try {
      await axios.delete(`/faculty/courses/${code}`);
      addToast('success', 'Course Removed', `'${code}' was deleted from department catalog.`);
      await fetchDepartments();
      if (selectedCourse?.code === code) setSelectedCourse(null);
    } catch (err: any) {
      console.error('Delete course error:', err);
      addToast('error', 'Error', err.response?.data?.message || 'Could not delete course.');
    } finally {
      setDeletingCode(null);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-mono">Loading academic course catalog...</p>
      </div>
    );
  }

  const totalCourses = departments.reduce((acc, d) => acc + (d.activeCourses?.length || 0), 0);
  const totalStudents = departments.reduce((acc, d) => acc + (d.totalStudents || 0), 0);

  const currentUnits = (selectedCourse?.units && selectedCourse.units.length > 0)
    ? selectedCourse.units
    : [
        'Unit 1: Theoretical Foundations & Architecture',
        'Unit 2: Core Algorithmic Principles & Implementation',
        'Unit 3: System Modeling & Optimization Strategies',
        'Unit 4: Advanced Real-World Applications',
      ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="micro-label text-blue-400">Curriculum & Syllabus</span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
              Accredited UGC / AICTE
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">Department Course Catalog</h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-2 transition shadow-lg shadow-blue-600/25 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Course</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stitch-card p-4 bg-slate-900 border-slate-800 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-mono font-bold text-white">{totalCourses}</div>
            <div className="text-[11px] text-slate-400">Total Registered Modules</div>
          </div>
        </div>

        <div className="stitch-card p-4 bg-slate-900 border-slate-800 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-mono font-bold text-white">{departments.length}</div>
            <div className="text-[11px] text-slate-400">Academic Departments</div>
          </div>
        </div>

        <div className="stitch-card p-4 bg-slate-900 border-slate-800 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-mono font-bold text-white">{totalStudents}</div>
            <div className="text-[11px] text-slate-400">Enrolled Students</div>
          </div>
        </div>

        <div className="stitch-card p-4 bg-slate-900 border-slate-800 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-mono font-bold text-emerald-400">100%</div>
            <div className="text-[11px] text-slate-400">Syllabus Active</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
        <input
          type="text"
          placeholder="Filter courses by code, name, or instructor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
        />
      </div>

      {/* Departments & Courses Catalog Grid */}
      <div className="space-y-6">
        {departments.map((dept) => {
          const filteredCourses = (dept.activeCourses || []).filter((c: any) => {
            if (!searchTerm) return true;
            const term = searchTerm.toLowerCase();
            return (
              c.code.toLowerCase().includes(term) ||
              c.name.toLowerCase().includes(term) ||
              (c.instructor && c.instructor.toLowerCase().includes(term))
            );
          });

          return (
            <div key={dept._id || dept.code} className="stitch-card p-6 bg-slate-900 border-slate-800 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-3 gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 bg-blue-600/20 text-blue-400 text-[10px] font-mono font-bold rounded border border-blue-500/30">
                      {dept.code}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Head: {dept.headName}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1">{dept.name}</h2>
                  <p className="text-xs text-slate-400">Total Enrolled: {dept.totalStudents} Students</p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold rounded-full font-mono">
                    {filteredCourses.length} Courses
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="micro-label text-slate-400">Click Any Course Card to Inspect or Edit Syllabus Units</span>

                {filteredCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {filteredCourses.map((course: any, cIdx: number) => {
                      const isDeleting = deletingCode === course.code;

                      return (
                        <div
                          key={course.code || cIdx}
                          onClick={() => handleOpenCourseModal(course)}
                          className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5 hover:border-blue-500/50 hover:bg-slate-900/60 transition cursor-pointer group flex flex-col justify-between"
                        >
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <span className="font-mono text-xs font-bold text-blue-400 group-hover:text-blue-300">
                                {course.code}
                              </span>
                              <div className="flex items-center space-x-1.5">
                                <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">
                                  Sem {course.sem || 4}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded font-mono border border-emerald-500/20">
                                  {course.credits || 4} Credits
                                </span>
                              </div>
                            </div>
                            <div className="font-semibold text-white text-xs leading-snug">{course.name}</div>
                          </div>

                          <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <div>
                              <span>Instructor: </span>
                              <strong className="text-blue-400">{course.instructor || user?.name}</strong>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCourse(course.code, course.name);
                              }}
                              disabled={isDeleting}
                              className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition"
                              title="Delete Course"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 bg-slate-950/60 border border-dashed border-slate-800 rounded-lg text-center text-xs text-slate-500">
                    No courses matched the search filter for this department.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Course Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="stitch-card p-6 bg-slate-900 border border-slate-700 max-w-lg w-full space-y-4 relative shadow-2xl rounded-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Register New Course</h3>
                  <p className="text-[11px] text-slate-400">Add a course module to department syllabus</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCourse} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="micro-label text-slate-300">Course Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS-435"
                    value={newCourseForm.code}
                    onChange={(e) => setNewCourseForm({ ...newCourseForm, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 uppercase font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="micro-label text-slate-300">Credits *</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    required
                    value={newCourseForm.credits}
                    onChange={(e) => setNewCourseForm({ ...newCourseForm, credits: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="micro-label text-slate-300">Course Name / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quantum Computing & Algorithms"
                  value={newCourseForm.name}
                  onChange={(e) => setNewCourseForm({ ...newCourseForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="micro-label text-slate-300">Semester *</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    required
                    value={newCourseForm.sem}
                    onChange={(e) => setNewCourseForm({ ...newCourseForm, sem: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="micro-label text-slate-300">Lead Faculty Instructor</label>
                  <input
                    type="text"
                    value={newCourseForm.instructor}
                    onChange={(e) => setNewCourseForm({ ...newCourseForm, instructor: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="micro-label text-slate-300">Syllabus Units (One per line)</label>
                <textarea
                  rows={3}
                  value={newCourseForm.units}
                  onChange={(e) => setNewCourseForm({ ...newCourseForm, units: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-mono resize-none text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label className="micro-label text-slate-300">Reference Textbooks & Authors</label>
                <input
                  type="text"
                  value={newCourseForm.books}
                  onChange={(e) => setNewCourseForm({ ...newCourseForm, books: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingCourse}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50 flex items-center space-x-1.5 shadow-lg shadow-blue-600/20 cursor-pointer"
                >
                  {addingCourse ? 'Registering...' : 'Register Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Detail & Syllabus Edit Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="stitch-card p-6 bg-slate-900 border border-slate-700 max-w-lg w-full space-y-4 relative max-h-[85vh] overflow-y-auto shadow-2xl rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 text-[10px] font-mono font-bold rounded border border-blue-500/30">
                  {selectedCourse.code} • Sem {selectedCourse.sem}
                </span>
                <h3 className="text-base font-bold text-white mt-1">{selectedCourse.name}</h3>
              </div>
              <button onClick={() => setSelectedCourse(null)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Read / Edit Toggle Mode */}
            {!isEditing ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Lead Instructor:</span>
                  <span className="font-bold text-blue-400">{selectedCourse.instructor || user?.name}</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Academic Weight:</span>
                  <span className="font-mono font-bold text-emerald-400">{selectedCourse.credits} Credits</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="micro-label text-slate-400">Course Syllabus & Unit Modules</span>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Syllabus</span>
                    </button>
                  </div>

                  <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    {currentUnits.map((u: string, idx: number) => (
                      <div key={idx} className="p-1.5 text-[11px] text-slate-300 border-b border-slate-900 last:border-none flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 shrink-0" />
                        <span>{u}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="micro-label text-slate-400">Prescribed Reference Textbook</span>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 text-[11px]">
                    {selectedCourse.books || 'Standard University Core Reference Textbook (3rd Edition)'}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setSelectedCourse(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveSyllabus} className="space-y-3">
                <div className="space-y-1">
                  <label className="micro-label text-slate-400">Lead Instructor</label>
                  <input
                    type="text"
                    defaultValue={selectedCourse.instructor || user?.name}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="micro-label text-slate-400">Unit Modules (One unit per line)</label>
                  <textarea
                    rows={6}
                    value={unitsText}
                    onChange={(e) => setUnitsText(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-mono resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="micro-label text-slate-400">Reference Textbook / Notes</label>
                  <input
                    type="text"
                    value={booksText}
                    onChange={(e) => setBooksText(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-1 transition disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? 'Saving...' : 'Save Syllabus Changes'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};