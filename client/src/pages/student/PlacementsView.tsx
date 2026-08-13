import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { Briefcase, CheckCircle, Award, Send } from 'lucide-react';

export const PlacementsView: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const [drives, setDrives] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const fetchPlacementData = async () => {
    try {
      const [driveRes, appRes] = await Promise.allSettled([
        axios.get('/placements'),
        axios.get('/placements/my-applications'),
      ]);

      let driveList: any[] = [];
      if (driveRes.status === 'fulfilled' && driveRes.value.data?.placements) {
        driveList = driveRes.value.data.placements;
      }

      let appList: any[] = [];
      if (appRes.status === 'fulfilled' && appRes.value.data?.applications) {
        appList = appRes.value.data.applications;
      }

      setDrives(driveList);
      setApplications(appList);
    } catch (err) {
      console.error('Error loading placement drives', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacementData();
  }, []);

  const handleApply = async (drive: any) => {
    setApplyingId(drive._id);
    try {
      await axios.post(`/placements/${drive._id}/apply`, {
        resumeUrl: user?.studentDetails?.resumeUrl || 'https://drive.google.com/resume.pdf',
      });

      addToast('success', 'Application Submitted', `Applied successfully for ${drive.companyName}.`);
      fetchPlacementData();
    } catch (err: any) {
      addToast('error', 'Application Error', err.response?.data?.message || 'Could not apply.');
    } finally {
      setApplyingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading placement drives from MongoDB Atlas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="micro-label text-blue-400">Career Development</span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">Placement & Internship Drives</h1>
        </div>
        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
          {drives.length} Active Recruitment Drives
        </span>
      </div>

      {/* Drives Grid */}
      <div className="stitch-card p-6 bg-slate-900 border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="font-semibold text-white text-sm">Active Recruitment Opportunities</h2>
            <p className="text-xs text-slate-400">Submit applications directly for eligible campus drives</p>
          </div>
          <Briefcase className="w-4 h-4 text-amber-400" />
        </div>

        {drives.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drives.map((drive) => {
              const existingApp = applications.find(
                (a) => String(a.placementId?._id || a.placementId) === String(drive._id)
              );

              return (
                <div key={drive._id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{drive.companyName}</span>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                      {drive.ctc || 'N/A'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-slate-300 font-semibold">{drive.jobRole}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{drive.description || 'Campus recruitment drive.'}</p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>Min CGPA: <strong className="text-slate-300">{drive.eligibilityCGPA || 'None'}</strong></span>
                    <span>Deadline: <strong className="text-slate-300">{drive.deadline ? new Date(drive.deadline).toLocaleDateString() : 'N/A'}</strong></span>
                  </div>

                  <div className="pt-2 border-t border-slate-900 flex justify-end">
                    {existingApp ? (
                      <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold rounded-lg flex items-center space-x-1 font-mono">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>APPLIED</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApply(drive)}
                        disabled={applyingId === drive._id}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold rounded-lg flex items-center space-x-1.5 transition disabled:opacity-50"
                      >
                        <Send className="w-3 h-3" />
                        <span>{applyingId === drive._id ? 'Applying...' : 'Apply Now'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            No active placement drives currently posted in MongoDB Atlas.
          </div>
        )}
      </div>

      {/* Application Tracking Log */}
      <div className="stitch-card p-6 bg-slate-900 border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="font-semibold text-white text-sm">My Applications Track</h2>
            <p className="text-xs text-slate-400">Status logs for drives you have applied to</p>
          </div>
          <Award className="w-4 h-4 text-emerald-400" />
        </div>

        {applications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Applied Date</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-200">
                {applications.map((app, idx) => {
                  const company = app.companyName || app.placementId?.companyName || app.company || 'Campus Recruiter';
                  const role = app.jobRole || app.placementId?.jobRole || app.role || 'Software Role';

                  return (
                    <tr key={app._id || idx} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-bold text-white">{company}</td>
                      <td className="py-3.5 px-4 text-slate-300">{role}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '11/8/2026'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="px-2.5 py-1 text-[10px] font-bold rounded-full border font-mono bg-blue-500/10 text-blue-400 border-blue-500/20">
                          {(app.status || 'applied').toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            You have not submitted any placement applications yet.
          </div>
        )}
      </div>
    </div>
  );
};