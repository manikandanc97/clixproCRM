import { SunMoon, Monitor, Moon, Sun } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const ThemeSettings = () => {
  return (
    <Card className="bg-card rounded-xl border-border shadow-sm overflow-hidden">
      <CardHeader className="p-5 pb-3">
        <CardTitle className="font-bold text-foreground text-xl tracking-tight">Appearance</CardTitle>
        <CardDescription className="text-muted-foreground text-sm mt-1">Customize how the CRM looks on your device.</CardDescription>
      </CardHeader>

      <CardContent className="p-5 pt-3">
        <div className="relative">
          <Select defaultValue="light">
            <SelectTrigger className="bg-muted border-transparent focus:ring-emerald-500/30 focus:bg-white pl-11 py-6 rounded-xl transition-all h-auto text-left">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <SunMoon className="w-4 h-4 text-muted-foreground" />
              </div>
              <SelectValue placeholder="Select Theme" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border shadow-elevated">
              <SelectItem value="light">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Light Mode</span>
                </div>
              </SelectItem>
              <SelectItem value="dark">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <span>Dark Mode</span>
                </div>
              </SelectItem>
              <SelectItem value="system">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-muted-foreground" />
                  <span>System Default</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThemeSettings;
