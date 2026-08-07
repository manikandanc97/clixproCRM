"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useAuth } from "@/features/auth/components/auth-provider";
import ProfileMenu from "./ProfileMenu";
import NotificationPanel from "./NotificationPanel";
import CreateNewMenu from "./CreateNewMenu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/shared/ui/sheet";
import { SidebarContent } from "./sidebar";
import { Button } from "@/shared/ui/button";
import GlobalSearch from "./GlobalSearch";
import CurrencySwitcher from "./CurrencySwitcher";

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

        <GlobalSearch />
      </div>

      {/* Right */}
      <div className="flex items-center gap-5">
        <CreateNewMenu />

        <div className="flex items-center gap-3">
          <CurrencySwitcher />
          <NotificationPanel />
        </div>

        <ProfileMenu user={user} initials={initials} />
      </div>
    </header>
  );
}
