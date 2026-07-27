"use client";

import React from "react";
import { useGlobalModalStore } from "@/shared/store/useGlobalModalStore";
import { FormModal } from "@/shared/components/form-modal";
import { LeadForm } from "@/features/forms/LeadForm";
import { CustomerForm } from "@/features/forms/CustomerForm";

export const GlobalModalManager = () => {
  const { activeModal, closeModal } = useGlobalModalStore();

  return (
    <>
      <FormModal
        title="Quick Lead Capture"
        description="Add a new lead to your pipeline."
        isOpen={activeModal === "lead"}
        onOpenChange={(open) => !open && closeModal()}
        size="lg"
      >
        <LeadForm onSuccess={closeModal} onCancel={closeModal} />
      </FormModal>

      <FormModal
        title="New Customer"
        description="Register a new customer."
        isOpen={activeModal === "customer"}
        onOpenChange={(open) => !open && closeModal()}
        size="lg"
      >
        <CustomerForm onSuccess={closeModal} onCancel={closeModal} />
      </FormModal>
    </>
  );
};
