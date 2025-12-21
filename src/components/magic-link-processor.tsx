"use client"

import { useAuth } from "@/providers/auth-provider"

export function MagicLinkProcessor() {
	const { isProcessingMagicLink } = useAuth()

	if (!isProcessingMagicLink) {
		return null
	}

	return (
		<div className="fixed inset-0 z-[9999] bg-white/95 backdrop-blur-sm flex items-center justify-center">
			<div className="text-center space-y-4">
				<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto"></div>
				<div className="space-y-2">
					<h2 className="text-xl font-semibold text-gray-900">
            Procesando enlace de acceso
					</h2>
					<p className="text-gray-600 max-w-sm">
            Estamos verificando tu enlace de acceso. Por favor espera un momento...
					</p>
				</div>
			</div>
		</div>
	)
} 