"use client";

import { ReactNode } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: "danger" | "success" | "warning" | "default";
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  variant = "default",
}: ConfirmDialogProps) {
  let btnClass = "bg-slate-900 text-white hover:bg-slate-800";
  let iconClass = "text-slate-500 bg-slate-100";

  switch (variant) {
    case "danger":
      btnClass = "bg-rose-500 text-white hover:bg-rose-600";
      iconClass = "text-rose-500 bg-rose-50";
      break;
    case "success":
      btnClass = "bg-emerald-500 text-white hover:bg-emerald-600";
      iconClass = "text-emerald-500 bg-emerald-50";
      break;
    case "warning":
      btnClass = "bg-amber-500 text-white hover:bg-amber-600";
      iconClass = "text-amber-500 bg-amber-50";
      break;
  }

  return (
    <Dialog open={open} onOpenChange={isLoading ? undefined : onOpenChange}>
      <DialogContent className="max-w-md w-full p-8 rounded-[24px] bg-white border border-slate-100 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${iconClass}`}>
            <AlertTriangle size={32} />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tighter text-slate-900 mb-3">
            {title}
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
            {description}
          </DialogDescription>
          
          <div className="flex flex-col w-full gap-3">
            <button
              disabled={isLoading}
              onClick={onConfirm}
              className={`h-12 w-full rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 ${btnClass} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {confirmText}
            </button>
            <button
              disabled={isLoading}
              onClick={() => onOpenChange(false)}
              className="h-12 w-full rounded-xl bg-white border border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
