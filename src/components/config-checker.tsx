"use client"

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface ConfigStatus {
  envVars: boolean;
  connection: boolean;
  realtime: boolean;
  tableAccess: boolean;
}

export function ConfigChecker() {
	const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null);
	const [isChecking, setIsChecking] = useState(true);

	useEffect(() => {
		const checkConfiguration = async () => {
			const status: ConfigStatus = {
				envVars: false,
				connection: false,
				realtime: false,
				tableAccess: false,
			};

			try {
				// Verificar variables de entorno
				const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
				const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
				status.envVars = hasUrl && hasKey;

				if (!status.envVars) {
					setConfigStatus(status);
					setIsChecking(false);
					return;
				}

				// Verificar conexión básica
				try {
					const { data, error } = await supabase
						.from("wines")
						.select("id_vino")
						.limit(1);

					status.connection = !error;
					status.tableAccess = !error && data !== null;
				} catch (error) {
					console.error("Error checking connection:", error);
					status.connection = false;
					status.tableAccess = false;
				}

				// Verificar realtime (esto es más complejo, solo verificamos que no haya errores inmediatos)
				try {
					const channel = supabase
						.channel("config-test")
						.on("postgres_changes", { event: "*", schema: "public", table: "wines" }, () => {})
						.subscribe((status) => {
							if (status === "SUBSCRIBED") {
								setConfigStatus(prev => prev ? { ...prev, realtime: true } : null);
								supabase.removeChannel(channel);
							} else if (status === "CHANNEL_ERROR") {
								setConfigStatus(prev => prev ? { ...prev, realtime: false } : null);
								supabase.removeChannel(channel);
							}
						});

					// Timeout para evitar esperar indefinidamente
					setTimeout(() => {
						if (configStatus?.realtime === undefined) {
							setConfigStatus(prev => prev ? { ...prev, realtime: false } : null);
							supabase.removeChannel(channel);
						}
					}, 5000);
				} catch (error) {
					console.error("Error checking realtime:", error);
					status.realtime = false;
				}

				setConfigStatus(status);
			} catch (error) {
				console.error("Error in configuration check:", error);
				setConfigStatus(status);
			} finally {
				setIsChecking(false);
			}
		};

		checkConfiguration();
	}, []);

	if (isChecking) {
		return (
			<Alert className="mb-4">
				<AlertTriangle className="h-4 w-4" />
				<AlertTitle>Verificando configuración...</AlertTitle>
				<AlertDescription>
          Comprobando la configuración de Supabase...
				</AlertDescription>
			</Alert>
		);
	}

	if (!configStatus) {
		return null;
	}

	const allGood = Object.values(configStatus).every(Boolean);
	const hasErrors = Object.values(configStatus).some(status => !status);

	if (allGood) {
		return (
			<Alert className="mb-4 border-green-200 bg-green-50">
				<CheckCircle className="h-4 w-4 text-green-600" />
				<AlertTitle className="text-green-800">Configuración correcta</AlertTitle>
				<AlertDescription className="text-green-700">
          Todas las configuraciones de Supabase están funcionando correctamente.
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<Alert className="mb-4 border-red-200 bg-red-50">
			<XCircle className="h-4 w-4 text-red-600" />
			<AlertTitle className="text-red-800">Problemas de configuración detectados</AlertTitle>
			<AlertDescription className="text-red-700 space-y-1">
				<div>Se encontraron los siguientes problemas:</div>
				<ul className="list-disc list-inside space-y-1 text-sm">
					{!configStatus.envVars && (
						<li>Variables de entorno de Supabase no configuradas</li>
					)}
					{!configStatus.connection && (
						<li>No se puede conectar a Supabase</li>
					)}
					{!configStatus.tableAccess && (
						<li>No se puede acceder a la tabla de vinos</li>
					)}
					{!configStatus.realtime && (
						<li>Realtime no está funcionando correctamente</li>
					)}
				</ul>
				<div className="text-xs mt-2">
          Consulta el archivo SUPABASE_SETUP.md para más información sobre cómo solucionar estos problemas.
				</div>
			</AlertDescription>
		</Alert>
	);
} 