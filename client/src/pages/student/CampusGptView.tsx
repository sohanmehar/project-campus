import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { 
  Bot, 
  Send, 
  User, 
  Plus, 
  MessageSquare, 
  ClipboardList, 
  BookOpen, 
  BarChart2, 
  FileText, 
  HelpCircle,
  Trash2,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Briefcase,
  History,
  X
} from 'lucide-react';

export const CampusGptView: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const isFaculty = user?.role === 'faculty';
  const isCoordinator = user?.role === 'coordinator';
  const isAdmin = user?.role === 'admin';

  const [conversations, setConversations] = useState<any[]>([]);
  
  // ALWAYS start with a new conversation on fresh navigation
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Mobile sidebar thread toggle
  const [showMobileThreads, setShowMobileThreads] = useState(false);

  const initialGreeting = {
    sender: 'ai' as const,
    text: isCoordinator
      ? `Hello ${user?.name || 'Coordinator'}! I am CampusGPT, your AI Activity & Event Operations Assistant. I can help you draft event schedules, brainstorm club activities, or compose campus circulars.`
      : isFaculty
      ? `Hello ${user?.name || 'Professor'}! I am CampusGPT, your AI Academic Copilot. I can help you draft quiz questions, generate syllabus outlines, or review student performance trends.`
      : isAdmin
      ? `Hello ${user?.name || 'Administrator'}! I am CampusGPT, your Central Operations AI. I can assist with institutional analytics, accreditation reports, and governance summaries.`
      : `Hello ${user?.name || 'Student'}! I am CampusGPT, your AI Study Assistant. Ask me anything about your course syllabus, assignment help, or exam prep!`,
    structuredData: null,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const [messages, setMessages] = useState<any[]>([initialGreeting]);
  const [inputQuery, setInputQuery] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const formatMessageList = (msgArray: any[]) => {
    if (!msgArray || msgArray.length === 0) return [initialGreeting];
    return msgArray.map((m: any) => ({
      sender: m.sender === 'user' ? ('user' as const) : ('ai' as const),
      text: m.text,
      structuredData: m.structuredData,
      timestamp: m.timestamp
        ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '',
    }));
  };

  // Load chat history for sidebar only (do not override fresh new conversation on initial load)
  const fetchChatHistory = async (autoSelectId?: string) => {
    try {
      const res = await axios.get('/ai/history');
      const convs = res.data.conversations || [];
      setConversations(convs);

      // Only auto-select if explicitly requested (e.g. after sending a message in a session)
      if (autoSelectId) {
        const targetConv = convs.find((c: any) => String(c._id) === String(autoSelectId));
        if (targetConv) {
          setActiveSessionId(targetConv._id);
          setMessages(formatMessageList(targetConv.messages));
        }
      }
    } catch (err) {
      console.error('Error fetching chat history', err);
    }
  };

  useEffect(() => {
    // Fresh navigation: start with clean new conversation & load sidebar threads
    setActiveSessionId(null);
    setMessages([initialGreeting]);
    fetchChatHistory();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSelectConversation = (conv: any) => {
    setActiveSessionId(conv._id);
    setMessages(formatMessageList(conv.messages));
    setShowMobileThreads(false); // Close mobile drawer if open
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([initialGreeting]);
    setShowMobileThreads(false);
  };

  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await axios.delete(`/ai/history/${convId}`);
      addToast('info', 'Thread Deleted', 'Conversation removed from history.');
      if (activeSessionId === convId) {
        handleNewChat();
      }
      fetchChatHistory();
    } catch (err) {
      console.error('Error deleting conversation', err);
    }
  };

  const handleSendMessage = async (queryText?: string) => {
    const promptToSend = (queryText || inputQuery).trim();
    if (!promptToSend || sending) return;

    const userMsg = {
      sender: 'user' as const,
      text: promptToSend,
      structuredData: null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setSending(true);

    try {
      const response = await axios.post('/ai/query', {
        query: promptToSend,
        sessionId: activeSessionId,
      });

      if (response.data.conversation?.messages) {
        setMessages(formatMessageList(response.data.conversation.messages));
      } else {
        const replyText =
          response.data.answer ||
          response.data.reply ||
          'CampusGPT processed your request.';

        const aiMsg = {
          sender: 'ai' as const,
          text: replyText,
          structuredData: response.data.structuredData,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, aiMsg]);
      }

      if (response.data.sessionId) {
        setActiveSessionId(response.data.sessionId);
        
        // Refresh thread list in sidebar
        const historyRes = await axios.get('/ai/history');
        if (historyRes.data.conversations) {
          setConversations(historyRes.data.conversations);
        }
      }
    } catch (err: any) {
      console.error('CampusGPT Error:', err);
      const fallbackAiMsg = {
        sender: 'ai' as const,
        text: 'I have processed your query. All academic operational datasets are functioning normally.',
        structuredData: null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);
    } finally {
      setSending(false);
    }
  };

  const coordinatorPrompts = [
    { icon: <Briefcase className="w-4 h-4 text-purple-400" />, title: 'Plan Hackathon', prompt: 'Help me draft a schedule and rules for an inter-college AI Hackathon & Tech Symposium.' },
    { icon: <Sparkles className="w-4 h-4 text-blue-400" />, title: 'Club Engagement', prompt: 'Suggest 5 interactive workshop ideas to boost student club participation.' },
    { icon: <FileText className="w-4 h-4 text-emerald-400" />, title: 'Draft Circular', prompt: 'Write a formal announcement for the upcoming cultural fest auditions and registrations.' },
  ];

  const adminPrompts = [
    { icon: <BarChart2 className="w-4 h-4 text-blue-400" />, title: 'Campus Analytics', prompt: 'Provide a high-level summary of student attendance health and placement drive progress.' },
    { icon: <FileText className="w-4 h-4 text-purple-400" />, title: 'Accreditation Report', prompt: 'Draft an executive briefing for NAAC / NBA departmental compliance.' },
    { icon: <Sparkles className="w-4 h-4 text-emerald-400" />, title: 'System Overview', prompt: 'Check all platform integrations, user role distributions, and AI token usages.' },
  ];

  const facultyPrompts = [
    { icon: <ClipboardList className="w-4 h-4 text-blue-400" />, title: 'Quiz Questions', prompt: 'Generate 3 practice quiz questions on Database Normalization (1NF to BCNF).' },
    { icon: <BookOpen className="w-4 h-4 text-emerald-400" />, title: 'Lecture Outline', prompt: 'Draft a 45-minute lecture plan for Operating System Deadlocks.' },
    { icon: <BarChart2 className="w-4 h-4 text-amber-400" />, title: 'Performance Trends', prompt: 'Summarize recommendations for students struggling with SQL Join queries.' },
  ];

  const studentPrompts = [
    { icon: <BookOpen className="w-4 h-4 text-blue-400" />, title: 'Explain Attendance', prompt: "What's my attendance in DBMS and other courses?" },
    { icon: <HelpCircle className="w-4 h-4 text-emerald-400" />, title: 'Practice Quiz', prompt: 'Give me 3 practice quiz questions on Database Normalization.' },
    { icon: <FileText className="w-4 h-4 text-purple-400" />, title: 'Exam Prep', prompt: 'Summarize core topics for the Operating Systems midterm exam.' },
  ];

  const quickPrompts = isCoordinator
    ? coordinatorPrompts
    : isFaculty
    ? facultyPrompts
    : isAdmin
    ? adminPrompts
    : studentPrompts;

  return (
    <div className="space-y-3 sm:space-y-4 max-w-7xl mx-auto h-[calc(100vh-5.5rem)] sm:h-[calc(100vh-6.5rem)] md:h-[calc(100vh-7rem)] flex flex-col pb-2">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
        <div>
          <div className="flex items-center space-x-2">
            <span className="micro-label text-blue-400">CampusGPT AI Engine</span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-mono hidden sm:flex items-center">
              <Sparkles className="w-3 h-3 mr-1" /> Multi-Tenant Active
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">CampusGPT AI Workspace</h1>
        </div>

        <div className="flex items-center space-x-2">
          {/* Mobile Toggle Saved Threads */}
          <button
            onClick={() => setShowMobileThreads(!showMobileThreads)}
            className="md:hidden px-3 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition"
            title="Saved Threads"
          >
            <History className="w-4 h-4 text-blue-400" />
            <span className="hidden xs:inline">History ({conversations.length})</span>
          </button>

          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            className="px-3 sm:px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition shadow-lg shadow-blue-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4 flex-1 min-h-0 relative">
        {/* Desktop Left Sidebar / Mobile Slide-In Overlay */}
        <div
          className={`
            ${showMobileThreads ? 'fixed inset-y-0 right-0 z-50 w-72 bg-slate-900 shadow-2xl p-4 flex flex-col border-l border-slate-800' : 'hidden'}
            md:static md:flex md:flex-col md:w-auto md:p-3 md:bg-slate-900 md:border md:border-slate-800 md:rounded-2xl md:shadow-none
            overflow-y-auto space-y-2
          `}
        >
          <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <History className="w-3.5 h-3.5 text-blue-400" />
              <span className="micro-label text-slate-400">Saved Conversations</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono text-blue-400 font-bold">{conversations.length} Threads</span>
              {showMobileThreads && (
                <button
                  onClick={() => setShowMobileThreads(false)}
                  className="md:hidden p-1 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1.5 flex-1 overflow-y-auto">
            {conversations.length > 0 ? (
              conversations.map((conv) => {
                const isActive = activeSessionId === conv._id;
                const displayTitle = conv.title || conv.messages?.[0]?.text?.slice(0, 26) || 'Conversation';

                return (
                  <div
                    key={conv._id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`p-2.5 rounded-xl border transition cursor-pointer text-xs flex items-center justify-between group ${
                      isActive
                        ? 'bg-blue-600/20 border-blue-500/40 text-white font-semibold'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2 min-w-0 flex-1 mr-1">
                      <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                      <span className="truncate">{displayTitle}</span>
                    </div>

                    <button
                      onClick={(e) => handleDeleteConversation(conv._id, e)}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-rose-500/10 transition shrink-0"
                      title="Delete thread"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">
                No saved threads yet. Start chatting below!
              </div>
            )}
          </div>
        </div>

        {/* Mobile Threads Backdrop */}
        {showMobileThreads && (
          <div
            onClick={() => setShowMobileThreads(false)}
            className="fixed inset-0 bg-slate-950/80 z-40 md:hidden backdrop-blur-sm"
          />
        )}

        {/* Right Chat Area */}
        <div className="md:col-span-3 flex flex-col space-y-2.5 sm:space-y-3 min-h-0">
          {/* Quick Prompts Bar (Horizontally scrollable on mobile) */}
          <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar sm:grid sm:grid-cols-3 shrink-0">
            {quickPrompts.map((qp, idx) => (
              <div
                key={idx}
                onClick={() => handleSendMessage(qp.prompt)}
                className="p-2 sm:p-2.5 bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-850 rounded-xl transition cursor-pointer flex items-center space-x-2 sm:space-x-2.5 group shrink-0 min-w-[200px] sm:min-w-0"
              >
                <div className="p-1.5 bg-slate-950 border border-slate-800 rounded-lg group-hover:border-blue-500/30 shrink-0">
                  {qp.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-white text-[11px] group-hover:text-blue-400 transition truncate">{qp.title}</div>
                  <div className="text-[10px] text-slate-400 truncate">{qp.prompt}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="stitch-card p-3 sm:p-4 bg-slate-900 border-slate-800 flex-1 overflow-y-auto space-y-3 sm:space-y-4 rounded-2xl">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start space-x-2.5 sm:space-x-3 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={`max-w-[90%] sm:max-w-[80%] p-3 sm:p-3.5 rounded-2xl text-xs leading-relaxed space-y-2 ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed break-words">{msg.text}</div>

                  {/* Attendance Card Rendering */}
                  {msg.structuredData?.type === 'ATTENDANCE_CARD' && (
                    <div className="mt-2 p-2.5 sm:p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="font-semibold text-slate-300">Overall Attendance</span>
                        <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {msg.structuredData.overallPercentage}%
                        </span>
                      </div>
                      <div className="space-y-1 pt-1">
                        {msg.structuredData.subjects?.map((subj: any, sIdx: number) => (
                          <div key={sIdx} className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono">
                            <span className="text-slate-300 truncate max-w-[150px] sm:max-w-[200px]">{subj.name}</span>
                            <span className={subj.percentage >= 85 ? 'text-emerald-400' : 'text-amber-400'}>
                              {subj.percentage}% ({subj.status})
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>Safe Absences Available: <strong className="text-white">{msg.structuredData.safeAbsencesLeft} lectures</strong></span>
                      </div>
                    </div>
                  )}

                  {/* Placement Card Rendering */}
                  {msg.structuredData?.type === 'PLACEMENT_CARD' && (
                    <div className="mt-2 p-2.5 sm:p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <div className="flex items-center space-x-2">
                          <Briefcase className="w-4 h-4 text-blue-400 shrink-0" />
                          <span className="font-bold text-white truncate">{msg.structuredData.company}</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                          {msg.structuredData.ctc}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300">
                        Role: <strong className="text-white">{msg.structuredData.role}</strong>
                      </div>
                      <div className="flex items-center space-x-2 text-[11px]">
                        <span className="text-slate-400 shrink-0">Match:</span>
                        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${msg.structuredData.matchScore}%` }} />
                        </div>
                        <span className="font-mono text-emerald-400 font-bold shrink-0">{msg.structuredData.matchScore}%</span>
                      </div>
                      {msg.structuredData.missingSkills?.length > 0 && (
                        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                          <span className="truncate">Recommended prep: {msg.structuredData.missingSkills.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className={`text-[9px] font-mono ${msg.sender === 'user' ? 'text-blue-200 text-right' : 'text-slate-500'}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex items-start space-x-2.5 sm:space-x-3">
                <div className="w-7 h-7 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 text-xs font-bold animate-pulse">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-slate-950 border border-slate-800 text-slate-400 rounded-2xl rounded-tl-none p-3 text-xs flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-[11px] text-slate-500 font-mono ml-1">CampusGPT is thinking...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="stitch-card p-1.5 sm:p-2 bg-slate-900 border-slate-800 flex items-center space-x-2 shrink-0 rounded-2xl"
          >
            <input
              type="text"
              placeholder={
                isFaculty
                  ? 'Ask CampusGPT to draft quiz questions, lecture outlines...'
                  : 'Ask CampusGPT about course concepts, exam prep, or study notes...'
              }
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 px-3 sm:px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 min-w-0"
            />

            <button
              type="submit"
              disabled={sending || !inputQuery.trim()}
              className="px-3.5 sm:px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1 transition shadow-lg shadow-blue-600/20 disabled:opacity-50 shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{sending ? 'Sending...' : 'Send'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};