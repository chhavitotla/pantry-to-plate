"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { Toaster } from "sonner";

import { createQueryClient } from "@/lib/query-client";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-center"
        richColors
        toastOptions={{
          style: {
            background: "#fffdf8",
            color: "#24304a",
            border: "1px solid rgba(218, 209, 196, 0.9)",
          },
        }}
      />
    </QueryClientProvider>
  );
}
