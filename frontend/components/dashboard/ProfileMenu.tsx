"use client";

import { 
  User, 
  Settings, 
  CreditCard, 
  LogOut, 
  Moon, 
  Sun, 
  Palette,
  Check,
  Type,
  Layout
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { useSettings, AccentColor, FontFamily } from "./SettingsContext";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/lib/api/auth";

type ProfileMenuProps = {
  user: any;
  initials: string;
};

const ACCENTS: { label: string; value: AccentColor; color: string }[] = [
  { label: "Emerald", value: "emerald", color: "bg-emerald-500" },
  { label: "Blue", value: "blue", color: "bg-blue-500" },
  { label: "Violet", value: "violet", color: "bg-violet-500" },
  { label: "Amber", value: "amber", color: "bg-amber-500" },
  { label: "Rose", value: "rose", color: "bg-rose-500" },
];

const FONTS: { label: string; value: FontFamily }[] = [
  { label: "Inter (Default)", value: "sans" },
  { label: "Geist Sans", value: "geist" },
  { label: "Plus Jakarta", value: "jakarta" },
];

export default function ProfileMenu({ user, initials }: ProfileMenuProps) {
  const { theme, setTheme } = useTheme();
  const { accentColor, setAccentColor, fontFamily, setFontFamily } = useSettings();
  const router = useRouter();

  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3.5 hover:bg-accent p-1.5 pr-4 rounded-[var(--crm-card-radius)] transition-all group border border-transparent hover:border-border shadow-sm hover:shadow-md outline-none">
          <div className="flex justify-center items-center bg-gradient-to-br from-primary to-emerald-600 rounded-xl w-10 h-10 font-black text-sm text-primary-foreground shadow-lg shadow-primary/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-white/20">
            {initials}
          </div>
          <div className="lg:block hidden text-left min-w-[80px]">
            <p className="font-bold text-foreground text-sm leading-none tracking-tight">{user?.name || "Account"}</p>
            <p className="mt-1.5 text-muted-foreground text-[10px] font-black tracking-[0.1em] uppercase">{user?.role || "Team Member"}</p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 rounded-[var(--crm-card-radius)] p-2 shadow-2xl border-border bg-popover/95 backdrop-blur-xl" align="end" sideOffset={8}>
        <DropdownMenuLabel className="px-3 py-3">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-bold leading-none">{user?.name}</p>
            <p className="text-[10px] font-medium leading-none text-muted-foreground mt-1 truncate">
              {user?.email || "user@clientrise.com"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/settings/profile")} className="cursor-pointer py-2.5 rounded-xl focus:bg-accent group">
            <User className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="font-semibold text-sm">My Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/settings/workspace")} className="cursor-pointer py-2.5 rounded-xl focus:bg-accent group">
            <Layout className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="font-semibold text-sm">Workspace</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/settings/billing")} className="cursor-pointer py-2.5 rounded-xl focus:bg-accent group">
            <CreditCard className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="font-semibold text-sm">Billing</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          {/* Theme Switcher Submenu */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="py-2.5 rounded-xl group">
              <Sun className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors dark:hidden" />
              <Moon className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors hidden dark:block" />
              <span className="font-semibold text-sm">Appearance</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-40 rounded-[var(--crm-card-radius)] p-1.5 shadow-xl border-border bg-popover/95 backdrop-blur-xl">
                <DropdownMenuItem onClick={() => setTheme("light")} className="rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <Sun className="mr-2 h-4 w-4" />
                    <span className="text-sm font-medium">Light</span>
                  </div>
                  {theme === "light" && <Check className="h-4 w-4 text-primary" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className="rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <Moon className="mr-2 h-4 w-4" />
                    <span className="text-sm font-medium">Dark</span>
                  </div>
                  {theme === "dark" && <Check className="h-4 w-4 text-primary" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")} className="rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span className="text-sm font-medium">System</span>
                  </div>
                  {theme === "system" && <Check className="h-4 w-4 text-primary" />}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          {/* Accent Color Submenu */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="py-2.5 rounded-xl group">
              <Palette className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="font-semibold text-sm">Accent Color</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-48 rounded-[var(--crm-card-radius)] p-1.5 shadow-xl border-border bg-popover/95 backdrop-blur-xl">
                {ACCENTS.map((item) => (
                  <DropdownMenuItem 
                    key={item.value} 
                    onClick={() => setAccentColor(item.value)}
                    className="rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${item.color} mr-3 shadow-sm`} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    {accentColor === item.value && <Check className="h-4 w-4 text-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          {/* Font Selector Submenu */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="py-2.5 rounded-xl group">
              <Type className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="font-semibold text-sm">Typography</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-48 rounded-[var(--crm-card-radius)] p-1.5 shadow-xl border-border bg-popover/95 backdrop-blur-xl">
                {FONTS.map((item) => (
                  <DropdownMenuItem 
                    key={item.value} 
                    onClick={() => setFontFamily(item.value)}
                    className="rounded-lg flex items-center justify-between"
                  >
                    <span className={`text-sm font-medium font-${item.value}`}>{item.label}</span>
                    {fontFamily === item.value && <Check className="h-4 w-4 text-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => router.push("/settings")} className="cursor-pointer py-2.5 rounded-xl focus:bg-accent group">
          <Settings className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="font-semibold text-sm">Settings</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleLogout} variant="destructive" className="cursor-pointer py-2.5 rounded-xl group">
          <LogOut className="mr-3 h-4 w-4 transition-colors" />
          <span className="font-bold text-sm transition-colors">Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
