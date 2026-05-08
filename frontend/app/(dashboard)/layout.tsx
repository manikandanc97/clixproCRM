import Sidebar from "@/components/dashboard/sidebar";
import Topbar from "@/components/dashboard/topbar";
import ProtectedRoute from "@/components/auth/protected-route";
import { SidebarProvider } from "@/components/dashboard/SidebarContext";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { TooltipProvider } from "@/components/ui/tooltip";

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
