import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Save } from 'lucide-react';
import { useToastStore } from '../../store/useToastStore';

export const SystemSettingsView: React.FC = () => {
  const [attendanceThreshold, setAttendanceThreshold] = useState('75');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToastStore();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get('/admin/settings');
        setAttendanceThreshold(response.data.settings.attendanceThreshold.toString());
        setEmailAlerts(response.data.settings.emailAlerts);
      } catch (err) {
        console.error('Error fetching settings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put('/admin/settings', {
        attendanceThreshold: Number(attendanceThreshold),
        emailAlerts,
      });
      addToast('success', 'Settings Saved', 'Configuration saved to MongoDB database.');
    } catch (err) {
      addToast('error', 'Save Error', 'Could not save settings.');
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading system settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="micro-label text-blue-400">Global Configuration</span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">System Settings & Controls</h1>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition shadow-lg shadow-blue-600/20"
        >
          <Save className="w-4 h-4" />
          <span>Save Configuration</span>
        </button>
      </div>

      <div className="space-y-4">
        <div className="stitch-card p-6 bg-slate-900 border-slate-800 space-y-4">
          <h2 className="font-semibold text-white text-sm border-b border-slate-800 pb-2">Academic & Policy Controls</h2>
          
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Mandatory Attendance Threshold (%)</div>
                <div className="text-slate-400 text-[11px]">Minimum percentage required to clear exam eligibility</div>
              </div>
              <input
                type="number"
                value={attendanceThreshold}
                onChange={(e) => setAttendanceThreshold(e.target.value)}
                className="w-20 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white text-center font-bold focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="stitch-card p-6 bg-slate-900 border-slate-800 space-y-4">
          <h2 className="font-semibold text-white text-sm border-b border-slate-800 pb-2">Security & Session Policy</h2>
          
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">HTTP-Only Cookie Session Lifespan</div>
                <div className="text-slate-400 text-[11px]">Automatic token expiration time</div>
              </div>
              <span className="px-3 py-1 bg-slate-950 text-slate-300 rounded border border-slate-800 font-mono">7 Days</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <div>
                <div className="font-semibold text-white">Automatic Email Alerts</div>
                <div className="text-slate-400 text-[11px]">Send automatic notifications for low attendance or assignment deadlines</div>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};