import ProtectedRoute from "@/features/auth/components/protected-route";
import { SidebarProvider } from "@/features/dashboard/components/SidebarContext";
import DashboardShell from "@/features/dashboard/components/DashboardShell";
import { TooltipProvider } from "@/shared/ui/tooltip";

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
        </SidebarProvider>
      </TooltipProvider>
    </ProtectedRoute>
  );
}











