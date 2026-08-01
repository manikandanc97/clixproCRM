import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LeadType } from '@/shared/types/lead';
import { TaskType } from '@/shared/types/task';
import { CustomerType } from '@/shared/types/customer';
import { PipelineLeadType as DealType } from '@/shared/types/pipeline';
import { QuotationType } from '@/shared/types/quotation';

interface CRMState {
  // Entities
  leads: LeadType[];
  customers: CustomerType[];
  tasks: TaskType[];
  pipelineItems: DealType[];
  quotations: QuotationType[];
  notifications: Notification[];

  // UI State
  sidebarCollapsed: boolean;
  activeTimeframe: 'today' | 'week' | 'month' | 'year';
  
  // Preferences (Moved from Context for unified management)
  accentColor: string;
  fontFamily: string;
  currency: string;

  // Actions
  setLeads: (leads: LeadType[]) => void;
  updateLead: (id: string, updates: Partial<LeadType>) => void;
  
  setTasks: (tasks: TaskType[]) => void;

  setPipelineItems: (items: DealType[]) => void;
  movePipelineItem: (dealId: string, newStatus: DealType['stage']) => void;

  setCustomers: (customers: CustomerType[]) => void;

  setQuotations: (quotations: QuotationType[]) => void;
  
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveTimeframe: (timeframe: 'today' | 'week' | 'month' | 'year') => void;
  
  setAccentColor: (color: string) => void;
  setFontFamily: (font: string) => void;
  setCurrency: (currency: string) => void;

  addNotification: (notification: Notification) => void;
  clearNotifications: () => void;
  markNotificationAsRead: (id: string) => void;
  reset: () => void;
}

interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

export const useCRMStore = create<CRMState>()(
  persist(
    (set) => ({
      leads: [],
      customers: [],
      tasks: [],
      pipelineItems: [],
      quotations: [],
      notifications: [],
      sidebarCollapsed: false,
      activeTimeframe: 'month',
      accentColor: 'emerald',
      fontFamily: 'sans',
      currency: 'USD',

      setLeads: (leads) => set({ leads }),
      updateLead: (id, updates) => set((state) => ({
        leads: state.leads.map(lead => lead.id === id ? { ...lead, ...updates } : lead)
      })),

      setTasks: (tasks) => set({ tasks }),

      setPipelineItems: (pipelineItems) => set({ pipelineItems }),
      movePipelineItem: (dealId, newStatus) => set((state) => ({
        pipelineItems: state.pipelineItems.map((d) => (d.id === dealId ? { ...d, stage: newStatus } : d))
      })),

      setCustomers: (customers) => set({ customers }),

      setQuotations: (quotations) => set({ quotations }),

      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setActiveTimeframe: (timeframe) => set({ activeTimeframe: timeframe }),
      
      setAccentColor: (accentColor) => set({ accentColor }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setCurrency: (currency) => set({ currency }),

      addNotification: (n) => set((state) => ({ notifications: [n, ...state.notifications] })),
      clearNotifications: () => set({ notifications: [] }),
      markNotificationAsRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) => n.id === id ? { ...n, read: true } : n)
      })),
      reset: () => set({
        leads: [],
        customers: [],
        tasks: [],
        pipelineItems: [],
        quotations: [],
        notifications: [],
      }),
    }),
    {
      name: 'crm-storage',
      version: 3,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Partial<CRMState> | undefined;
        
        // Clean up entities from older versions to prevent stale data
        if (version < 3) {
          return {
            sidebarCollapsed: state?.sidebarCollapsed ?? false,
            activeTimeframe: state?.activeTimeframe ?? 'month',
            accentColor: state?.accentColor ?? 'emerald',
            fontFamily: state?.fontFamily ?? 'sans',
            currency: state?.currency ?? 'USD',
          };
        }
        
        return state as Partial<CRMState>;
      },
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        activeTimeframe: state.activeTimeframe,
        accentColor: state.accentColor,
        fontFamily: state.fontFamily,
        currency: state.currency,
      }),
    }
  )
);











