import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="stitch-card p-5 bg-slate-900 border-slate-800 animate-pulse space-y-4">
      <div className="h-3 w-24 bg-slate-800 rounded" />
      <div className="h-8 w-3/4 bg-slate-800 rounded" />
      <div className="h-3 w-1/2 bg-slate-800 rounded" />
    </div>
  );
};

export const TableSkeleton: React.FC = () => {
  return (
    <div className="stitch-card p-5 bg-slate-900 border-slate-800 animate-pulse space-y-3">
      <div className="h-4 w-32 bg-slate-800 rounded mb-4" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-10 w-full bg-slate-800/60 rounded" />
      ))}
    </div>
  );
};