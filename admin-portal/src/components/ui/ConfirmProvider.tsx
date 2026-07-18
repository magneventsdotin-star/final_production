"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { ConfirmDialog } from "./ConfirmDialog";

interface ConfirmContextType {
  confirmAction: (
    title: string,
    description: string,
    variant?: "danger" | "success" | "warning" | "default"
  ) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    description: string;
    variant: "danger" | "success" | "warning" | "default";
    resolve: ((value: boolean) => void) | null;
  }>({
    open: false,
    title: "",
    description: "",
    variant: "default",
    resolve: null,
  });

  const confirmAction = (
    title: string,
    description: string,
    variant: "danger" | "success" | "warning" | "default" = "danger"
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        open: true,
        title,
        description,
        variant,
        resolve,
      });
    });
  };

  const handleConfirm = () => {
    if (state.resolve) state.resolve(true);
    setState((prev) => ({ ...prev, open: false }));
  };

  const handleCancel = () => {
    if (state.resolve) state.resolve(false);
    setState((prev) => ({ ...prev, open: false }));
  };

  return (
    <ConfirmContext.Provider value={{ confirmAction }}>
      {children}
      <ConfirmDialog
        open={state.open}
        onOpenChange={(open) => {
          if (!open) handleCancel();
        }}
        onConfirm={handleConfirm}
        title={state.title}
        description={state.description}
        variant={state.variant}
        confirmText="Confirm"
        cancelText="Cancel"
      />
    </ConfirmContext.Provider>
  );
}
