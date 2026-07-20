import { create } from "zustand";

type ModalType = "lead" | "customer" | "task" | "quote" | "employee" | "role" | "meeting" | null;

interface GlobalModalStore {
  activeModal: ModalType;
  openModal: (type: ModalType) => void;
  closeModal: () => void;
}

export const useGlobalModalStore = create<GlobalModalStore>((set) => ({
  activeModal: null,
  openModal: (type) => set({ activeModal: type }),
  closeModal: () => set({ activeModal: null }),
}));
