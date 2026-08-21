'use client';

import React, { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { useAuth } from '@/features/auth/components/auth-provider';
import {
  getAuthorizedQuickActions,
  getCapabilityIcon,
} from '@/shared/lib/ai/ai-capabilities';

interface WelcomeScreenProps {
  onActionClick: (action: string) => void;
  permissions?: string[];
  role?: string;
}

export function WelcomeScreen({ onActionClick, permissions, role }: WelcomeScreenProps) {
  const auth = useAuth();
  
  const effectivePermissions = permissions || auth?.access?.permissions || auth?.user?.permissions;
  const effectiveRole = role || auth?.user?.role;

  const quickActions = useMemo(() => {
    return getAuthorizedQuickActions(effectivePermissions, effectiveRole);
  }, [effectivePermissions, effectiveRole]);

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

      {quickActions.length > 0 ? (
        <div className="w-full">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 text-left pl-1">
            Quick Actions
          </p>
          <div className="grid grid-cols-1 gap-2">
            {quickActions.map((action) => {
              const IconComponent = getCapabilityIcon(action.iconName);
              return (
                <button
                  key={action.id}
                  onClick={() => onActionClick(action.prompt)}
                  className="flex items-center gap-3 w-full p-3 text-sm text-left crm-card hover:border-primary/40 hover:bg-primary/5 transition-all shadow-sm group"
                >
                  <div className="text-primary group-hover:scale-110 transition-transform">
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-foreground">
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="w-full mt-2">
          <p className="text-sm text-muted-foreground">
            What would you like to check?
          </p>
        </div>
      )}
    </div>
  );
}

