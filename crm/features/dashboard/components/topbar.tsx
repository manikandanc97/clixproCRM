"use client";

import { HelpCircle, Grid3X3, Command, Search } from "lucide-react";
import { useAuth } from "@/features/auth/components/auth-provider";
import ProfileMenu from "./ProfileMenu";
import NotificationPanel from "./NotificationPanel";
import CreateNewMenu from "./CreateNewMenu";

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

  return (
    <header className="z-40 flex justify-between items-center topbar-blur px-6 lg:px-10 border-border border-b h-22 transition-all shadow-sm">
      {/* Search / Command Palette Trigger */}
      <div className="flex-1 max-w-md lg:max-w-lg mr-3 sm:mr-6">
        <button 
          onClick={() => {
            const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true });
            document.dispatchEvent(event);
          }}
          className="w-full flex items-center justify-between bg-muted/50 hover:bg-muted border border-transparent hover:border-border px-3 sm:px-5 h-12 rounded-xl transition-all duration-300 group shadow-sm outline-none"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <Search className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-muted-foreground text-sm font-semibold tracking-tight hidden sm:inline">Search leads, customers, tasks...</span>
            <span className="text-muted-foreground text-sm font-semibold tracking-tight sm:hidden">Search...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black text-muted-foreground bg-background rounded-lg shadow-sm border border-border">
            <Command className="w-3 h-3" /> K
          </kbd>
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4 md:gap-5">
        <CreateNewMenu />

        <div className="hidden sm:block bg-border mx-2 w-px h-8" />

        <div className="flex items-center gap-2 md:gap-3">
          <NotificationPanel />

          <button className="hidden sm:block hover:bg-muted p-3 rounded-xl transition-all group outline-none">
            <HelpCircle className="w-5 h-5 text-muted-foreground transition-colors group-hover:text-foreground" />
          </button>

          <button className="hidden sm:block hover:bg-muted p-3 rounded-xl transition-all group outline-none">
            <Grid3X3 className="w-5 h-5 text-muted-foreground transition-colors group-hover:text-foreground" />
          </button>
        </div>

        <div className="hidden sm:block bg-border mx-2 w-px h-8" />

        <ProfileMenu user={user} initials={initials} />
      </div>
    </header>
  );
}












