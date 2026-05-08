"use client";

import { useSyncExternalStore } from "react";
import { Building2, Hash, Globe, MapPin, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const currencyStorageKey = "clientrise_currency";
const subscribeToCurrency = () => () => {};
const getCurrencySnapshot = () => localStorage.getItem(currencyStorageKey) || "USD";
const getServerCurrencySnapshot = () => "USD";

const CompanySettings = () => {
  const currency = useSyncExternalStore(
    subscribeToCurrency,
    getCurrencySnapshot,
    getServerCurrencySnapshot,
  );

  const handleCurrencyChange = (nextCurrency: string) => {
    localStorage.setItem(currencyStorageKey, nextCurrency);
    window.location.reload();
  };

  return (
    <Card className="bg-white rounded-xl border-slate-200/60 shadow-sm overflow-hidden">
      <CardHeader className="p-5 pb-3">
        <CardTitle className="font-bold text-slate-900 text-xl tracking-tight">Company Profile</CardTitle>
        <CardDescription className="text-slate-400 text-sm mt-1">Manage your organization&apos;s business details and location.</CardDescription>
      </CardHeader>

      <CardContent className="p-5 pt-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-500 font-semibold text-xs uppercase tracking-wider ml-1">Company Name</Label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input defaultValue="ClientRise CRM" className="bg-slate-50 border-transparent focus:border-emerald-500/30 focus:bg-white pl-11 py-6 rounded-2xl transition-all" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-500 font-semibold text-xs uppercase tracking-wider ml-1">Business ID / GST</Label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input defaultValue="GST123456789" className="bg-slate-50 border-transparent focus:border-emerald-500/30 focus:bg-white pl-11 py-6 rounded-2xl transition-all" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-500 font-semibold text-xs uppercase tracking-wider ml-1">Timezone</Label>
            <div className="relative">
              <Select defaultValue="ist">
                <SelectTrigger className="bg-slate-50 border-transparent focus:ring-emerald-500/30 focus:bg-white pl-11 py-6 rounded-2xl transition-all h-auto">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Globe className="w-4 h-4 text-slate-400" />
                  </div>
                  <SelectValue placeholder="Select Timezone" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                  <SelectItem value="ist">Asia/Kolkata (IST)</SelectItem>
                  <SelectItem value="utc">UTC (Coordinated Universal Time)</SelectItem>
                  <SelectItem value="est">America/New_York (EST)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-500 font-semibold text-xs uppercase tracking-wider ml-1">Currency</Label>
            <div className="relative">
              <Select value={currency} onValueChange={handleCurrencyChange}>
                <SelectTrigger className="bg-slate-50 border-transparent focus:ring-emerald-500/30 focus:bg-white pl-11 py-6 rounded-2xl transition-all h-auto">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                  </div>
                  <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-slate-500 font-semibold text-xs uppercase tracking-wider ml-1">Business Address</Label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input defaultValue="Coimbatore, Tamil Nadu" className="bg-slate-50 border-transparent focus:border-emerald-500/30 focus:bg-white pl-11 py-6 rounded-2xl transition-all" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanySettings;
