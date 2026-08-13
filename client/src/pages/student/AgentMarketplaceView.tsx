import React from 'react';
import { BookOpen, Briefcase, Code, ArrowRight, Sparkles } from 'lucide-react';

interface AgentMarketplaceViewProps {
  onLaunchAgent?: (agentId: string) => void;
}

export const AgentMarketplaceView: React.FC<AgentMarketplaceViewProps> = ({ onLaunchAgent }) => {
  const agents = [
    {
      id: 'study-mentor',
      name: 'Academic Mentor',
      category: 'Academic',
      desc: 'Analyzes course syllabus, tracks learning progress, and generates custom study guides based on active lectures.',
      icon: BookOpen,
      badge: 'Popular',
    },
    {
      id: 'placement-coach',
      name: 'Placement Coach',
      category: 'Career',
      desc: 'Analyzes target company recruitment formats, reviews resumes, and generates tailored technical interview prep plans.',
      icon: Briefcase,
      badge: 'Trending',
    },
    {
      id: 'dsa-coach',
      name: 'DSA Coach',
      category: 'Coding',
      desc: 'Interactive algorithm visualizer and problem-solving mentor for LeetCode and technical coding rounds.',
      icon: Code,
      badge: 'Essential',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="micro-label text-indigo-400">Specialized Intelligence Hub</span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">AI Agent Marketplace</h1>
        </div>
        <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold rounded-full">
          3 Domain Assistants Active
        </div>
      </div>

      {/* Agents Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {agents.map((agent) => {
          const Icon = agent.icon;
          return (
            <div
              key={agent.id}
              className="stitch-card p-6 bg-slate-900 border-slate-800 flex flex-col justify-between space-y-4 hover:border-indigo-500/50 transition group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-xl">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-semibold rounded-full border border-slate-700">
                    {agent.badge}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-white text-base group-hover:text-indigo-400 transition">
                    {agent.name}
                  </h3>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    {agent.category} Assistant
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{agent.desc}</p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-emerald-400 font-medium flex items-center">
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> Ready
                </span>
                <button
                  onClick={() => onLaunchAgent && onLaunchAgent(agent.id)}
                  className="flex items-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition hover:translate-x-1"
                >
                  Launch Agent <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};