import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, X, Edit3, Trash2 } from 'lucide-react';
import { useToastStore } from '../../store/useToastStore';

export const AcademicStructureView: React.FC = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<any | null>(null);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);

  // Dept Form State
  const [deptForm, setDeptForm] = useState({
    name: '',
    code: '',
    headName: '',
    totalStudents: '120',
    courseCode: '',
    courseName: '',
    credits: '4',
    sem: '1',
  });

  // Course Form State
  const [courseForm, setCourseForm] = useState({
    code: '',
    name: '',
    credits: '4',
    sem: '1',
  });

  const { addToast } = useToastStore();

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/admin/departments');
      setDepartments(response.data.departments);
    } catch (err) {
      console.error('Error fetching departments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingDept(null);
    setDeptForm({
      name: '', code: '', headName: '', totalStudents: '120',
      courseCode: '', courseName: '', credits: '4', sem: '1',
    });
    setIsDeptModalOpen(true);
  };

  const handleOpenEditModal = (dept: any) => {
    setEditingDept(dept);
    setDeptForm({
      name: dept.name,
      code: dept.code,
      headName: dept.headName,
      totalStudents: dept.totalStudents.toString(),
      courseCode: '', courseName: '', credits: '4', sem: '1',
    });
    setIsDeptModalOpen(true);
  };

  const handleSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await axios.put(`/admin/departments/${editingDept._id}`, {
          name: deptForm.name,
          code: deptForm.code,
          headName: deptForm.headName,
          totalStudents: Number(deptForm.totalStudents),
        });
        addToast('success', 'Department Updated', `Updated ${deptForm.code.toUpperCase()}.`);
      } else {
        await axios.post('/admin/departments', {
          name: deptForm.name,
          code: deptForm.code,
          headName: deptForm.headName,
          totalStudents: Number(deptForm.totalStudents),
          initialCourse: deptForm.courseName ? {
            code: deptForm.courseCode || `${deptForm.code.toUpperCase()}-101`,
            name: deptForm.courseName,
            credits: Number(deptForm.credits),
            sem: Number(deptForm.sem),
          } : null,
        });
        addToast('success', 'Department Created', `Added ${deptForm.code.toUpperCase()} to catalog.`);
      }

      setIsDeptModalOpen(false);
      fetchDepartments();
    } catch (err: any) {
      addToast('error', 'Error', err.response?.data?.message || 'Failed to save department.');
    }
  };

  const handleDeleteDept = async (id: string, name: string) => {
    try {
      await axios.delete(`/admin/departments/${id}`);
      addToast('info', 'Department Deleted', `${name} removed from system.`);
      fetchDepartments();
    } catch (err) {
      addToast('error', 'Error', 'Could not delete department.');
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeptId || !courseForm.code || !courseForm.name) return;

    try {
      await axios.post(`/admin/departments/${selectedDeptId}/courses`, courseForm);
      addToast('success', 'Course Added', `Added ${courseForm.name} to department.`);
      setSelectedDeptId(null);
      setCourseForm({ code: '', name: '', credits: '4', sem: '1' });
      fetchDepartments();
    } catch (err: any) {
      addToast('error', 'Error', err.response?.data?.message || 'Failed to add course.');
    }
  };

  const handleDeleteCourse = async (deptId: string, courseCode: string) => {
    try {
      await axios.delete(`/admin/departments/${deptId}/courses/${courseCode}`);
      addToast('info', 'Course Removed', `${courseCode} removed from syllabus.`);
      fetchDepartments();
    } catch (err) {
      addToast('error', 'Error', 'Could not remove course.');
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading department structures from database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <span className="micro-label text-blue-400">Curriculum Management</span>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">Academic Structure & Departments</h1>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition shadow-lg shadow-blue-600/20 active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Departments Grid */}
      <div className="space-y-6">
        {departments.map((dept) => (
          <div key={dept._id} className="stitch-card p-6 bg-slate-900 border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-3 gap-2">
              <div>
                <span className="px-2.5 py-0.5 bg-blue-600/20 text-blue-400 text-[10px] font-mono font-bold rounded border border-blue-500/30">
                  {dept.code}
                </span>
                <h2 className="text-lg font-bold text-white mt-1">{dept.name}</h2>
                <p className="text-xs text-slate-400">
                  Department Head: <strong className="text-white">{dept.headName}</strong> • Enrolled: <strong className="text-white">{dept.totalStudents}</strong> Students
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleOpenEditModal(dept)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                  title="Edit Department Details"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDeleteDept(dept._id, dept.name)}
                  className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg transition"
                  title="Delete Department"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setSelectedDeptId(dept._id)}
                  className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold rounded-lg flex items-center space-x-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Course</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <span className="micro-label text-slate-400">Semester Course Catalog ({dept.activeCourses?.length || 0})</span>
              
              {dept.activeCourses && dept.activeCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {dept.activeCourses.map((course: any, cIdx: number) => (
                    <div key={cIdx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1 relative group">
                      <button
                        onClick={() => handleDeleteCourse(dept._id, course.code)}
                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 text-rose-400 hover:bg-rose-500/10 rounded transition"
                        title="Remove Course"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex justify-between items-center pr-6">
                        <span className="font-mono text-xs font-bold text-blue-400">{course.code}</span>
                        <span className="text-[10px] text-slate-400">Sem {course.sem}</span>
                      </div>
                      <div className="font-semibold text-white text-xs">{course.name}</div>
                      <div className="text-[10px] text-slate-500">{course.credits} Academic Credits</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-950/60 border border-dashed border-slate-800 rounded-lg text-center text-xs text-slate-500">
                  No courses assigned yet. Click "+ Add Course" to attach subjects.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Department Modal */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="stitch-card p-6 bg-slate-900 border-slate-800 max-w-lg w-full space-y-4 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingDept ? 'Edit Department Details' : 'Create New Department'}
              </h3>
              <button onClick={() => setIsDeptModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDept} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="micro-label text-slate-400">Department Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Artificial Intelligence"
                    value={deptForm.name}
                    onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="micro-label text-slate-400">Short Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AIDS"
                    value={deptForm.code}
                    onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="micro-label text-slate-400">Department Head (HOD)</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. P. K. Verma"
                    value={deptForm.headName}
                    onChange={(e) => setDeptForm({ ...deptForm, headName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="micro-label text-slate-400">Enrolled Student Count</label>
                  <input
                    type="number"
                    value={deptForm.totalStudents}
                    onChange={(e) => setDeptForm({ ...deptForm, totalStudents: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {!editingDept && (
                <div className="border-t border-slate-800 pt-3 space-y-2">
                  <span className="micro-label text-blue-400">Initial Syllabus Course (Optional)</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="micro-label text-slate-400">Course Code</label>
                      <input
                        type="text"
                        placeholder="e.g. AI-101"
                        value={deptForm.courseCode}
                        onChange={(e) => setDeptForm({ ...deptForm, courseCode: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono uppercase focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="micro-label text-slate-400">Course Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Introduction to AI"
                        value={deptForm.courseName}
                        onChange={(e) => setDeptForm({ ...deptForm, courseName: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
                  className="px-3.5 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition"
                >
                  {editingDept ? 'Update Department' : 'Save Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {selectedDeptId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="stitch-card p-6 bg-slate-900 border-slate-800 max-w-md w-full space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Add Course Module</h3>
              <button onClick={() => setSelectedDeptId(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCourse} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="micro-label text-slate-400">Course Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS-408"
                    value={courseForm.code}
                    onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono uppercase focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="micro-label text-slate-400">Course Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Deep Learning"
                    value={courseForm.name}
                    onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="micro-label text-slate-400">Credits</label>
                  <input
                    type="number"
                    value={courseForm.credits}
                    onChange={(e) => setCourseForm({ ...courseForm, credits: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="micro-label text-slate-400">Semester</label>
                  <input
                    type="number"
                    value={courseForm.sem}
                    onChange={(e) => setCourseForm({ ...courseForm, sem: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedDeptId(null)}
                  className="px-3.5 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition"
                >
                  Attach Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};