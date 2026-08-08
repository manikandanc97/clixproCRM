import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, Zap, AlertCircle } from 'lucide-react';
import { UIMessage } from '@ai-sdk/react';

interface MessageCardProps {
  message: UIMessage & { id: string; toolInvocations?: any[] };
}

export function MessageCard({ message }: MessageCardProps) {
  const isUser = message.role === 'user';
  
  // Extract text from parts or fallback to content string
  const content = (message as any).content || (message.parts?.find(p => p.type === 'text') as any)?.text || '';
  const isError = message.role === 'system' && content.includes('Error:');

  if (isUser) {
    return (
      <div className="flex justify-end mb-4 group">
        <div className="max-w-[85%] bg-primary text-primary-foreground rounded-2xl rounded-tr-sm p-4 shadow-sm">
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-6 group">
      <div className="flex gap-3 max-w-[90%]">
        <div className="flex-shrink-0 mt-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isError ? 'bg-destructive/10 text-destructive' : 'bg-gradient-premium text-primary-foreground'} shadow-sm`}>
            {isError ? <AlertCircle className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
          </div>
        </div>
        
        <div className={`flex flex-col gap-2 ${isError ? 'w-full' : ''}`}>
          <div className={`crm-card rounded-2xl rounded-tl-sm p-4 text-sm leading-relaxed overflow-hidden ${isError ? 'border-destructive/30 bg-destructive/5 text-destructive' : ''}`}>
            
            {/* Tool Invocations Rendering */}
            {message.toolInvocations?.map((tool, idx) => (
              <div key={idx} className="mb-3 p-3 bg-muted/40 border border-border rounded-xl text-xs flex flex-col gap-2">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Zap className="w-3.5 h-3.5 text-warning animate-pulse" />
                  {tool.toolName.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                {'result' in tool ? (
                  <div className="text-success font-medium ml-5">
                    ✓ Task completed
                  </div>
                ) : (
                  <div className="text-primary font-medium ml-5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    Working...
                  </div>
                )}
              </div>
            ))}

            {isError ? (
              <div className="font-medium text-destructive">{content}</div>
            ) : (
              <div className="prose prose-slate dark:prose-invert max-w-none prose-sm prose-p:leading-relaxed prose-pre:bg-muted prose-pre:border prose-pre:border-border">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
