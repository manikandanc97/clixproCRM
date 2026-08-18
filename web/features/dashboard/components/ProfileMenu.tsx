"use client";

import { useState } from "react";
import { 
  User, 
  Settings, 
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
} from "@/shared/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { useTheme } from "next-themes";
import { useSettings, AccentColor, FontFamily } from "./SettingsContext";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/components/auth-provider";
import { PERMISSIONS } from "@/shared/lib/auth/rbac/permissions";
import { useCRMStore } from "@/shared/store/useCRMStore";

type ProfileMenuProps = {
  user: { name?: string; email?: string; role?: string; roleName?: string; displayName?: string; avatar?: string; } | null;
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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { theme, setTheme } = useTheme();
  const { accentColor, setAccentColor, fontFamily, setFontFamily } = useSettings();
  const router = useRouter();
  const { logout, hasPermission } = useAuth();
  const { currency, setCurrency } = useCRMStore();

  const handleLogout = async () => {
    // Close the AlertDialog BEFORE running logout.
    // Radix AlertDialog adds body-level styles (pointer-events: none, overflow: hidden
    // via react-remove-scroll / focus guards) when open. logout() synchronously sets
    // auth status to "unauthenticated", which causes ProtectedRoute to unmount this
    // entire dashboard subtree — including the open AlertDialog — before Radix can
    // clean up those body styles. The leaked styles block all interactions on /login.
    setShowLogoutConfirm(false);

    // Yield a frame so Radix can run its cleanup (remove body styles, focus guards).
    await new Promise((resolve) => requestAnimationFrame(resolve));

    await logout();
    router.push("/login");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 bg-background hover:bg-muted/30 p-1.5 h-[52px] rounded-xl transition-all duration-200 hover:-translate-y-0.5 group border border-transparent outline-none focus-visible:ring-1 focus-visible:ring-primary">
          <div className="relative shrink-0">
            <div className="flex justify-center items-center bg-gradient-to-br from-primary to-emerald-600 rounded-full w-[38px] h-[38px] font-bold text-sm text-primary-foreground shadow-sm border border-white/20">
              {initials}
            </div>
            {/* Online Indicator */}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background ring-1 ring-black/5 dark:ring-white/10" />
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 rounded-xl p-2 shadow-elevated border-border bg-popover/95 backdrop-blur-xl" align="end" sideOffset={8}>
        <DropdownMenuLabel className="px-3 py-3">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-bold leading-none">{user?.displayName || user?.name}</p>
            <p className="text-[10px] font-medium leading-none text-muted-foreground mt-1 truncate">
              {user?.email || "user@clixprocrm.com"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/settings?section=profile")} className="cursor-pointer py-2.5 rounded-xl focus:bg-accent group">
            <User className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="font-semibold text-sm">My Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/settings?section=account")} className="cursor-pointer py-2.5 rounded-xl focus:bg-accent group">
            <Layout className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="font-semibold text-sm">My Account</span>
          </DropdownMenuItem>
          {hasPermission(PERMISSIONS.SETTINGS_READ) && (
            <DropdownMenuItem onClick={() => router.push("/settings?section=workspace")} className="cursor-pointer py-2.5 rounded-xl focus:bg-accent group">
              <Layout className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="font-semibold text-sm">Workspace</span>
            </DropdownMenuItem>
          )}
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
              <DropdownMenuSubContent className="w-40 rounded-xl p-1.5 shadow-elevated border-border bg-popover/95 backdrop-blur-xl">
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
              <DropdownMenuSubContent className="w-48 rounded-xl p-1.5 shadow-elevated border-border bg-popover/95 backdrop-blur-xl">
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
              <DropdownMenuSubContent className="w-48 rounded-xl p-1.5 shadow-elevated border-border bg-popover/95 backdrop-blur-xl">
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
        
        {hasPermission(PERMISSIONS.SETTINGS_READ) && (
          <DropdownMenuItem onClick={() => router.push("/settings")} className="cursor-pointer py-2.5 rounded-xl focus:bg-accent group">
            <Settings className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="font-semibold text-sm">Settings</span>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={() => router.push("/settings?section=security")} className="cursor-pointer py-2.5 rounded-xl focus:bg-accent group">
          <Settings className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="font-semibold text-sm">Change Password</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => setShowLogoutConfirm(true)} variant="destructive" className="cursor-pointer py-2.5 rounded-xl group">
          <LogOut className="mr-3 h-4 w-4 transition-colors" />
          <span className="font-bold text-sm transition-colors">Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign Out</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out of your account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleLogout}>
              Sign out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}












