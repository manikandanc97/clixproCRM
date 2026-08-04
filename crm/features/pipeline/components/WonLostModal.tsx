import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { PipelineLeadType } from "@/shared/types/pipeline";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { DollarSign, IndianRupee, Trophy, XCircle, Loader2 } from "lucide-react";
import { useCurrency } from "@/shared/hooks/use-currency";

export interface WonLostSubmitData {
  reason: string;
  competitor?: string;
  actualRevenue?: number;
  wonDate?: string;
  notes?: string;
}

interface WonLostModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "Won" | "Lost" | null;
  deal: PipelineLeadType | null;
  onSubmit: (data: WonLostSubmitData) => void;
  isLoading?: boolean;
}

export function WonLostModal({ isOpen, onClose, type, deal, onSubmit, isLoading }: WonLostModalProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const { currency } = useCurrency();
  const CurrencyIcon = currency === "INR" ? IndianRupee : DollarSign;
  const [reason, setReason] = useState("");
  const [competitor, setCompetitor] = useState("");
  const [actualRevenue, setActualRevenue] = useState("");
  const [wonDate, setWonDate] = useState("");
  const [notes, setNotes] = useState("");
  const [prevDealId, setPrevDealId] = useState<string | undefined>(deal?.id);

  if (deal?.id !== prevDealId) {
    setPrevDealId(deal?.id);
    setReason("");
    setCompetitor("");
    setNotes("");
    setActualRevenue(deal?.valueAmount?.toString() || "");
    setWonDate(new Date().toISOString().split("T")[0]);
    setInternalLoading(false);
  }

  const showLoading = isLoading || internalLoading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInternalLoading(true);
    onSubmit({ 
      reason, 
      competitor: type === "Lost" ? competitor : undefined,
      actualRevenue: type === "Won" ? Number(actualRevenue) : undefined,
      wonDate: type === "Won" ? wonDate : undefined,
      notes
    });
  };

  if (!isOpen || !type || !deal) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent aria-describedby={undefined} className="sm:max-w-[450px] p-0 overflow-hidden gap-0">
        <DialogHeader className="p-6 pb-4 border-b bg-muted/30">
          <DialogTitle className="flex items-center gap-3 text-xl">
            {type === "Won" ? (
              <>
                <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-full">
                  <Trophy className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                Mark as Won
              </>
            ) : (
              <>
                <div className="p-2 bg-destructive/10 rounded-full">
                  <XCircle className="w-5 h-5 text-destructive" />
                </div>
                Mark as Lost
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {type === "Won" && (
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2.5">
                <Label>Actual Revenue <span className="text-destructive ml-0.5">*</span></Label>
                <div className="relative">
                  <CurrencyIcon className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="number"
                    required
                    value={actualRevenue}
                    onChange={(e) => setActualRevenue(e.target.value)}
                    className="pl-9"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-2.5">
                <Label>Won Date <span className="text-destructive ml-0.5">*</span></Label>
                <div className="relative">
                  <Input
                    type="date"
                    required
                    value={wonDate}
                    onChange={(e) => setWonDate(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2.5">
            <Label>
              {type === "Won" ? "What helped us win this deal?" : "Why was this deal lost?"}
              {type === "Lost" ? (
                <span className="text-destructive ml-0.5">*</span>
              ) : (
                <span className="text-muted-foreground font-normal ml-0.5">(Optional)</span>
              )}
            </Label>
            <Input
              type="text"
              required={type === "Lost"}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={type === "Won" ? "Great features, pricing..." : "Pricing, missing features..."}
            />
          </div>

          {type === "Lost" && (
            <div className="space-y-2.5">
              <Label>Competitor <span className="text-muted-foreground font-normal ml-0.5">(Optional)</span></Label>
              <Input
                type="text"
                value={competitor}
                onChange={(e) => setCompetitor(e.target.value)}
                placeholder="Who did we lose to?"
              />
            </div>
          )}

          <div className="space-y-2.5">
            <Label>
              Notes {type === "Lost" ? <span className="text-destructive ml-0.5">*</span> : <span className="text-muted-foreground font-normal ml-0.5">(Optional)</span>}
            </Label>
            <Textarea
              required={type === "Lost"}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none min-h-[100px]"
              placeholder="Additional details..."
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={showLoading} className="w-full sm:w-auto">Cancel</Button>
            <Button type="submit" disabled={showLoading} variant={type === "Won" ? "default" : "destructive"} className="w-full sm:w-auto gap-2">
              {showLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : type === "Won" ? <Trophy className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {showLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
