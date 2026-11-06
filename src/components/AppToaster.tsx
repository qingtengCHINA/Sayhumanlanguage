"use client";

import { Toaster } from "sonner";

export default function AppToaster() {
  return (
    <Toaster
      theme="light"
      position="bottom-center"
      visibleToasts={3}
      toastOptions={{
        classNames: {
          toast:
            "!bg-surface !text-ink !border !border-line !shadow-[0_8px_24px_rgba(23,22,20,0.08)] !rounded-xl",
          title: "!text-ink !text-sm",
          description: "!text-muted",
        },
      }}
    />
  );
}
