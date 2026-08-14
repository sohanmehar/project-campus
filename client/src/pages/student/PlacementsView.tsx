import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { 
  Briefcase, 
  MapPin, 
  Send, 
  CheckCircle, 
  ExternalLink
} from 'lucide-react';

export const PlacementsView: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const [drives, setDrives] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const fetchPlacementData = async () => {
    try {
      const [drivesRes, appsRes] = await Promise.allSettled([
        axios.get('/placements/drives'),
        axios.get('/placements/my-applications'),
      ]);

      let drivesList: any[] = [];
      if (drivesRes.status === 'fulfilled' && drivesRes.value.data) {
        drivesList = drivesRes.value.data.drives || drivesRes.value.data.placements || [];
      }

      let myApps: any[] = [];
      if (appsRes.status === 'fulfilled' && appsRes.value.data?.applications) {
        myApps = appsRes.value.data.applications;
      }

      setDrives(drivesList);
      setApplications(myApps);
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
      // If external registration link is provided, open it in a new window
      if (drive.registrationUrl) {
        window.open(drive.registrationUrl, '_blank', 'noopener,noreferrer');
      }

      await axios.post(`/placements/${drive._id}/apply`, {
        resumeUrl: user?.studentDetails?.resumeUrl || 'https://drive.google.com/resume.pdf',
      });

      addToast('success', 'Application Submitted', `Application recorded for ${drive.companyName}.`);

      // Optimistically update local drive list and applications
      setDrives((prev) =>
        prev.map((d) => (d._id === drive._id ? { ...d, hasApplied: true, applicationStatus: 'applied' } : d))
      );
      setApplications((prev) => [
        {
          _id: `temp-${Date.now()}`,
          placementId: drive._id,
          companyName: drive.companyName,
          jobRole: drive.jobRole,
          createdAt: new Date().toISOString(),
          status: 'applied',
        },
        ...prev,
      ]);

      fetchPlacementData();
    } catch (err: any) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('already applied')) {
        setDrives((prev) =>
          prev.map((d) => (d._id === drive._id ? { ...d, hasApplied: true, applicationStatus: 'applied' } : d))
        );
        addToast('info', 'Already Applied', `You have already applied for ${drive.companyName}.`);
      } else if (drive.registrationUrl) {
        addToast('info', 'Portal Opened', `Opened application link for ${drive.companyName}.`);
      } else {
        addToast('error', 'Application Error', err.response?.data?.message || 'Could not apply.');
      }
      fetchPlacementData();
    } finally {
      setApplyingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-mono">Loading placement drives from MongoDB Atlas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <span className="micro-label text-blue-400">Career Development</span>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">Placement & Internship Drives</h1>
        </div>
        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 self-start sm:self-auto">
          {drives.length} Active Recruitment Drives
        </span>
      </div>

      {/* Drives Grid */}
      <div className="stitch-card p-4 sm:p-6 bg-slate-900 border-slate-800 space-y-4 rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="font-semibold text-white text-sm">Active Recruitment Opportunities</h2>
            <p className="text-xs text-slate-400">Submit applications directly for eligible campus drives</p>
          </div>
          <Briefcase className="w-4 h-4 text-amber-400" />
        </div>

        {drives.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {drives.map((drive) => {
              const matchedApp = applications.find(
                (a) =>
                  String(a.placementId?._id || a.placementId || '') === String(drive._id) ||
                  (a.companyName && drive.companyName && a.companyName.toLowerCase().trim() === drive.companyName.toLowerCase().trim())
              );

              const isApplied = drive.hasApplied || drive.applicationStatus === 'applied' || !!matchedApp;

              const formattedDeadline = drive.applicationDeadline
                ? new Date(drive.applicationDeadline).toLocaleDateString()
                : drive.deadline ? new Date(drive.deadline).toLocaleDateString() : 'Active';

              return (
                <div key={drive._id} className="p-3.5 sm:p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5 min-w-0 mr-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {drive.companyName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-white text-xs sm:text-sm truncate block">{drive.companyName}</span>
                          <p className="text-[11px] sm:text-xs text-slate-300 font-semibold truncate">{drive.jobRole}</p>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 shrink-0">
                        {drive.ctc ? `${drive.ctc} LPA` : '24 LPA'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                      {drive.description || 'Campus recruitment drive for engineering graduates.'}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {drive.eligibility?.requiredSkills?.map((skill: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-900 text-slate-300 text-[10px] rounded border border-slate-800 font-mono">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-900">
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1 text-slate-500 shrink-0" />
                        <span className="truncate max-w-[120px]">{drive.location || 'Bangalore, India'}</span>
                      </span>
                      <span>Min CGPA: <strong className="text-white">{drive.eligibility?.minCgpa || 7.5}</strong></span>
                      <span>Deadline: <strong className="text-amber-400">{formattedDeadline}</strong></span>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    {drive.registrationUrl ? (
                      <a
                        href={drive.registrationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">Company Portal</span>
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">Direct In-App Drive</span>
                    )}

                    <div className="self-end sm:self-auto">
                      {isApplied ? (
                        <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold rounded-lg flex items-center space-x-1 font-mono">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>APPLIED</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApply(drive)}
                          disabled={applyingId === drive._id}
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold rounded-lg flex items-center space-x-1.5 transition disabled:opacity-50 cursor-pointer shadow-lg shadow-blue-600/20"
                        >
                          <Send className="w-3 h-3" />
                          <span>{applyingId === drive._id ? 'Applying...' : (drive.registrationUrl ? 'Apply / Register' : 'Apply Now')}</span>
                        </button>
                      )}
                    </div>
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
      <div className="stitch-card p-4 sm:p-6 bg-slate-900 border-slate-800 space-y-4 rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="font-semibold text-white text-sm">My Applications Track</h2>
            <p className="text-xs text-slate-400">Status updates on your submitted campus placement applications</p>
          </div>
          <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
            {applications.length} Submissions
          </span>
        </div>

        {applications.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {applications.map((app) => (
              <div key={app._id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{app.companyName}</span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold rounded border border-emerald-500/20 uppercase">
                    {app.status || 'Applied'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">{app.jobRole}</div>
                <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-900">
                  Applied: {new Date(app.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-500">
            No active applications recorded. Apply to recruitment drives above!
          </div>
        )}
      </div>
    </div>
  );
};