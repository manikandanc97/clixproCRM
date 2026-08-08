'use client';

import { useChat } from '@ai-sdk/react';
import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, ChevronDown, Paperclip, Minimize2, Maximize2, MoreVertical } from 'lucide-react';
import { WelcomeScreen } from './welcome-screen';
import { MessageCard } from './message-card';

export default function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, stop, error } = useChat({
    api: '/api/ai/chat',
    body: {
      tenantId: 'dev-tenant-1',
      userId: 'dev-user-1',
    },
    fetch: async (url, options) => {
      console.log("[DEBUG] useChat fetching URL:", url);
      console.log("[DEBUG] useChat options:", options);
      const res = await fetch(url, options);
      console.log("[DEBUG] useChat response status:", res.status, res.statusText);
      const clone = res.clone();
      const text = await clone.text();
      console.log("[DEBUG] useChat response text length:", text.length, "starts with:", text.substring(0, 100));
      return res;
    },
    onError: (err) => {
      let msg = err.message;
      if (msg.startsWith('<!DOCTYPE html>')) msg = 'Server returned HTML (likely a 404/500 error). Check API route.';
      console.error("[DEBUG] useChat onError called:", msg);
    }
  });

  useEffect(() => {
    if (error) {
      console.error("[DEBUG] useChat error state updated:", error);
    }
  }, [error]);

  const isLoading = status === 'submitted' || status === 'streaming';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("[DEBUG] Submit clicked", { input, isLoading });
    e.preventDefault();
    if (!input.trim() || isLoading) {
      console.log("[DEBUG] Submit aborted: empty or loading");
      return;
    }

    console.log("[DEBUG] Calling sendMessage with", { text: input });
    try {
      sendMessage({ text: input });
      console.log("[DEBUG] sendMessage returned");
    } catch (err) {
      console.error("[DEBUG] Error inside sendMessage:", err);
    }
    setInput('');
  };

  const handleQuickAction = (prompt: string) => {
    sendMessage({ text: prompt });
  };


  const displayMessages = [...messages];
  if (error) {
    let errorMessage = error.message;
    try {
      const parsed = JSON.parse(error.message);
      if (parsed.message) errorMessage = parsed.message;
      if (parsed.error && parsed.error.message) errorMessage = parsed.error.message;
    } catch(e) {}
    
    displayMessages.push({
      id: 'error-msg',
      role: 'system',
      parts: [{ type: 'text', text: `Error: ${errorMessage || 'An unexpected error occurred connecting to the AI platform.'}` }]
    } as any);
  }

  return (
    <div className={`fixed z-50 transition-base ${isOpen ? (isExpanded ? 'inset-4 md:inset-10' : 'bottom-6 right-6 w-[420px] h-[700px]') : 'bottom-6 right-6'}`}>
      
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-card text-card-foreground shadow-premium rounded-2xl w-full h-full flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          {/* Enterprise Header */}
          <div className="bg-card border-b border-border p-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-premium rounded-lg flex items-center justify-center shadow-sm">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground leading-tight font-display">ClixPro AI</h3>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-success relative">
                    <span className="absolute inset-0 rounded-full bg-success animate-ping opacity-75"></span>
                  </span>
                  Workspace Agent
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <button onClick={() => setIsExpanded(!isExpanded)} className="hover:bg-muted p-1.5 rounded-md transition-colors" title={isExpanded ? "Collapse" : "Expand"}>
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button className="hover:bg-muted p-1.5 rounded-md transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
              <button onClick={() => setIsOpen(false)} className="hover:bg-muted p-1.5 rounded-md transition-colors ml-1" title="Close AI">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto bg-background/50">
            {displayMessages.length === 0 ? (
              <WelcomeScreen onActionClick={handleQuickAction} />
            ) : (
              <div className="p-4">
                {displayMessages.map(m => (
                  <MessageCard key={m.id} message={m} />
                ))}
                
                {isLoading && status !== 'streaming' && (
                  <div className="flex justify-start mb-4">
                    <div className="crm-card p-3 rounded-tl-none flex items-center gap-1.5 w-auto">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-card border-t border-border">
            <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-background border border-border rounded-xl p-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <button type="button" className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted mb-0.5" title="Attach file">
                <Paperclip className="w-5 h-5" />
              </button>
              
              <textarea
                className="w-full bg-transparent border-none focus:outline-none resize-none max-h-32 min-h-[40px] py-2 text-sm text-foreground placeholder-muted-foreground"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
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
              <span className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">Enterprise AI Powered by ClixPro CRM</span>
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
