import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Shield,
  BookOpen,
  Users,
  Bot,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Sun,
  Moon,
  Zap,
  Layers,
  Globe
} from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';
import { useAuthStore } from '../store/useAuthStore';

export const LandingPage: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { isAuthenticated } = useAuthStore();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const ecosystems = [
    {
      icon: <GraduationCap className="w-6 h-6 text-blue-400" />,
      role: 'Student Ecosystem',
      tag: 'Autonomous Learning',
      desc: 'Real-time attendance tracking with 75% threshold alerts, coursework submissions via GitHub/PDF, exam digital passes, and 1-click placement applications.',
      features: ['Attendance Analytics & 75% Warning', 'Assignment Uploads & Graded Feedback', 'Digital Event QR Passes', 'AI Career Eligibility Matcher']
    },
    {
      icon: <BookOpen className="w-6 h-6 text-emerald-400" />,
      role: 'Faculty Command',
      tag: 'Academic Mastery',
      desc: 'Smart attendance sessions with live projector QR check-ins, assignment creation with rubrics, rubric-assisted evaluation, and syllabus broadcasting.',
      features: ['Instant Classroom Attendance', 'Projector QR Check-In Scanner', 'Submissions Review & Grading', 'Department Study Material Publisher']
    },
    {
      icon: <Users className="w-6 h-6 text-purple-400" />,
      role: 'Coordinator Hub',
      tag: 'Extracurricular Operations',
      desc: 'End-to-end event lifecycle management, campus hackathons, student society registration rosters, and persistent membership approval pipelines.',
      features: ['Campus Hackathons & Passes', 'Club Memberships & Rosters', 'Student Activity Approval Queue', 'Broadcast Activity Circulars']
    },
    {
      icon: <Shield className="w-6 h-6 text-amber-400" />,
      role: 'Super Admin Center',
      tag: 'Institutional Governance',
      desc: 'Total administrative sovereignty over student and faculty registries, Excel/CSV bulk onboarding, department curriculum architectures, and AI token analytics.',
      features: ['Excel / CSV Bulk Importer & Exporter', 'Academic Department Architectures', 'Role-Based Access Control (RBAC)', 'Campus AI Engine Platform Metrics']
    }
  ];

  const statistics = [
    { number: '99.9%', label: 'Platform Uptime', sub: 'Production Cloud SLA' },
    { number: '1,200+', label: 'Active Students', sub: 'Synced in MongoDB Atlas' },
    { number: '< 200ms', label: 'AI Response Latency', sub: 'Context-Aware AI Engine' },
    { number: '100%', label: 'Paperless Campus', sub: 'Digital QR Passes & Grading' }
  ];

  const testimonials = [
    {
      quote: 'CampusGPT unified our scattered WhatsApp groups, attendance registers, and placement forms into a single, cohesive operating system. It revolutionized our campus.',
      author: 'Dr. Elena Thorne',
      role: 'Dean of Academic Operations'
    },
    {
      quote: 'The AI Copilot and digital QR passes make event coordination effortless. Processing 400+ hackathon attendees takes seconds instead of hours.',
      author: 'Marcus Vance',
      role: 'Head Student Coordinator'
    },
    {
      quote: 'Being able to verify my attendance threshold, submit my GitHub code directly, and check placement drive eligibility with AI guidance is incredible.',
      author: 'Alex Mercer',
      role: 'Computer Engineering Senior'
    }
  ];

  const faqs = [
    {
      question: 'What is CampusGPT Enterprise University OS?',
      answer: 'CampusGPT is an enterprise-grade full-stack smart campus management operating system designed to replace fragmented systems with a unified platform for Students, Faculty, Activity Coordinators, and Administrators.'
    },
    {
      question: 'How does the Google OAuth 2.0 authentication work?',
      answer: 'Users can sign in with one click using their verified Google accounts. The system verifies the cryptographic Google ID token and automatically provisions a student profile or maps existing faculty/admin roles.'
    },
    {
      question: 'Is student attendance tracking compliant with university criteria?',
      answer: 'Yes! CampusGPT features automated 75% attendance threshold monitoring, subject-wise analytics, monthly participation charts, and live projector QR attendance check-in.'
    },
    {
      question: 'How does the CampusGPT AI Copilot work?',
      answer: 'CampusGPT integrates a multi-tenant context-aware AI copilot. It adapts context dynamically depending on the authenticated role (Academic tutor for students, lesson planner for faculty, event strategist for coordinators, and analytics engine for administrators).'
    },
    {
      question: 'Can colleges import their existing student and faculty databases?',
      answer: 'Absolutely. The Admin Registry features a built-in Excel (.xlsx) and CSV bulk import engine that parses spreadsheets and onboards hundreds of records in seconds.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      {/* Sticky Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-white text-base tracking-tight leading-none">CampusGPT</div>
              <div className="micro-label text-blue-400 tracking-wider">UNIVERSITY OS</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-300">
            <a href="#ecosystems" className="hover:text-blue-400 transition">Ecosystems</a>
            <a href="#ai-engine" className="hover:text-blue-400 transition">AI Copilot</a>
            <a href="#statistics" className="hover:text-blue-400 transition">Metrics</a>
            <a href="#faq" className="hover:text-blue-400 transition">FAQ</a>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>

            <Link
              to={isAuthenticated ? "/dashboard" : "/login"}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition shadow-lg shadow-blue-600/25 active:scale-95 cursor-pointer"
            >
              <span>{isAuthenticated ? 'Open Dashboard' : 'Launch Portal'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider animate-in fade-in zoom-in-95">
          <Zap className="w-3.5 h-3.5 text-blue-400" />
          <span>Next-Gen Smart Campus Operating System</span>
        </div>

        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight sm:leading-none">
            One Campus. Four Ecosystems. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              One Intelligent AI Layer.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Eliminate disconnected spreadsheets and WhatsApp groups. CampusGPT unifies attendance tracking, coursework grading, event passes, placement drives, and multi-tenant AI assistance into one production-ready platform.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
          <Link
            to="/login"
            className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center space-x-2 transition shadow-xl shadow-blue-600/30 active:scale-95 cursor-pointer"
          >
            <span>Sign In to University Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="#ecosystems"
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800/90 text-slate-200 border border-slate-800 font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            <Layers className="w-4 h-4 text-slate-400" />
            <span>Explore All 4 Ecosystems</span>
          </a>
        </div>

        {/* Live Interactive Mockup Hero Banner */}
        <div className="pt-8 max-w-5xl mx-auto">
          <div className="stitch-card p-3 sm:p-5 bg-slate-900/90 border-slate-800 rounded-3xl shadow-2xl space-y-4 relative group">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 px-2">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>campusgpt.edu/dashboard</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Live MongoDB Atlas Synced
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Attendance Status</span>
                <div className="text-lg font-bold font-mono text-emerald-400">88.5%</div>
                <span className="text-[10px] text-emerald-300">Exam Eligible</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Coursework</span>
                <div className="text-lg font-bold font-mono text-white">4 Modules</div>
                <span className="text-[10px] text-blue-400">2 Graded (95%)</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Event Entry Pass</span>
                <div className="text-lg font-bold font-mono text-purple-400">QR-448201</div>
                <span className="text-[10px] text-purple-300">DevFusion Hackathon</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Placement Match</span>
                <div className="text-lg font-bold font-mono text-amber-400">18.5 LPA</div>
                <span className="text-[10px] text-amber-300">Amazon SDE Eligible</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystems Grid */}
      <section id="ecosystems" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 border-t border-slate-800/80">
        <div className="text-center space-y-2">
          <span className="micro-label text-blue-400">Role-Based Architecture</span>
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">Four Dedicated Ecosystems</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Tailored interfaces engineered with strict role-based permissions for every campus stakeholder.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {ecosystems.map((eco, idx) => (
            <div
              key={idx}
              className="stitch-card p-6 sm:p-7 bg-slate-900/90 border-slate-800 rounded-3xl space-y-5 hover:border-blue-500/40 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl group-hover:scale-105 transition-transform">
                  {eco.icon}
                </div>
                <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-mono font-bold rounded-full border border-blue-500/20 uppercase">
                  {eco.tag}
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-white">{eco.role}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{eco.desc}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800/60">
                {eco.features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-center space-x-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Copilot Showcase */}
      <section id="ai-engine" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 border-t border-slate-800/80">
        <div className="stitch-card p-8 sm:p-12 bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-900 border-blue-500/30 rounded-3xl space-y-6 text-center max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase font-mono">
            <Bot className="w-4 h-4 text-blue-400" />
            <span>CampusGPT AI Multi-Tenant Engine</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
            An Intelligent AI Copilot for Every Stakeholder
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Integrated multi-agent intelligence with full MongoDB conversation persistence. Ask for syllabus explanations, draft exam questions, brainstorm club hackathons, or audit institutional metrics in real time.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-left">
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1">
              <span className="text-[10px] font-mono text-blue-400 uppercase font-bold">For Students</span>
              <p className="text-xs text-slate-300">"Explain Database Normalization 1NF to BCNF with exam practice questions."</p>
            </div>
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1">
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">For Faculty</span>
              <p className="text-xs text-slate-300">"Draft a 45-minute lesson plan for Operating System Semaphore Deadlocks."</p>
            </div>
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1">
              <span className="text-[10px] font-mono text-purple-400 uppercase font-bold">For Coordinators</span>
              <p className="text-xs text-slate-300">"Plan a 24-hour campus hackathon schedule with sponsor pitch guidelines."</p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section id="statistics" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
          {statistics.map((stat, idx) => (
            <div key={idx} className="stitch-card p-6 bg-slate-900 border-slate-800 rounded-3xl space-y-1">
              <div className="text-2xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">{stat.number}</div>
              <div className="font-semibold text-xs sm:text-sm text-blue-400">{stat.label}</div>
              <div className="text-[10px] text-slate-500 font-mono">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 border-t border-slate-800/80">
        <div className="text-center space-y-2">
          <span className="micro-label text-blue-400">Campus Trust</span>
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">Built for Real University Workflows</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, idx) => (
            <div key={idx} className="stitch-card p-6 bg-slate-900 border-slate-800 rounded-3xl space-y-4 flex flex-col justify-between">
              <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">"{t.quote}"</p>
              <div className="pt-3 border-t border-slate-800">
                <div className="font-bold text-xs text-white">{t.author}</div>
                <div className="text-[11px] text-slate-400">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive FAQ Accordion */}
      <section id="faq" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 border-t border-slate-800/80">
        <div className="text-center space-y-2">
          <span className="micro-label text-blue-400">Common Questions</span>
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="stitch-card bg-slate-900 border-slate-800 rounded-2xl overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer hover:bg-slate-850 transition"
              >
                <span className="font-semibold text-xs sm:text-sm text-white">{faq.question}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-blue-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="stitch-card p-8 sm:p-12 bg-gradient-to-r from-blue-900/60 via-indigo-950/60 to-purple-900/60 border-blue-500/30 rounded-3xl text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
            Ready to Experience the Next-Gen Campus OS?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Test the complete system with 1-click demo access for Student, Faculty, Coordinator, or Administrator roles.
          </p>
          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-xl shadow-blue-600/30 active:scale-95 cursor-pointer"
            >
              <span>Access CampusGPT Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center space-x-2 text-slate-400 font-semibold">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>CampusGPT Enterprise OS</span>
        </div>
        <p>© 2026 CampusGPT Enterprise OS. DevFusion 4.0 Hackathon Edition. Built by Sohan Mehar & Suchitra Karde. All rights reserved.</p>
      </footer>
    </div>
  );
};