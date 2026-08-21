'use client';

import { useChat } from '@ai-sdk/react';
import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  Paperclip,
  Minimize2,
  Maximize2,
  MoreVertical,
  SquarePen,
  Trash2,
  Copy,
  AlertTriangle,
  History,
  Search,
  MessageSquare,
  ArrowLeft,
  Clock,
} from 'lucide-react';
import { DefaultChatTransport } from 'ai';
import { WelcomeScreen } from './welcome-screen';
import { MessageCard } from './message-card';
import { toast } from 'sonner';

interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  messages: any[];
}

const STORAGE_KEY = 'clixpro_ai_chat_sessions_v1';

function formatRelativeTime(timestamp: number): string {
  const diff = Math.max(0, Date.now() - timestamp);
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractMessageText(m: any): string {
  if (!m) return '';
  if (typeof m.content === 'string' && m.content.trim()) return m.content;
  if (m.parts && Array.isArray(m.parts)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const textPart = m.parts.find((p: any) => p.type === 'text' && p.text);
    if (textPart && typeof textPart.text === 'string') return textPart.text;
  }
  return '';
}

export default function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [isConfirmClearHistoryOpen, setIsConfirmClearHistoryOpen] = useState(false);

  // Chat sessions & active session ID
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Load sessions from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSessions(parsed);
        }
      }
    } catch (err) {
      console.error('[AI Assistant] Error loading saved chat sessions:', err);
    }
  }, []);

  const saveSessionsToStorage = (updatedSessions: ChatSession[]) => {
    setSessions(updatedSessions);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
    } catch (err) {
      console.error('[AI Assistant] Error saving chat sessions to localStorage:', err);
    }
  };

  const transport = React.useMemo(() => {
    return new DefaultChatTransport({
      api: '/api/ai/chat',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fetch: async (url: any, options: any) => {
        try {
          const fullUrl = url.startsWith('http')
            ? url
            : typeof window !== 'undefined'
            ? `${window.location.origin}${url.startsWith('/') ? url : `/${url}`}`
            : url;

          const headers = new Headers(options.headers || {});

          if (typeof window !== 'undefined') {
            const currency = localStorage.getItem('orbit_currency') || 'INR';
            headers.set('X-Currency', currency);

            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
            const {
              data: { session },
            } = await supabase.auth.getSession();

            if (session?.access_token) {
              headers.set('Authorization', `Bearer ${session.access_token}`);
            }
          }

          const response = await fetch(fullUrl, {
            method: options.method,
            body: options.body,
            headers: headers,
          });

          if (!response.ok) {
            const clonedRes = response.clone();
            const text = await clonedRes.text().catch(() => '');
            console.error('[AI Assistant] Chat request failed:', response.status, text);
          }

          return response;
        } catch (err: any) {
          console.error('[AI Assistant] Connection error:', err);
          throw err;
        }
      },
    });
  }, []);

  const {
    messages,
    sendMessage,
    status,
    error,
    setMessages,
    stop,
    clearError,
  } = useChat({
    transport,
    onError: (err) => {
      let msg = err?.message || 'An unexpected error occurred.';
      if (msg.startsWith('<!DOCTYPE html>')) {
        msg = 'Server returned HTML (likely a 404/500 error). Check API route.';
      }
      console.error('[AI Assistant Error]:', msg);
    },
  });

  useEffect(() => {
    if (error) {
      console.error('[DEBUG] useChat error state updated:', error);
    }
  }, [error]);

  // Sync messages into the active chat session in localStorage
  useEffect(() => {
    if (!messages || messages.length === 0) return;

    // Determine initial title from first user message
    const firstUserMsg = messages.find((m) => m.role === 'user');
    const firstText = firstUserMsg ? extractMessageText(firstUserMsg) : '';
    const sessionTitle =
      firstText.length > 40
        ? `${firstText.slice(0, 40)}...`
        : firstText || 'New Conversation';

    if (!currentSessionId) {
      // Create new session
      const newSessionId =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `session_${Date.now()}`;

      const newSession: ChatSession = {
        id: newSessionId,
        title: sessionTitle,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: messages,
      };

      setCurrentSessionId(newSessionId);
      const updated = [newSession, ...sessions.filter((s) => s.id !== newSessionId)];
      saveSessionsToStorage(updated);
    } else {
      // Update existing session
      const existingIdx = sessions.findIndex((s) => s.id === currentSessionId);
      let updated: ChatSession[];

      if (existingIdx !== -1) {
        const existing = sessions[existingIdx];
        const updatedSession: ChatSession = {
          ...existing,
          title: existing.title === 'New Conversation' ? sessionTitle : existing.title,
          updatedAt: Date.now(),
          messages: messages,
        };
        updated = [
          updatedSession,
          ...sessions.filter((s) => s.id !== currentSessionId),
        ];
      } else {
        const newSession: ChatSession = {
          id: currentSessionId,
          title: sessionTitle,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: messages,
        };
        updated = [newSession, ...sessions];
      }
      saveSessionsToStorage(updated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // Handle outside click for the menu dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const isLoading = status === 'submitted' || status === 'streaming';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, status]);

  const handleStartNewChat = () => {
    if (isLoading) {
      stop();
    }
    setCurrentSessionId(null);
    setMessages([]);
    setInput('');
    clearError?.();
    setIsMenuOpen(false);
    setIsHistoryOpen(false);
    setIsConfirmClearOpen(false);
    toast.success('Started a new conversation');
  };

  const handlePromptClearChat = () => {
    setIsMenuOpen(false);
    if (messages.length === 0) {
      toast.info('Chat is already empty');
      return;
    }
    setIsConfirmClearOpen(true);
  };

  const handleConfirmClear = () => {
    if (isLoading) {
      stop();
    }
    if (currentSessionId) {
      // Remove or empty current session from history list
      const updated = sessions.filter((s) => s.id !== currentSessionId);
      saveSessionsToStorage(updated);
    }
    setCurrentSessionId(null);
    setMessages([]);
    setInput('');
    clearError?.();
    setIsConfirmClearOpen(false);
    toast.success('Chat history cleared');
  };

  const handleSelectSession = (session: ChatSession) => {
    if (isLoading) {
      stop();
    }
    setCurrentSessionId(session.id);
    setMessages(session.messages || []);
    setInput('');
    clearError?.();
    setIsHistoryOpen(false);
    toast.success(`Loaded chat: ${session.title}`);
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter((s) => s.id !== sessionId);
    saveSessionsToStorage(updated);

    if (currentSessionId === sessionId) {
      setMessages([]);
      setCurrentSessionId(null);
    }
    toast.success('Conversation removed from history');
  };

  const handleConfirmClearAllHistory = () => {
    if (isLoading) {
      stop();
    }
    saveSessionsToStorage([]);
    setCurrentSessionId(null);
    setMessages([]);
    setInput('');
    clearError?.();
    setIsConfirmClearHistoryOpen(false);
    setIsHistoryOpen(false);
    toast.success('All chat history cleared');
  };

  const handleCopyChat = async () => {
    setIsMenuOpen(false);
    if (messages.length === 0) {
      toast.info('No messages to copy');
      return;
    }

    try {
      const transcript = messages
        .map((m) => {
          const role = m.role === 'user' ? 'You' : 'ClixPro AI';
          const content = extractMessageText(m);
          return `${role}:\n${content}\n`;
        })
        .join('\n---\n\n');

      await navigator.clipboard.writeText(transcript);
      toast.success('Conversation copied to clipboard');
    } catch {
      toast.error('Failed to copy chat transcript');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) {
      return;
    }

    try {
      if (sendMessage) {
        sendMessage({ text: input });
      }
    } catch (err) {
      console.error('[DEBUG] Error inside sendMessage:', err);
    }
    setInput('');
  };

  const handleQuickAction = (prompt: string) => {
    if (sendMessage) {
      sendMessage({ text: prompt });
    }
  };

  const filteredSessions = sessions.filter((s) => {
    if (!historySearchQuery.trim()) return true;
    const query = historySearchQuery.toLowerCase();
    const titleMatch = s.title.toLowerCase().includes(query);
    const messagesMatch = s.messages.some((m) =>
      extractMessageText(m).toLowerCase().includes(query)
    );
    return titleMatch || messagesMatch;
  });

  const displayMessages = [...messages];
  if (error) {
    let errorMessage = error.message;
    try {
      const parsed = JSON.parse(error.message);
      if (parsed.message) errorMessage = parsed.message;
      if (parsed.error && parsed.error.message) errorMessage = parsed.error.message;
    } catch {}

    displayMessages.push({
      id: 'error-msg',
      role: 'system',
      parts: [
        {
          type: 'text',
          text: `Error: ${
            errorMessage || 'An unexpected error occurred connecting to the AI platform.'
          }`,
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  }

  return (
    <div
      className={`fixed z-50 transition-base ${
        isOpen
          ? isExpanded
            ? 'inset-4 md:inset-10'
            : 'bottom-6 right-6 w-[420px] h-[700px]'
          : 'bottom-6 right-6'
      }`}
    >
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-card text-card-foreground shadow-premium rounded-2xl w-full h-full flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300 relative border border-border/60">
          {/* Enterprise Header */}
          <div className="bg-card border-b border-border p-3 flex justify-between items-center relative z-20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-premium rounded-lg flex items-center justify-center shadow-sm">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground leading-tight font-display">
                  ClixPro AI
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-success relative">
                    <span className="absolute inset-0 rounded-full bg-success animate-ping opacity-75"></span>
                  </span>
                  Workspace Agent
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-muted-foreground">
              {/* History Button */}
              <button
                onClick={() => {
                  setIsHistoryOpen(!isHistoryOpen);
                  setIsMenuOpen(false);
                }}
                className={`p-1.5 rounded-md transition-colors relative ${
                  isHistoryOpen
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
                title="Chat History"
                aria-label="View chat history"
              >
                <History className="w-4 h-4" />
                {sessions.length > 0 && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>

              {/* Quick New Chat Button in Header */}
              <button
                onClick={handleStartNewChat}
                className="hover:bg-muted p-1.5 rounded-md transition-colors text-muted-foreground hover:text-foreground"
                title="New Chat"
                aria-label="Start a new chat"
              >
                <SquarePen className="w-4 h-4" />
              </button>

              {/* Expand / Minimize */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hover:bg-muted p-1.5 rounded-md transition-colors"
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* More Actions Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`p-1.5 rounded-md transition-colors ${
                    isMenuOpen ? 'bg-muted text-foreground' : 'hover:bg-muted'
                  }`}
                  title="More actions"
                  aria-expanded={isMenuOpen}
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* Dropdown Options */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-card border border-border rounded-xl shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                    <button
                      onClick={handleStartNewChat}
                      className="w-full px-3 py-2 text-xs font-medium text-foreground hover:bg-muted flex items-center gap-2.5 transition-colors"
                    >
                      <SquarePen className="w-4 h-4 text-primary" />
                      <span>New Chat</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsHistoryOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-xs font-medium text-foreground hover:bg-muted flex items-center justify-between gap-2.5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <History className="w-4 h-4 text-muted-foreground" />
                        <span>Chat History</span>
                      </div>
                      {sessions.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted font-bold text-muted-foreground">
                          {sessions.length}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={handleCopyChat}
                      disabled={messages.length === 0}
                      className="w-full px-3 py-2 text-xs font-medium text-foreground hover:bg-muted flex items-center gap-2.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Copy className="w-4 h-4 text-muted-foreground" />
                      <span>Copy Chat</span>
                    </button>

                    <div className="h-px bg-border my-1" />

                    <button
                      onClick={handlePromptClearChat}
                      disabled={messages.length === 0}
                      className="w-full px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 flex items-center gap-2.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Clear Chat</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-muted p-1.5 rounded-md transition-colors ml-1"
                title="Close AI"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat History Slide-Over Panel */}
          {isHistoryOpen && (
            <div className="absolute inset-0 bg-background z-30 flex flex-col animate-in slide-in-from-left duration-200">
              {/* History Header */}
              <div className="p-3 border-b border-border flex items-center justify-between bg-card">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsHistoryOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Back to chat"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-primary" />
                    <h4 className="font-semibold text-sm text-foreground font-display">
                      Chat History
                    </h4>
                  </div>
                </div>
                <button
                  onClick={handleStartNewChat}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                >
                  <SquarePen className="w-3.5 h-3.5" />
                  <span>New</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-3 border-b border-border bg-card/50">
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 absolute left-3 text-muted-foreground" />
                  <input
                    type="text"
                    value={historySearchQuery}
                    onChange={(e) => setHistorySearchQuery(e.target.value)}
                    placeholder="Search past conversations..."
                    className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-all"
                  />
                  {historySearchQuery && (
                    <button
                      onClick={() => setHistorySearchQuery('')}
                      className="absolute right-2.5 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Session List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {filteredSessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-12 text-center text-muted-foreground">
                    <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center mb-3">
                      <Clock className="w-6 h-6 opacity-60" />
                    </div>
                    <p className="text-xs font-medium text-foreground">
                      {historySearchQuery ? 'No matching chats found' : 'No chat history yet'}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1 max-w-[200px]">
                      {historySearchQuery
                        ? 'Try a different search term.'
                        : 'Your conversations with ClixPro AI will be automatically saved here.'}
                    </p>
                  </div>
                ) : (
                  filteredSessions.map((session) => {
                    const isActive = session.id === currentSessionId;
                    const msgCount = session.messages?.length || 0;
                    return (
                      <div
                        key={session.id}
                        onClick={() => handleSelectSession(session)}
                        className={`group relative p-3 rounded-xl border cursor-pointer transition-all duration-150 ${
                          isActive
                            ? 'bg-primary/5 border-primary/40 shadow-xs'
                            : 'bg-card border-border hover:border-border/80 hover:bg-muted/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5 overflow-hidden flex-1">
                            <div
                              className={`p-1.5 rounded-lg mt-0.5 shrink-0 ${
                                isActive
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors'
                              }`}
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </div>
                            <div className="overflow-hidden flex-1">
                              <div className="flex items-center gap-2">
                                <h5 className="font-medium text-xs text-foreground truncate">
                                  {session.title}
                                </h5>
                                {isActive && (
                                  <span className="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.2 rounded-full shrink-0">
                                    Active
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                                <span>{formatRelativeTime(session.updatedAt || session.createdAt)}</span>
                                <span>•</span>
                                <span>{msgCount} messages</span>
                              </div>
                            </div>
                          </div>

                          {/* Delete Session Button */}
                          <button
                            onClick={(e) => handleDeleteSession(session.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all shrink-0"
                            title="Delete conversation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* History Footer Actions */}
              {sessions.length > 0 && (
                <div className="p-3 border-t border-border bg-card flex justify-between items-center">
                  <span className="text-xs text-muted-foreground font-medium">
                    {sessions.length} saved {sessions.length === 1 ? 'chat' : 'chats'}
                  </span>
                  <button
                    onClick={() => setIsConfirmClearHistoryOpen(true)}
                    className="text-xs font-medium text-destructive hover:text-destructive/80 flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All History</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Clear Current Chat Confirmation Modal */}
          {isConfirmClearOpen && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-xs z-40 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-card border border-border rounded-2xl p-5 shadow-2xl max-w-xs w-full text-center animate-in zoom-in-95 duration-200">
                <div className="w-10 h-10 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-sm text-foreground mb-1 font-display">
                  Clear chat history?
                </h4>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                  This will delete all current conversation messages. This action cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsConfirmClearOpen(false)}
                    className="flex-1 py-2 px-3 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmClear}
                    className="flex-1 py-2 px-3 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-semibold shadow-sm transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Clear All History Confirmation Modal */}
          {isConfirmClearHistoryOpen && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-xs z-40 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-card border border-border rounded-2xl p-5 shadow-2xl max-w-xs w-full text-center animate-in zoom-in-95 duration-200">
                <div className="w-10 h-10 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-3">
                  <Trash2 className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-sm text-foreground mb-1 font-display">
                  Delete all chat history?
                </h4>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                  This will permanently delete all {sessions.length} saved conversations.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsConfirmClearHistoryOpen(false)}
                    className="flex-1 py-2 px-3 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmClearAllHistory}
                    className="flex-1 py-2 px-3 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-semibold shadow-sm transition-colors"
                  >
                    Delete All
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto bg-background/50">
            {displayMessages.length === 0 ? (
              <WelcomeScreen onActionClick={handleQuickAction} />
            ) : (
              <div className="p-4">
                {displayMessages.map((m) => (
                  <MessageCard key={m.id} message={m} />
                ))}

                {isLoading && status !== 'streaming' && (
                  <div className="flex justify-start mb-4">
                    <div className="crm-card p-3 rounded-tl-none flex items-center gap-1.5 w-auto">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce"></span>
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce"
                        style={{ animationDelay: '0.15s' }}
                      ></span>
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce"
                        style={{ animationDelay: '0.3s' }}
                      ></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-card border-t border-border">
            <form
              onSubmit={handleSubmit}
              className="relative flex items-end gap-2 bg-background border border-border rounded-xl p-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all"
            >
              <button
                type="button"
                className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted mb-0.5"
                title="Attach file"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <textarea
                className="w-full bg-transparent border-none focus:outline-none resize-none max-h-32 min-h-[40px] py-2 text-sm text-foreground placeholder-muted-foreground"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    handleSubmit(e as any);
                  }
                }}
                placeholder="Ask ClixPro AI... (Type '/' for commands)"
                disabled={isLoading}
                rows={1}
              />

              <button
                type="submit"
                disabled={isLoading || !input?.trim()}
                className={`p-2 rounded-lg mb-0.5 transition-all ${
                  input?.trim() && !isLoading
                    ? 'bg-primary text-primary-foreground hover:brightness-110 shadow-sm'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="text-center mt-3 flex items-center justify-center gap-2">
              <span className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">
                AI Powered by ClixPro CRM
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center justify-center w-14 h-14 bg-gradient-premium text-primary-foreground rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
          <Bot className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
      )}
    </div>
  );
}
