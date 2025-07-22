"use client"

import { createContext, useContext, ReactNode, useEffect } from "react";
import { useWineRealtime, UseWineRealtimeReturn } from "@/hooks/useRealtimeWines";

const WineRealtimeContext = createContext<UseWineRealtimeReturn | null>(null);

export function WineRealtimeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    return () => {
      // Cleanup on unmount
    };
  }, []);
  const realtime = useWineRealtime();
  return (
    <WineRealtimeContext.Provider value={realtime}>
      {children}
    </WineRealtimeContext.Provider>
  );
}

export function useWineRealtimeContext() {
  const ctx = useContext(WineRealtimeContext);
  if (!ctx) throw new Error("useWineRealtimeContext debe usarse dentro de WineRealtimeProvider");
  return ctx;
} 