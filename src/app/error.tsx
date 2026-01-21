'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCcw, AlertTriangle } from 'lucide-react'

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	useEffect(() => {
		// Opcional: Loggear el error a un servicio externo
		console.error('Global Error Boundary:', error)
	}, [error])

	return (
		<main className="min-h-screen bg-[#fcfaf8] flex flex-col items-center justify-center p-6 text-center">
			<div className="bg-white/60 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-primary/5 border border-white max-w-lg w-full space-y-8 animate-in fade-in zoom-in duration-500">
				<div className="w-20 h-20 bg-destructive/10 rounded-[2rem] flex items-center justify-center mx-auto text-destructive">
					<AlertTriangle className="w-10 h-10" />
				</div>

				<div className="space-y-4">
					<h2 className="text-3xl font-black text-gray-900 tracking-tight">Vaya, algo salió mal</h2>
					<p className="text-gray-500 font-medium leading-relaxed">
						No pudimos conectar con nuestra cava de vinos en este momento.
						Esto suele ser un problema temporal de conexión.
					</p>
					{process.env.NODE_ENV === 'development' && (
						<div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 mt-4 overflow-hidden">
							<p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-2">Debug Info</p>
							<p className="text-xs font-mono text-destructive break-all">{error.message}</p>
						</div>
					)}
				</div>

				<div className="flex flex-col gap-3">
					<Button
						onClick={() => reset()}
						className="w-full bg-primary hover:bg-primary/90 h-14 rounded-2xl font-black tracking-widest shadow-xl shadow-primary/20 active:scale-[0.98] transition-all gap-3"
					>
						<RefreshCcw className="w-5 h-5" />
						REINTENTAR AHORA
					</Button>

					<Button
						variant="ghost"
						onClick={() => window.location.reload()}
						className="w-full text-xs font-black uppercase tracking-widest text-gray-400 hover:text-primary rounded-xl h-10"
					>
						Refrescar página completa
					</Button>
				</div>
			</div>

			<p className="mt-8 text-[10px] uppercase font-bold text-gray-300 tracking-[0.3em]">
				Los Vinos • Servicio Técnico
			</p>
		</main>
	)
}
