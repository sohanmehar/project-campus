import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { 
  Users, 
  MapPin, 
  Clock, 
  UserPlus, 
  Award,
  Search,
  CheckCircle2
} from 'lucide-react';

export const ClubsView: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const isStaff = user?.role === 'coordinator' || user?.role === 'admin' || user?.role === 'faculty';

  const fetchClubs = async () => {
    try {
      const res = await axios.get('/clubs');
      if (res.data?.clubs) {
        setClubs(res.data.clubs);
      }
    } catch (err) {
      console.error('Error fetching campus clubs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  const handleToggleMembership = async (club: any) => {
    setProcessingId(club._id);
    try {
      if (club.isMember) {
        await axios.delete(`/clubs/${club._id}/leave`);
        addToast('info', 'Club Membership', `You left ${club.name}.`);
        setClubs((prev) =>
          prev.map((c) =>
            c._id === club._id ? { ...c, isMember: false, isPending: false, memberCount: Math.max(0, c.memberCount - 1) } : c
          )
        );
      } else if (club.isPending) {
        await axios.delete(`/clubs/${club._id}/leave`);
        addToast('info', 'Application Cancelled', `Cancelled membership application for ${club.name}.`);
        setClubs((prev) =>
          prev.map((c) =>
            c._id === club._id ? { ...c, isPending: false } : c
          )
        );
      } else {
        await axios.post(`/clubs/${club._id}/join`);
        addToast('success', 'Application Submitted! 🎉', `Your application for ${club.name} was sent to Coordinator Marcus Vance for approval.`);
        setClubs((prev) =>
          prev.map((c) =>
            c._id === club._id ? { ...c, isPending: true } : c
          )
        );
      }
      fetchClubs();
    } catch (err: any) {
      addToast('error', 'Error', err.response?.data?.message || 'Could not update membership.');
    } finally {
      setProcessingId(null);
    }
  };

  const categories = ['All', 'Technical', 'Academic', 'Cultural', 'Social'];

  const filteredClubs = clubs.filter((club) => {
    const matchesCategory = activeCategory === 'All' || club.category === activeCategory;
    const matchesSearch =
      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.leadName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const myClubsCount = clubs.filter((c) => c.isMember).length;
  const totalCampusMembers = clubs.reduce((sum, c) => sum + (c.memberCount || 0), 0);

  if (loading) {
    return (
      <div className="p-8 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-mono">Loading campus societies & clubs from MongoDB Atlas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <span className="micro-label text-indigo-400">Extracurricular Ecosystem</span>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">Clubs & Student Societies</h1>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">
            {clubs.length} Registered Societies
          </span>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
            {isStaff ? `${totalCampusMembers} Enrolled Members` : `${myClubsCount} Active Memberships`}
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3 sm:p-4 rounded-2xl border border-slate-800">
        {/* Category Pills */}
        <div className="flex overflow-x-auto gap-1.5 no-scrollbar pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[200px] sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search clubs or leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Clubs Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredClubs.map((club) => {
          return (
            <div
              key={club._id}
              className="stitch-card p-4 sm:p-5 bg-slate-900 border-slate-800 rounded-2xl flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition group"
            >
              <div className="space-y-3">
                {/* Top badges */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-mono font-bold rounded-full border border-indigo-500/20 uppercase">
                    {club.category}
                  </span>

                  <span className="text-[11px] font-mono text-slate-400 flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>{club.memberCount} Members</span>
                  </span>
                </div>

                {/* Club Title & Description */}
                <div>
                  <h3 className="font-bold text-white text-sm group-hover:text-indigo-400 transition leading-snug">
                    {club.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {club.description}
                  </p>
                </div>

                {/* Logistics */}
                <div className="space-y-1.5 pt-2 border-t border-slate-950 text-[11px] text-slate-300">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">{club.meetingSchedule}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{club.roomLocation}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">Lead: <strong className="text-slate-200">{club.leadName}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                {club.isMember ? (
                  <div className="flex items-center space-x-1.5 text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Registered Member</span>
                  </div>
                ) : club.isPending ? (
                  <div className="flex items-center space-x-1.5 text-amber-400 text-xs font-semibold">
                    <Clock className="w-4 h-4" />
                    <span>Pending Approval</span>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-500 font-mono">Open Membership</span>
                )}

                <button
                  onClick={() => handleToggleMembership(club)}
                  disabled={processingId === club._id}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition cursor-pointer disabled:opacity-50 ${
                    club.isMember
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20'
                      : club.isPending
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                  }`}
                >
                  {club.isMember ? (
                    <span>Leave</span>
                  ) : club.isPending ? (
                    <span>Cancel Request</span>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Join Club</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredClubs.length === 0 && (
        <div className="p-8 text-center text-xs text-slate-500">
          No clubs matched your search criteria. Try a different filter.
        </div>
      )}
    </div>
  );
};
