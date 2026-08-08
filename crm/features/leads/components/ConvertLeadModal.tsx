import { useState } from "react";
import { FormModal } from "@/shared/components/form-modal";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import client from "@/shared/lib/api/client";

export function ConvertLeadModal({ 
  isOpen, 
  onClose, 
  lead 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  lead: any 
}) {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    customerName: lead?.name || "",
    customerEmail: lead?.email || "",
    companyName: lead?.company || "",
    dealName: `${lead?.name || "Lead"} Deal`,
    dealValue: lead?.valueAmount || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead?.id) return;
    
    setLoading(true);
    try {
      const response = await client.post(`/crm/leads/${lead.id}/convert`, formData);
      if (response.data.success) {
        toast.success("Lead converted successfully");
        queryClient.invalidateQueries({ queryKey: ["leads"] });
        queryClient.invalidateQueries({ queryKey: ["customers"] });
        queryClient.invalidateQueries({ queryKey: ["companies"] });
        queryClient.invalidateQueries({ queryKey: ["deals"] });
        queryClient.invalidateQueries({ queryKey: ["pipeline"] });
        onClose();
      } else {
        toast.error(response.data.message || "Failed to convert lead");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to convert lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormModal
      title="Convert Lead"
      description={`Convert ${lead?.name} into a Customer, Company, and Deal.`}
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label>Customer Name</Label>
          <Input 
            required 
            value={formData.customerName} 
            onChange={e => setFormData({ ...formData, customerName: e.target.value })} 
          />
        </div>
        <div className="space-y-2">
          <Label>Customer Email</Label>
          <Input 
            type="email"
            value={formData.customerEmail} 
            onChange={e => setFormData({ ...formData, customerEmail: e.target.value })} 
          />
        </div>
        <div className="space-y-2">
          <Label>Company Name</Label>
          <Input 
            required 
            value={formData.companyName} 
            onChange={e => setFormData({ ...formData, companyName: e.target.value })} 
          />
        </div>
        <div className="space-y-2">
          <Label>Deal Name</Label>
          <Input 
            required 
            value={formData.dealName} 
            onChange={e => setFormData({ ...formData, dealName: e.target.value })} 
          />
        </div>
        <div className="space-y-2">
          <Label>Deal Value</Label>
          <Input 
            type="number"
            required 
            value={formData.dealValue} 
            onChange={e => setFormData({ ...formData, dealValue: Number(e.target.value) })} 
          />
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Converting..." : "Convert Lead"}
          </Button>
        </div>
      </form>
    </FormModal>
  );
}
