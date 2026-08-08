import { Sparkles, TrendingUp, Users, Calendar, Briefcase, FileText } from 'lucide-react';

interface WelcomeScreenProps {
  onActionClick: (action: string) => void;
}

export function WelcomeScreen({ onActionClick }: WelcomeScreenProps) {
  const quickActions = [
    { icon: <TrendingUp className="w-4 h-4" />, label: 'Revenue this month', prompt: 'Show me the revenue generated this month.' },
    { icon: <Users className="w-4 h-4" />, label: 'Hot leads', prompt: 'Show me all the hot leads that need follow-up.' },
    { icon: <Briefcase className="w-4 h-4" />, label: 'Pending quotations', prompt: 'List all pending quotations.' },
    { icon: <Calendar className="w-4 h-4" />, label: 'Upcoming tasks', prompt: 'What are my upcoming tasks for today?' },
    { icon: <FileText className="w-4 h-4" />, label: 'Generate quotation', prompt: 'Generate a new quotation for a client.' },
  ];

  return (
    <div className="flex flex-col h-full items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-primary/10 p-4 rounded-2xl mb-4">
        <Sparkles className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2 font-display">
        Welcome to ClixPro AI
      </h2>
      <p className="text-sm text-muted-foreground mb-8 max-w-[280px]">
        Your intelligent CRM assistant. I can help you analyze data, manage leads, and generate reports.
      </p>

      <div className="w-full">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 text-left pl-1">
          Quick Actions
        </p>
        <div className="grid grid-cols-1 gap-2">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => onActionClick(action.prompt)}
              className="flex items-center gap-3 w-full p-3 text-sm text-left crm-card hover:border-primary/40 hover:bg-primary/5 transition-all shadow-sm group"
            >
              <div className="text-primary group-hover:scale-110 transition-transform">
                {action.icon}
              </div>
              <span className="font-medium text-foreground">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
