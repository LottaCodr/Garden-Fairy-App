import { create } from "zustand";

interface AdminUIState {
  activeTab: string;
  isCreateModalOpen: boolean;
  selectedOrderId: string | null;
  setActiveTab: (tab: string) => void;
  setCreateModalOpen: (open: boolean) => void;
  setSelectedOrderId: (id: string | null) => void;
}

export const useAdminStore = create<AdminUIState>((set) => ({
  activeTab: "dashboard",
  isCreateModalOpen: false,
  selectedOrderId: null,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
  setSelectedOrderId: (id) => set({ selectedOrderId: id }),
}));
