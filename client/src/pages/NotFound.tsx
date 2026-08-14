import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center space-y-6">
      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase font-mono">
        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
        <span>CampusGPT System Navigation</span>
      </div>

      <div className="space-y-2 max-w-md">
        <h1 className="text-7xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
          404
        </h1>
        <h2 className="text-xl font-bold text-white tracking-tight">Resource Not Located</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          The requested campus endpoint or URL path does not exist on the CampusGPT server cluster.
        </p>
      </div>

      <div className="flex items-center space-x-3 pt-2">
        <Link
          to="/dashboard"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center space-x-2 transition shadow-lg shadow-blue-600/20 cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>

        <Link
          to="/"
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-semibold text-xs rounded-xl flex items-center space-x-2 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home Page</span>
        </Link>
      </div>
    </div>
  );
};
