"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { HelpCircle, Grid3X3, Command, Search, Menu } from "lucide-react";
import { useAuth } from "@/features/auth/components/auth-provider";
import ProfileMenu from "./ProfileMenu";
import NotificationPanel from "./NotificationPanel";
import CreateNewMenu from "./CreateNewMenu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/shared/ui/sheet";
import { SidebarContent } from "./sidebar";
import { Button } from "@/shared/ui/button";

function getInitials(name?: string) {
  if (!name) return "CR";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default function Topbar() {
  const { user } = useAuth();
  const initials = getInitials(user?.name);
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 flex justify-between items-center bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur-md px-4 sm:px-8 border-b border-border h-[72px] transition-all shadow-[0_1px_2px_0_rgba(0,0,0,0.02)] gap-4">
      {/* Mobile Sidebar Trigger & Search */}
      <div className="flex flex-1 items-center gap-4 max-w-full md:max-w-[450px]">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden shrink-0 w-10 h-10 rounded-full">
              <Menu className="w-5 h-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[270px] bg-sidebar border-sidebar-border [&>button]:hidden">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SidebarContent isMobile={true} />
          </SheetContent>
        </Sheet>

        {/* Search / Command Palette Trigger */}
        <button 
          onClick={() => {
            const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true });
            document.dispatchEvent(event);
          }}
          className="w-full flex flex-1 items-center justify-between bg-muted/30 hover:bg-muted/50 border border-border/50 hover:border-border px-4 h-[46px] rounded-xl transition-all duration-200 group shadow-[0_1px_2px_rgba(0,0,0,0.03)] outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
        >
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" strokeWidth={1.5} />
            <span className="text-muted-foreground text-[15px] font-medium tracking-tight hidden sm:inline truncate">Search leads, customers...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-muted-foreground bg-background/50 rounded-md shadow-sm border border-border/50 backdrop-blur-sm">
            <Command className="w-3 h-3" /> K
          </kbd>
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-5">
        <CreateNewMenu />

        <div className="flex items-center gap-4">
          <NotificationPanel />

          <button className="hidden sm:flex items-center justify-center w-10 h-10 hover:bg-muted rounded-full transition-all duration-200 group outline-none focus-visible:ring-1 focus-visible:ring-primary">
            <HelpCircle className="w-5 h-5 text-muted-foreground transition-colors group-hover:text-foreground" strokeWidth={1.5} />
          </button>

          <button className="hidden sm:flex items-center justify-center w-10 h-10 hover:bg-muted rounded-full transition-all duration-200 group outline-none focus-visible:ring-1 focus-visible:ring-primary">
            <Grid3X3 className="w-5 h-5 text-muted-foreground transition-colors group-hover:text-foreground" strokeWidth={1.5} />
          </button>
        </div>

        <ProfileMenu user={user} initials={initials} />
      </div>
    </header>
  );
}
