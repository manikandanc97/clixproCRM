import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LeadType } from '@/types/lead';
import { TaskType } from '@/types/task';
import { CustomerType } from '@/types/customer';
import { PipelineLeadType as DealType } from '@/types/pipeline';
import { QuotationType } from '@/types/quotation';

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

  // Actions
  setLeads: (leads: LeadType[]) => void;
  updateLead: (id: string, updates: Partial<LeadType>) => void;
  deleteLead: (id: string) => void;
  
  setTasks: (tasks: TaskType[]) => void;
  updateTask: (id: string, updates: Partial<TaskType>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;

  setPipelineItems: (items: DealType[]) => void;
  updatePipelineItem: (id: string, updates: Partial<DealType>) => void;
  movePipelineItem: (dealId: string, newStatus: string) => void;
  deletePipelineItem: (id: string) => void;

  setCustomers: (customers: CustomerType[]) => void;
  deleteCustomer: (id: string) => void;

  setQuotations: (quotations: QuotationType[]) => void;
  updateQuotation: (id: string, updates: Partial<QuotationType>) => void;
  deleteQuotation: (id: string) => void;
  
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveTimeframe: (timeframe: 'today' | 'week' | 'month' | 'year') => void;
  
  setAccentColor: (color: string) => void;
  setFontFamily: (font: string) => void;

  addNotification: (notification: Notification) => void;
  clearNotifications: () => void;
  markNotificationAsRead: (id: string) => void;
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
      notifications: [
        {
          id: '1',
          title: 'New Lead Assigned',
          description: 'Sarah Johnson has been assigned to you.',
          type: 'info',
          timestamp: new Date().toISOString(),
          read: false,
        },
        {
          id: '2',
          title: 'Deal Won',
          description: 'Acme Corp deal has been closed successfully.',
          type: 'success',
          timestamp: new Date().toISOString(),
          read: false,
        }
      ],
      sidebarCollapsed: false,
      activeTimeframe: 'month',
      accentColor: 'emerald',
      fontFamily: 'sans',

      setLeads: (leads) => set({ leads }),
      updateLead: (id, updates) => set((state) => ({
        leads: state.leads.map((l) => (l.id === id ? { ...l, ...updates } : l))
      })),
      deleteLead: (id) => set((state) => ({
        leads: state.leads.filter((l) => l.id !== id)
      })),

      setTasks: (tasks) => set({ tasks }),
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t))
      })),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id)
      })),
      toggleTaskCompletion: (id) => set((state) => ({
        tasks: state.tasks.map((t) => (
          t.id === id
            ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' }
            : t
        ))
      })),

      setPipelineItems: (pipelineItems) => set({ pipelineItems }),
      updatePipelineItem: (id, updates) => set((state) => ({
        pipelineItems: state.pipelineItems.map((d) => (d.id === id ? { ...d, ...updates } : d))
      })),
      movePipelineItem: (dealId, newStatus) => set((state) => ({
        pipelineItems: state.pipelineItems.map((d) => (d.id === dealId ? { ...d, stage: newStatus as any } : d))
      })),
      deletePipelineItem: (id) => set((state) => ({
        pipelineItems: state.pipelineItems.filter((d) => d.id !== id)
      })),

      setCustomers: (customers) => set({ customers }),
      deleteCustomer: (id) => set((state) => ({
        customers: state.customers.filter((c) => c.id !== id)
      })),

      setQuotations: (quotations) => set({ quotations }),
      updateQuotation: (id, updates) => set((state) => ({
        quotations: state.quotations.map((q) => (q.id === id ? { ...q, ...updates } : q))
      })),
      deleteQuotation: (id) => set((state) => ({
        quotations: state.quotations.filter((q) => q.id !== id)
      })),

      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setActiveTimeframe: (timeframe) => set({ activeTimeframe: timeframe }),
      
      setAccentColor: (accentColor) => set({ accentColor }),
      setFontFamily: (fontFamily) => set({ fontFamily }),

      addNotification: (n) => set((state) => ({ notifications: [n, ...state.notifications] })),
      clearNotifications: () => set({ notifications: [] }),
      markNotificationAsRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) => n.id === id ? { ...n, read: true } : n)
      })),
    }),
    {
      name: 'crm-storage',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        // Wipe any pre-v2 state that may have stored entities as objects instead of arrays
        if (version < 2) {
          return {
            sidebarCollapsed: persistedState?.sidebarCollapsed ?? false,
            activeTimeframe: persistedState?.activeTimeframe ?? 'month',
            accentColor: persistedState?.accentColor ?? 'emerald',
            fontFamily: persistedState?.fontFamily ?? 'sans',
            leads: [],
            tasks: [],
            pipelineItems: [],
            customers: [],
            quotations: [],
          };
        }
        // Ensure all entity fields are arrays even if somehow corrupted
        return {
          ...persistedState,
          leads: Array.isArray(persistedState?.leads) ? persistedState.leads : [],
          tasks: Array.isArray(persistedState?.tasks) ? persistedState.tasks : [],
          pipelineItems: Array.isArray(persistedState?.pipelineItems) ? persistedState.pipelineItems : [],
          customers: Array.isArray(persistedState?.customers) ? persistedState.customers : [],
          quotations: Array.isArray(persistedState?.quotations) ? persistedState.quotations : [],
        };
      },
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        activeTimeframe: state.activeTimeframe,
        accentColor: state.accentColor,
        fontFamily: state.fontFamily,
        leads: state.leads,
        tasks: state.tasks,
        pipelineItems: state.pipelineItems,
        customers: state.customers,
        quotations: state.quotations,
      }),
    }
  )
);
