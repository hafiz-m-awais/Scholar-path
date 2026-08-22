import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  confirmDialog: {
    open: boolean;
    title: string;
    description: string;
    onConfirm: (() => void) | null;
  };
  openConfirmDialog: (opts: {
    title: string;
    description: string;
    onConfirm: () => void;
  }) => void;
  closeConfirmDialog: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  confirmDialog: {
    open: false,
    title: "",
    description: "",
    onConfirm: null,
  },
  openConfirmDialog: ({ title, description, onConfirm }) =>
    set({ confirmDialog: { open: true, title, description, onConfirm } }),
  closeConfirmDialog: () =>
    set((s) => ({
      confirmDialog: { ...s.confirmDialog, open: false, onConfirm: null },
    })),
}));
