import SuperAdminRoute from "@/features/auth/components/super-admin-route";
import { SuperAdminSidebar } from "./components/super-admin-sidebar";
import { SuperAdminHeader } from "./components/super-admin-header";
import { TooltipProvider } from "@/shared/ui/tooltip";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SuperAdminRoute>
      <TooltipProvider>
        <div className="flex h-screen w-full overflow-hidden bg-background text-foreground relative">
          {/* Subtle Surface Background */}
          <div className="absolute inset-0 bg-[#fafafa] dark:bg-[#050505] -z-10" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />

          {/* Super Admin Sidebar */}
          <SuperAdminSidebar />

          {/* Main Content Area */}
          <div className="flex flex-1 flex-col overflow-hidden min-w-0 h-full w-full">
            <SuperAdminHeader />
            <main className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 kanban-board-scroll">
              <div className="w-full h-full">
                {children}
              </div>
            </main>
          </div>
        </div>
      </TooltipProvider>
    </SuperAdminRoute>
  );
}
