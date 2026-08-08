"use client";

import { Button } from "@/shared/ui/button";

interface DealFormProps {
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const DealForm = ({ initialData, onSuccess, onCancel }: DealFormProps) => {
  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="text-center text-muted-foreground p-8 border border-dashed rounded-xl">
        Deal Form Component Placeholder
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={onSuccess}>Save Deal</Button>
      </div>
    </div>
  );
};
