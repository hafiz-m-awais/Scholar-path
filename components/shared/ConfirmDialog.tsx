"use client";
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/lib/utils/cn";

interface ConfirmDialogProps {
  className?: string;
}

export function ConfirmDialog({ className }: ConfirmDialogProps) {
  const { confirmDialog, closeConfirmDialog } = useUIStore();

  if (!confirmDialog.open) return null;

  const handleConfirm = () => {
    confirmDialog.onConfirm?.();
    closeConfirmDialog();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={closeConfirmDialog}
      />
      <div
        className={cn(
          "relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4",
          className
        )}
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          {confirmDialog.title}
        </h2>
        <p className="text-sm text-gray-600 mb-6">{confirmDialog.description}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={closeConfirmDialog}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
