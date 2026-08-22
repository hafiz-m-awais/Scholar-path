import { create } from "zustand";
import type { ComposeEmailData } from "@/lib/types";

interface ComposeState {
  open: boolean;
  prefill: Partial<ComposeEmailData>;
  openCompose: (prefill?: Partial<ComposeEmailData>) => void;
  closeCompose: () => void;
  setPrefill: (data: Partial<ComposeEmailData>) => void;
}

export const useComposeStore = create<ComposeState>((set) => ({
  open: false,
  prefill: {},
  openCompose: (prefill = {}) => set({ open: true, prefill }),
  closeCompose: () => set({ open: false, prefill: {} }),
  setPrefill: (data) => set((s) => ({ prefill: { ...s.prefill, ...data } })),
}));
