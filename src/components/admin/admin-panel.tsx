"use client"

import { useEffect, useState } from "react"
import { useWineRealtime } from "@/hooks/useRealtimeWines"
import { WineTable } from "../wine-table"
import type { Wine } from "@/types"

interface AdminPanelProps {
  wines: Wine[]
}

export function AdminPanel({ wines: initialWines }: AdminPanelProps) {
	const { wines: realtimeWines, isLoading, error } = useWineRealtime();
	const [wines, setWines] = useState(initialWines);

	useEffect(() => {
		if (realtimeWines && realtimeWines.length > 0) {
			setWines(realtimeWines);
		}
	}, [realtimeWines]);

	if (isLoading && (!wines || wines.length === 0)) {
		return <div className="p-8 text-center">Cargando vinos...</div>;
	}
	if (error) {
		return <div className="p-8 text-center text-red-500">Error cargando vinos: {error.message}</div>;
	}

	return (
		<div className="bg-gradient-to-br from-white via-red-50 to-purple-50 rounded-lg shadow-lg border border-red-200 p-6">
			<WineTable wines={wines} className="w-full" />
		</div>
	)
}
