"use client";
import { useComposeStore } from "@/store/composeStore";
import type { ComposeEmailData } from "@/lib/types";

export function useEmailCompose() {
  const { open, prefill, openCompose, closeCompose } = useComposeStore();
  return {
    composeOpen: open,
    composePrefill: prefill,
    openCompose: (prefill?: Partial<ComposeEmailData>) => openCompose(prefill),
    closeCompose,
  };
}
