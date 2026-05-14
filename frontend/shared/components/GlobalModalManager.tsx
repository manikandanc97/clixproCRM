"use client";

import React from "react";
import { useGlobalModalStore } from "@/shared/store/useGlobalModalStore";
import { FormModal } from "@/shared/components/form-modal";
import { MeetingForm } from "@/features/forms/MeetingForm";
import { LeadForm } from "@/features/forms/LeadForm";
import { CustomerForm } from "@/features/forms/CustomerForm";
import { TaskForm } from "@/features/forms/TaskForm";
import { QuoteForm } from "@/features/forms/QuoteForm";
import { EmployeeForm } from "@/features/forms/EmployeeForm";
import { RoleForm } from "@/features/forms/RoleForm";

export const GlobalModalManager = () => {
  const { activeModal, closeModal } = useGlobalModalStore();

  return (
    <>
      <FormModal
        title="Schedule New Meeting"
        description="Book a new session with a lead or customer."
        isOpen={activeModal === "meeting"}
        onOpenChange={(open) => !open && closeModal()}
        size="md"
      >
        <MeetingForm onSuccess={closeModal} onCancel={closeModal} />
      </FormModal>

      {/* Add other modals if you want global access without redirection */}
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
