import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { CheckCircle, X, Edit3, Save } from 'lucide-react';

export const FacultyCourseCatalogView: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  
  // Syllabus Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [unitsText, setUnitsText] = useState('');
  const [booksText, setBooksText] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/admin/departments');
      if (response.data.departments && response.data.departments.length > 0) {
        setDepartments(response.data.departments);
      } else {
        setDepartments([
          {
            _id: 'dept-cse',
            name: 'Computer Science & Engineering',
            code: 'CSE',
            headName: 'Prof. Alan Turing',
            totalStudents: 480,
            activeCourses: [
              {
                code: 'CS-401',
                name: 'Database Systems & SQL',
                credits: 4,
                sem: 4,
                instructor: user?.name || 'Dr. Sarah Jenkins',
                units: [
                  'Unit 1: ER Modeling & Relational Algebra',
                  'Unit 2: SQL Queries, Views & Constraints',
                  'Unit 3: Normalization (1NF to BCNF)',
                  'Unit 4: Transaction Processing & ACID Properties',
                  'Unit 5: B-Tree & Hash Indexing Strategies',
                ],
                books: 'Database System Concepts by Silberschatz, Korth & Sudarshan',
              },
            ],
          },
        ]);
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
      
      // Update local active course reference
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

  if (loading) {
    return (
      <div className="p-8 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading academic course catalog...</p>
      </div>
    );
  }

  // Calculate units to render for selected course
  const currentUnits = (selectedCourse?.units && selectedCourse.units.length > 0)
    ? selectedCourse.units
    : [
        'Unit 1: Theoretical Foundations & Architecture',
        'Unit 2: Core Algorithmic Principles & Implementation',
        'Unit 3: System Modeling & Optimization Strategies',
        'Unit 4: Advanced Real-World Applications',
      ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="micro-label text-blue-400">Academic Structure</span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">Department Course Catalog</h1>
        </div>
        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full flex items-center">
          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Verified Curriculum Syllabus
        </div>
      </div>

      {/* Departments & Courses Catalog Grid */}
      <div className="space-y-6">
        {departments.map((dept) => (
          <div key={dept._id} className="stitch-card p-6 bg-slate-900 border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-3 gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 bg-blue-600/20 text-blue-400 text-[10px] font-mono font-bold rounded border border-blue-500/30">
                    {dept.code}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Head: {dept.headName}</span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">{dept.name}</h2>
                <p className="text-xs text-slate-400">Total Department Enrolled Students: {dept.totalStudents}</p>
              </div>

              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold rounded-full w-fit">
                {dept.activeCourses?.length || 0} Active Modules
              </span>
            </div>

            <div className="space-y-2">
              <span className="micro-label text-slate-400">Click Any Course Card to Inspect or Edit Syllabus Units</span>

              {dept.activeCourses && dept.activeCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {dept.activeCourses.map((course: any, cIdx: number) => (
                    <div
                      key={cIdx}
                      onClick={() => handleOpenCourseModal(course)}
                      className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 hover:border-blue-500/50 hover:bg-slate-900/60 transition cursor-pointer group"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-xs font-bold text-blue-400 group-hover:text-blue-300">{course.code}</span>
                        <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">
                          Semester {course.sem}
                        </span>
                      </div>
                      <div className="font-semibold text-white text-xs leading-snug">{course.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between pt-1 border-t border-slate-900">
                        <span>Instructor</span>
                        <strong className="text-blue-400">{course.instructor || user?.name}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-950/60 border border-dashed border-slate-800 rounded-lg text-center text-xs text-slate-500">
                  No courses registered under this department catalog.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Course Detail & Edit Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="stitch-card p-6 bg-slate-900 border-slate-800 max-w-lg w-full space-y-4 relative max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 text-[10px] font-mono font-bold rounded border border-blue-500/30">
                  {selectedCourse.code} • Sem {selectedCourse.sem}
                </span>
                <h3 className="text-base font-bold text-white mt-1">{selectedCourse.name}</h3>
              </div>
              <button onClick={() => setSelectedCourse(null)} className="text-slate-400 hover:text-white">
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
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Syllabus</span>
                    </button>
                  </div>

                  <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    {currentUnits.map((u: string, idx: number) => (
                      <div key={idx} className="p-1.5 text-[11px] text-slate-300 border-b border-slate-900 last:border-none flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2" />
                        <span>{u}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="micro-label text-slate-400">Recommended Textbooks & References</span>
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300 font-mono">
                    {selectedCourse.books || 'Standard University Core Reference Textbook (3rd Edition)'}
                  </div>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Manage Units</span>
                  </button>
                  <button
                    onClick={() => setSelectedCourse(null)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition"
                  >
                    Close Dossier
                  </button>
                </div>
              </div>
            ) : (
              /* Editable Syllabus Form */
              <form onSubmit={handleSaveSyllabus} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="micro-label text-slate-400">Syllabus Unit Modules (One per line)</label>
                  <textarea
                    rows={6}
                    required
                    value={unitsText}
                    onChange={(e) => setUnitsText(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-mono resize-none leading-relaxed"
                    placeholder="Unit 1: Theoretical Foundations..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="micro-label text-slate-400">Recommended Textbooks & References</label>
                  <input
                    type="text"
                    required
                    value={booksText}
                    onChange={(e) => setBooksText(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3.5 py-2 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition disabled:opacity-50"
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