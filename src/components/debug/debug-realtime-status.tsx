"use client"

import { useWines } from "@/hooks/use-wines";
import { useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { RefreshCw, Wifi, WifiOff, AlertTriangle } from "lucide-react";

// Componente de diagnóstico de conexión realtime de vinos
export function DebugRealtimeStatus() {
	const { wines, isLoading, error, refetch, isUsingFallback, realtimeStatus } = useWines();
	const [isRefreshing, setIsRefreshing] = useState(false);

	const handleRefresh = async () => {
		setIsRefreshing(true);
		try {
			await refetch();
		} catch (error) {
			console.error('Error refreshing:', error);
		} finally {
			setIsRefreshing(false);
		}
	};

	const getStatusIcon = () => {
		switch (realtimeStatus) {
		case 'connected':
			return <Wifi className="h-4 w-4 text-green-500" />;
		case 'loading':
			return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />;
		case 'error':
			return <WifiOff className="h-4 w-4 text-red-500" />;
		default:
			return <AlertTriangle className="h-4 w-4 text-gray-500" />;
		}
	};

	const getStatusColor = () => {
		switch (realtimeStatus) {
		case 'connected':
			return 'bg-green-100 text-green-800 border-green-200';
		case 'loading':
			return 'bg-yellow-100 text-yellow-800 border-yellow-200';
		case 'error':
			return 'bg-red-100 text-red-800 border-red-200';
		default:
			return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	};

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-sm">
					{getStatusIcon()}
          Estado de Conexión
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="flex items-center justify-between">
					<span className="text-sm text-gray-600">Estado:</span>
					<Badge className={getStatusColor()}>
						{realtimeStatus === 'connected' ? 'Conectado' : 
							realtimeStatus === 'loading' ? 'Conectando' : 'Error'}
					</Badge>
				</div>
        
				<div className="flex items-center justify-between">
					<span className="text-sm text-gray-600">Modo:</span>
					<Badge variant={isUsingFallback ? "secondary" : "default"}>
						{isUsingFallback ? 'Sin conexión' : 'Tiempo real'}
					</Badge>
				</div>
        
				<div className="flex items-center justify-between">
					<span className="text-sm text-gray-600">Vinos cargados:</span>
					<span className="text-sm font-medium">{wines.length}</span>
				</div>
        
				<div className="flex items-center justify-between">
					<span className="text-sm text-gray-600">Cargando:</span>
					<span className="text-sm font-medium">{isLoading ? 'Sí' : 'No'}</span>
				</div>
        
				{error && (
					<div className="bg-red-50 border border-red-200 rounded p-2">
						<p className="text-xs text-red-800">
							<strong>Error:</strong> {error.message}
						</p>
					</div>
				)}
        
				<Button 
					onClick={handleRefresh} 
					disabled={isRefreshing}
					size="sm"
					className="w-full"
				>
					<RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
					{isRefreshing ? 'Actualizando...' : 'Actualizar'}
				</Button>
			</CardContent>
		</Card>
	);
} 