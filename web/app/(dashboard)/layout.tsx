import ProtectedRoute from "@/features/auth/components/protected-route";
import { SidebarProvider } from "@/features/dashboard/components/SidebarContext";
import DashboardShell from "@/features/dashboard/components/DashboardShell";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { GlobalModalManager } from "@/shared/components/GlobalModalManager";
import FloatingAssistantWrapper from "@/components/ai/floating-assistant-wrapper";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <TooltipProvider>
        <SidebarProvider>
          <DashboardShell>
            {children}
          </DashboardShell>
          <GlobalModalManager />
          <FloatingAssistantWrapper />
        </SidebarProvider>
      </TooltipProvider>
    </ProtectedRoute>
  );
}











