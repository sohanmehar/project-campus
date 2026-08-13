import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Sparkles } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export const AiMetricsView: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get('/admin/ai-metrics');
        setMetrics(response.data.metrics);
      } catch (err) {
        console.error('Error fetching AI metrics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading AI infrastructure telemetries...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="micro-label text-indigo-400">Artificial Intelligence Infrastructure</span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">CampusGPT AI Platform Metrics</h1>
        </div>
        <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold rounded-full flex items-center">
          <Sparkles className="w-3.5 h-3.5 mr-1" /> Gemini 1.5 Engine Connected
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stitch-card p-4 bg-slate-900 border-slate-800 space-y-2">
          <span className="micro-label text-slate-400">Total AI Queries Today</span>
          <div className="text-2xl font-bold text-white">{metrics?.totalQueriesToday?.toLocaleString()}</div>
          <span className="text-[11px] text-emerald-400 font-semibold">100% Deterministic Routing</span>
        </div>

        <div className="stitch-card p-4 bg-slate-900 border-slate-800 space-y-2">
          <span className="micro-label text-slate-400">Avg API Latency</span>
          <div className="text-2xl font-bold text-white">{metrics?.avgLatencyMs} ms</div>
          <span className="text-[11px] text-blue-400 font-semibold">Sub-second response</span>
        </div>

        <div className="stitch-card p-4 bg-slate-900 border-slate-800 space-y-2">
          <span className="micro-label text-slate-400">Tool Match Accuracy</span>
          <div className="text-2xl font-bold text-emerald-400">{metrics?.toolMatchAccuracy}%</div>
          <span className="text-[11px] text-slate-400">Zero database hallucinations</span>
        </div>

        <div className="stitch-card p-4 bg-slate-900 border-slate-800 space-y-2">
          <span className="micro-label text-slate-400">Active Agents Deployed</span>
          <div className="text-2xl font-bold text-white">{metrics?.activeAgents}</div>
          <span className="text-[11px] text-indigo-400 font-semibold">Mentor, Coach, DSA</span>
        </div>
      </div>

      <div className="stitch-card p-6 bg-slate-900 border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="font-semibold text-white text-sm">Query Traffic & System Latency (Ms)</h2>
            <p className="text-xs text-slate-400">Real-time throughput metrics across campus users</p>
          </div>
          <span className="micro-label text-emerald-400">Status: Optimal</span>
        </div>

        <div className="h-60 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics?.performanceTrend || []}>
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff', fontSize: '12px' }} />
              <Area type="monotone" dataKey="queries" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};