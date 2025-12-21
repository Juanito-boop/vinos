"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { WineService } from "@/lib/services/wine-service"

// Componente de diagnóstico avanzado de vinos
export function WineDebug() {
	const [debugInfo, setDebugInfo] = useState<any>({})
	const [isLoading, setIsLoading] = useState(false)

	const runDiagnostics = async () => {
		setIsLoading(true)
		const info: any = {}

		try {
			// 1. Verificar configuración de Supabase
			info.supabaseConfig = {
				url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌',
				anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌',
				serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌'
			}

			// 2. Probar conexión básica
			try {
				const { data, error } = await supabase
					.from('wines')
					.select('id_vino')
					.limit(1)
        
				info.basicConnection = {
					success: !error,
					error: error?.message || null,
					dataCount: data?.length || 0
				}
			} catch (err: any) {
				info.basicConnection = {
					success: false,
					error: err.message,
					dataCount: 0
				}
			}

			// 3. Probar WineService
			try {
				const wines = await WineService.getAllWines()
				info.wineService = {
					success: true,
					count: wines.length,
					error: null
				}
			} catch (err: any) {
				info.wineService = {
					success: false,
					count: 0,
					error: err.message
				}
			}

			// 4. Probar consulta con join
			try {
				const { data, error } = await supabase
					.from('wines')
					.select(`
            *,
            wine_details (*)
          `)
					.limit(1)
        
				info.joinQuery = {
					success: !error,
					error: error?.message || null,
					dataCount: data?.length || 0,
					hasWineDetails: data?.[0]?.wine_details ? '✅' : '❌'
				}
			} catch (err: any) {
				info.joinQuery = {
					success: false,
					error: err.message,
					dataCount: 0,
					hasWineDetails: '❌'
				}
			}

			// 5. Verificar autenticación
			try {
				const { data: { session } } = await supabase.auth.getSession()
				info.auth = {
					hasSession: !!session,
					userEmail: session?.user?.email || null,
					isAdmin: session?.user?.user_metadata?.role === 'admin'
				}
			} catch (err: any) {
				info.auth = {
					hasSession: false,
					userEmail: null,
					isAdmin: false,
					error: err.message
				}
			}

			// 6. Probar realtime
			try {
				const channel = supabase.channel('test')
				const status = await new Promise((resolve) => {
					channel.subscribe((status) => {
						resolve(status)
					})
				})
				info.realtime = {
					success: true,
					status
				}
				supabase.removeChannel(channel)
			} catch (err: any) {
				info.realtime = {
					success: false,
					error: err.message
				}
			}

		} catch (err: any) {
			info.generalError = err.message
		}

		setDebugInfo(info)
		setIsLoading(false)
	}

	useEffect(() => {
		runDiagnostics()
	}, [])

	return (
		<Card className="w-full max-w-4xl mx-auto">
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<span>🔍 Debug de Vinos</span>
					<Button onClick={runDiagnostics} disabled={isLoading}>
						{isLoading ? "Diagnosticando..." : "Re-diagnosticar"}
					</Button>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{/* Configuración */}
					<div>
						<h3 className="font-semibold mb-2">1. Configuración de Supabase</h3>
						<div className="bg-gray-100 p-3 rounded">
							<pre className="text-sm">
								{JSON.stringify(debugInfo.supabaseConfig, null, 2)}
							</pre>
						</div>
					</div>

					{/* Conexión básica */}
					<div>
						<h3 className="font-semibold mb-2">2. Conexión Básica</h3>
						<div className="bg-gray-100 p-3 rounded">
							<pre className="text-sm">
								{JSON.stringify(debugInfo.basicConnection, null, 2)}
							</pre>
						</div>
					</div>

					{/* WineService */}
					<div>
						<h3 className="font-semibold mb-2">3. WineService</h3>
						<div className="bg-gray-100 p-3 rounded">
							<pre className="text-sm">
								{JSON.stringify(debugInfo.wineService, null, 2)}
							</pre>
						</div>
					</div>

					{/* Consulta con join */}
					<div>
						<h3 className="font-semibold mb-2">4. Consulta con Join</h3>
						<div className="bg-gray-100 p-3 rounded">
							<pre className="text-sm">
								{JSON.stringify(debugInfo.joinQuery, null, 2)}
							</pre>
						</div>
					</div>

					{/* Autenticación */}
					<div>
						<h3 className="font-semibold mb-2">5. Autenticación</h3>
						<div className="bg-gray-100 p-3 rounded">
							<pre className="text-sm">
								{JSON.stringify(debugInfo.auth, null, 2)}
							</pre>
						</div>
					</div>

					{/* Realtime */}
					<div>
						<h3 className="font-semibold mb-2">6. Realtime</h3>
						<div className="bg-gray-100 p-3 rounded">
							<pre className="text-sm">
								{JSON.stringify(debugInfo.realtime, null, 2)}
							</pre>
						</div>
					</div>

					{/* Error general */}
					{debugInfo.generalError && (
						<div>
							<h3 className="font-semibold mb-2 text-red-600">Error General</h3>
							<div className="bg-red-100 p-3 rounded">
								<pre className="text-sm text-red-800">
									{debugInfo.generalError}
								</pre>
							</div>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	)
} 