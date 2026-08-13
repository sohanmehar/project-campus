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
  HelpCircle 
} from 'lucide-react';

export const CampusGptView: React.FC = () => {
  const { user } = useAuthStore();
  useToastStore();
  const isFaculty = user?.role === 'faculty';

  const [conversations, setConversations] = useState<any[]>([]);
  
  // Persist activeSessionId in localStorage so page refresh stays on the current thread
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    return localStorage.getItem('campusgpt_active_session_id');
  });

  const initialGreeting = {
    sender: 'ai' as const,
    text: isFaculty
      ? `Hello ${user?.name || 'Professor'}! I am CampusGPT, your AI Academic Copilot. I can help you draft quiz questions, generate syllabus outlines, or review student performance trends.`
      : `Hello ${user?.name || 'Student'}! I am CampusGPT, your AI Study Assistant. Ask me anything about your course syllabus, assignment help, or exam prep!`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const [messages, setMessages] = useState<any[]>([initialGreeting]);
  const [inputQuery, setInputQuery] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from backend
  const fetchChatHistory = async () => {
    try {
      const res = await axios.get('/ai/history');
      const convs = res.data.conversations || [];
      setConversations(convs);

      if (convs.length > 0) {
        const storedId = localStorage.getItem('campusgpt_active_session_id');
        const targetConv = convs.find((c: any) => c._id === storedId) || convs[0];

        if (targetConv) {
          setActiveSessionId(targetConv._id);
          localStorage.setItem('campusgpt_active_session_id', targetConv._id);

          const formattedMsgs = (targetConv.messages || []).map((m: any) => ({
            sender: m.sender,
            text: m.text,
            timestamp: m.timestamp
              ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '',
          }));

          setMessages(formattedMsgs.length > 0 ? formattedMsgs : [initialGreeting]);
        }
      }
    } catch (err) {
      console.error('Error fetching chat history', err);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConversation = (conv: any) => {
    setActiveSessionId(conv._id);
    localStorage.setItem('campusgpt_active_session_id', conv._id);

    const formattedMsgs = (conv.messages || []).map((m: any) => ({
      sender: m.sender,
      text: m.text,
      timestamp: m.timestamp
        ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '',
    }));
    setMessages(formattedMsgs.length > 0 ? formattedMsgs : [initialGreeting]);
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    localStorage.removeItem('campusgpt_active_session_id');
    setMessages([initialGreeting]);
  };

  const handleSendMessage = async (queryText?: string) => {
    const promptToSend = queryText || inputQuery;
    if (!promptToSend.trim() || sending) return;

    const userMsg = {
      sender: 'user' as const,
      text: promptToSend,
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

      const replyText =
        response.data.answer ||
        response.data.reply ||
        'CampusGPT processed your request.';

      const aiMsg = {
        sender: 'ai' as const,
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);

      if (response.data.sessionId) {
        setActiveSessionId(response.data.sessionId);
        localStorage.setItem('campusgpt_active_session_id', response.data.sessionId);
      }
      fetchChatHistory();
    } catch (err: any) {
      console.error('CampusGPT Error:', err);
    } finally {
      setSending(false);
    }
  };

  const facultyPrompts = [
    { icon: <ClipboardList className="w-4 h-4 text-blue-400" />, title: 'Quiz Questions', prompt: 'Generate 5 multiple-choice questions for Database Normalization.' },
    { icon: <BookOpen className="w-4 h-4 text-emerald-400" />, title: 'Lecture Outline', prompt: 'Draft a 45-minute lecture plan for Operating System Deadlocks.' },
    { icon: <BarChart2 className="w-4 h-4 text-amber-400" />, title: 'Performance Trends', prompt: 'Summarize recommendations for students struggling with SQL Join queries.' },
  ];

  const studentPrompts = [
    { icon: <BookOpen className="w-4 h-4 text-blue-400" />, title: 'Explain Simply', prompt: 'Explain B-Tree indexing and search complexity in database systems.' },
    { icon: <HelpCircle className="w-4 h-4 text-emerald-400" />, title: 'Practice Quiz', prompt: 'Give me 3 practice questions on CPU Scheduling Algorithms.' },
    { icon: <FileText className="w-4 h-4 text-purple-400" />, title: 'Exam Prep', prompt: 'Summarize core topics for the Operating Systems midterm exam.' },
  ];

  const quickPrompts = isFaculty ? facultyPrompts : studentPrompts;

  return (
    <div className="space-y-4 max-w-7xl mx-auto h-[calc(100vh-7rem)] flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
        <div>
          <span className="micro-label text-blue-400">CampusGPT AI Engine</span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">CampusGPT AI Workspace</h1>
        </div>

        <button
          onClick={handleNewChat}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat Session</span>
        </button>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 min-h-0">
        {/* Left Sidebar */}
        <div className="stitch-card p-3 bg-slate-900 border-slate-800 space-y-2 flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-800">
            <span className="micro-label text-slate-400">Saved Conversations</span>
            <span className="text-[10px] font-mono text-blue-400 font-bold">{conversations.length} Threads</span>
          </div>

          <div className="space-y-1 flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <div
                key={conv._id}
                onClick={() => handleSelectConversation(conv)}
                className={`p-2.5 rounded-xl border transition cursor-pointer text-xs flex items-center space-x-2.5 ${
                  activeSessionId === conv._id
                    ? 'bg-blue-600/20 border-blue-500/40 text-white font-semibold'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate flex-1">{conv.title || conv.messages[0]?.text?.slice(0, 24) || 'Conversation'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Chat Area */}
        <div className="md:col-span-3 flex flex-col space-y-3 min-h-0">
          {/* Quick Prompts Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 shrink-0">
            {quickPrompts.map((qp, idx) => (
              <div
                key={idx}
                onClick={() => handleSendMessage(qp.prompt)}
                className="p-2.5 bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-850 rounded-xl transition cursor-pointer flex items-center space-x-2.5 group"
              >
                <div className="p-1.5 bg-slate-950 border border-slate-800 rounded-lg group-hover:border-blue-500/30">
                  {qp.icon}
                </div>
                <div>
                  <div className="font-bold text-white text-[11px] group-hover:text-blue-400 transition">{qp.title}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-1">{qp.prompt}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="stitch-card p-4 bg-slate-900 border-slate-800 flex-1 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
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
                  className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed space-y-1 ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  <div className={`text-[9px] font-mono ${msg.sender === 'user' ? 'text-blue-200 text-right' : 'text-slate-500'}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="stitch-card p-2 bg-slate-900 border-slate-800 flex items-center space-x-2 shrink-0"
          >
            <input
              type="text"
              placeholder={
                isFaculty
                  ? 'Ask CampusGPT to draft quiz questions, lecture outlines, or exam criteria...'
                  : 'Ask CampusGPT about course concepts, exam prep, or study notes...'
              }
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />

            <button
              type="submit"
              disabled={sending || !inputQuery.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition shadow-lg shadow-blue-600/20 disabled:opacity-50 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sending ? 'Sending...' : 'Send'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};