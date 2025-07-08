"use client"

import { useWineRealtime } from "@/hooks/useRealtimeWines";
import WineTable from "./wine-table";

export function AdminPanel() {
  const { wines} = useWineRealtime()
  return (
    <div className="bg-gradient-to-br from-white via-red-50 to-purple-50 rounded-lg shadow-lg border border-red-200 p-6">
      <WineTable wines={wines} className="w-full" />
    </div>
  )
}
