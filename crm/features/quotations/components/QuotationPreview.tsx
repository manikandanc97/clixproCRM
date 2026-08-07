"use client";

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/shared/ui/dialog";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { 
  FileText, 
  Download, 
  Clock, 
  User, 
  Printer,
  Copy,
  Trash2,
  Edit,
  Building,
  X,
  ChevronDown
} from "lucide-react";
import { QuotationType } from "@/shared/types/quotation";
import { Separator } from "@/shared/ui/separator";
import { useCurrency } from "@/shared/hooks/use-currency";
import { useRouter } from "next/navigation";
import { useCreateQuotation, useDeleteQuotation, useUpdateQuotationStatus } from "@/shared/hooks/use-crm";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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

interface QuotationPreviewProps {
  quotation: QuotationType | null;
  isOpen: boolean;
  onClose: () => void;
}

const QuotationPreview = ({ quotation, isOpen, onClose }: QuotationPreviewProps) => {
  const { formatCurrency } = useCurrency();
  const router = useRouter();
  const { mutate: createQuotation } = useCreateQuotation();
  const { mutate: deleteQuotationMutation } = useDeleteQuotation();
  const { mutate: updateStatusMutation } = useUpdateQuotationStatus();
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  if (!quotation) return null;

  const handleEdit = () => {
    onClose();
    router.push(`/quotations?edit=${quotation.id}`);
  };

  const handleDuplicate = () => {
    setIsDuplicating(true);
    // Create payload stripping out specific IDs and resetting timestamps/status
    const payload = {
      client: quotation.client,
      leadId: quotation.leadId || "",
      amount: String(quotation.amountValue),
      status: "DRAFT" as const,
      validTill: quotation.validTillValue ? new Date(quotation.validTillValue).toISOString() : undefined,
      items: quotation.items || [],
      notes: quotation.notes || "",
      discount: quotation.discount || 0,
      tax: quotation.tax || 0,
    };

    createQuotation(payload, {
      onSuccess: (newQuote: ReturnType<typeof JSON.parse>) => {
        toast.success("Quotation duplicated successfully.");
        setIsDuplicating(false);
        onClose();
        if (newQuote && newQuote.id) {
          router.push(`/quotations?edit=${newQuote.id}`);
        }
      },
      onError: () => {
        setIsDuplicating(false);
      }
    });
  };

  const handleDelete = () => {
    setIsDeleting(true);
    deleteQuotationMutation(quotation.id, {
      onSuccess: () => {
        toast.success("Quotation deleted successfully.");
        setIsDeleting(false);
        setShowDeleteConfirm(false);
        onClose();
      },
      onError: () => {
        setIsDeleting(false);
      }
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent showCloseButton={false} className="sm:max-w-2xl p-0 bg-muted border-none shadow-2xl overflow-y-auto max-h-[90vh] rounded-2xl sm:rounded-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Quotation Preview: {quotation.quoteId}</DialogTitle>
            <DialogDescription>Detailed preview of quotation {quotation.quoteId} for {quotation.client}</DialogDescription>
          </DialogHeader>
          
          {/* Header */}
          <div className="bg-card p-8 border-b border-border sticky top-0 z-20">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-100">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black text-foreground tracking-tighter">
                    {quotation.quoteId}
                  </DialogTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Badge className={cn("border-none px-3 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1 select-none",
                          quotation.status === "DRAFT" && "bg-slate-100 text-slate-700",
                          quotation.status === "ACCEPTED" && "bg-emerald-50 text-emerald-700",
                          quotation.status === "SENT" && "bg-blue-50 text-blue-700",
                          quotation.status === "REJECTED" && "bg-rose-50 text-rose-700",
                          quotation.status === "EXPIRED" && "bg-slate-800/10 text-slate-800")}>
                          {quotation.status}
                          <ChevronDown className="w-3 h-3 opacity-60" />
                        </Badge>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-36 z-50">
                        <DropdownMenuItem onClick={() => updateStatusMutation({ id: quotation.id, status: "DRAFT" })} className="text-xs font-semibold cursor-pointer">
                          <span className="w-2 h-2 rounded-full bg-slate-500 mr-2" /> Draft
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatusMutation({ id: quotation.id, status: "SENT" })} className="text-xs font-semibold cursor-pointer">
                          <span className="w-2 h-2 rounded-full bg-blue-500 mr-2" /> Sent
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatusMutation({ id: quotation.id, status: "ACCEPTED" })} className="text-xs font-semibold cursor-pointer text-emerald-600">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" /> Accepted
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatusMutation({ id: quotation.id, status: "REJECTED" })} className="text-xs font-semibold cursor-pointer text-rose-600">
                          <span className="w-2 h-2 rounded-full bg-rose-500 mr-2" /> Rejected
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatusMutation({ id: quotation.id, status: "EXPIRED" })} className="text-xs font-semibold cursor-pointer">
                          <span className="w-2 h-2 rounded-full bg-slate-800 mr-2" /> Expired
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" className="rounded-xl text-muted-foreground hover:text-foreground" onClick={() => window.print()} title="Print">
                  <Printer className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="rounded-xl text-muted-foreground hover:text-foreground" onClick={onClose} title="Close">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button 
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 shadow-lg shadow-emerald-200"
                onClick={() => window.open(`/quotations/${quotation.id}/pdf`, '_blank')}
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button 
                variant="outline" 
                className="rounded-xl border-border h-12 font-bold text-foreground"
                onClick={handleEdit}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Quotation
              </Button>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Quotation Details */}
            <section className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-emerald-500" />
                Quotation Details
              </h4>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Customer Name</p>
                  <p className="text-sm font-semibold text-foreground">{quotation.client}</p>
                </div>
                {quotation.leadName && quotation.leadName !== quotation.client && (
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Company / Deal</p>
                    <div className="flex items-center gap-1.5">
                      <Building className="w-3 h-3 text-muted-foreground" />
                      <p className="text-sm font-semibold text-foreground">{quotation.leadName}</p>
                    </div>
                  </div>
                )}
                {quotation.lastActivity && (
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Created Date</p>
                    <p className="text-sm font-semibold text-foreground">{quotation.lastActivity}</p>
                  </div>
                )}
                {quotation.validTill && (
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Valid Until</p>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-amber-500" />
                      <p className="text-sm font-semibold text-foreground">{quotation.validTill}</p>
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Status</p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Badge className={cn("border-none px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1 w-fit select-none",
                        quotation.status === "DRAFT" && "bg-slate-100 text-slate-700",
                        quotation.status === "ACCEPTED" && "bg-emerald-50 text-emerald-700",
                        quotation.status === "SENT" && "bg-blue-50 text-blue-700",
                        quotation.status === "REJECTED" && "bg-rose-50 text-rose-700",
                        quotation.status === "EXPIRED" && "bg-slate-800/10 text-slate-800")}>
                        {quotation.status}
                        <ChevronDown className="w-3 h-3 opacity-60" />
                      </Badge>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-36 z-50">
                      <DropdownMenuItem onClick={() => updateStatusMutation({ id: quotation.id, status: "DRAFT" })} className="text-xs font-semibold cursor-pointer">
                        <span className="w-2 h-2 rounded-full bg-slate-500 mr-2" /> Draft
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateStatusMutation({ id: quotation.id, status: "SENT" })} className="text-xs font-semibold cursor-pointer">
                        <span className="w-2 h-2 rounded-full bg-blue-500 mr-2" /> Sent
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateStatusMutation({ id: quotation.id, status: "ACCEPTED" })} className="text-xs font-semibold cursor-pointer text-emerald-600">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" /> Accepted
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateStatusMutation({ id: quotation.id, status: "REJECTED" })} className="text-xs font-semibold cursor-pointer text-rose-600">
                        <span className="w-2 h-2 rounded-full bg-rose-500 mr-2" /> Rejected
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateStatusMutation({ id: quotation.id, status: "EXPIRED" })} className="text-xs font-semibold cursor-pointer">
                        <span className="w-2 h-2 rounded-full bg-slate-800 mr-2" /> Expired
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Prepared By</p>
                  <p className="text-sm font-semibold text-foreground">System</p>
                </div>
              </div>
              
              {quotation.notes && (
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Notes</p>
                  <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap">{quotation.notes}</p>
                </div>
              )}
            </section>

            {/* Itemized Breakdown */}
            <section className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-6">Line Items</h4>
              <div className="space-y-4">
                {quotation.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground font-bold text-xs">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground font-medium">Qty: {item.quantity} x {formatCurrency(item.price)}</p>
                      </div>
                    </div>
                    <p className="text-sm font-black text-foreground">{formatCurrency(item.quantity * item.price)}</p>
                  </div>
                ))}
                
                <Separator className="my-4 bg-muted" />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground font-medium">
                    <span>Subtotal</span>
                    <span>{formatCurrency(quotation.amountValue)}</span>
                  </div>
                  {quotation.tax !== undefined && quotation.tax > 0 && (
                    <div className="flex justify-between text-sm text-muted-foreground font-medium">
                      <span>Tax</span>
                      <span>+{formatCurrency(quotation.tax)}</span>
                    </div>
                  )}
                  {quotation.discount !== undefined && quotation.discount > 0 && (
                    <div className="flex justify-between text-sm text-rose-500 font-medium">
                      <span>Discount</span>
                      <span>-{formatCurrency(quotation.discount)}</span>
                    </div>
                  )}
                  <Separator className="my-2 bg-muted" />
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-base font-black text-foreground">Total Amount</span>
                    <span className="text-2xl font-black text-emerald-600">{formatCurrency(quotation.amountValue + (quotation.tax || 0) - (quotation.discount || 0))}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer Actions */}
            <div className="grid grid-cols-3 gap-4 pb-8">
              <Button 
                variant="outline" 
                className="rounded-xl border-border h-14 font-bold text-foreground hover:bg-white shadow-sm transition-all group"
                onClick={handleDuplicate}
                disabled={isDuplicating}
              >
                <Copy className="w-4 h-4 mr-2 text-muted-foreground group-hover:text-muted-foreground" />
                {isDuplicating ? "Duplicating..." : "Duplicate"}
              </Button>
              <Button 
                variant="outline" 
                className="rounded-xl border-border h-14 font-bold text-foreground hover:bg-white shadow-sm transition-all group"
                onClick={handleEdit}
              >
                <Edit className="w-4 h-4 mr-2 text-muted-foreground group-hover:text-muted-foreground" />
                Edit
              </Button>
              <Button 
                variant="destructive" 
                className="rounded-xl h-14 font-bold shadow-sm transition-all bg-rose-600 hover:bg-rose-700 text-white hover:text-white"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quotation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this quotation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-rose-600 hover:bg-rose-700 focus:ring-rose-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default QuotationPreview;

