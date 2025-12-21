"use client"

import React from 'react';
import { useEffect, useState, useRef, useCallback, createContext, useContext } from 'react';
import type { Consumibles } from '../types';
import { ConsumiblesService } from '../lib/services/consumibles-service';

interface UseConsumiblesReturn {
	consumibles: Consumibles[];
	isLoading: boolean;
	error: Error | null;
	refetch: () => Promise<void>;
	isUsingFallback: boolean;
}

const ConsumiblesRealtimeContext = createContext<UseConsumiblesReturn | null>(null);

export function useConsumiblesRealtimeProvider(): UseConsumiblesReturn {
	const [consumibles, setConsumibles] = useState<Consumibles[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [isUsingFallback, setIsUsingFallback] = useState(false);
	const channelRef = useRef<any>(null);

	const fetchConsumibles = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const data = await ConsumiblesService.getAllConsumibles();
			setConsumibles(data);
			setIsUsingFallback(false);
		} catch (err: any) {
			setError(err instanceof Error ? err : new Error('Error al cargar consumibles'));
			setIsUsingFallback(true);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchConsumibles();
		if (channelRef.current) {
			channelRef.current.unsubscribe && channelRef.current.unsubscribe();
		}
		channelRef.current = ConsumiblesService.subscribeToConsumibles(() => {
			fetchConsumibles();
		});
		return () => {
			if (channelRef.current && channelRef.current.unsubscribe) channelRef.current.unsubscribe();
		};
	}, [fetchConsumibles]);

	return {
		consumibles,
		isLoading,
		error,
		refetch: fetchConsumibles,
		isUsingFallback,
	};
}

export function useConsumiblesRealtimeContext() {
	const ctx = useContext(ConsumiblesRealtimeContext);
	if (!ctx) throw new Error('useConsumiblesRealtimeContext debe usarse dentro de ConsumiblesRealtimeProvider');
	return ctx;
}

export function ConsumiblesRealtimeProvider({ children }: { children: React.ReactNode }) {
	const value = useConsumiblesRealtimeProvider();
	return (
		<ConsumiblesRealtimeContext.Provider value={value}>
			{children}
		</ConsumiblesRealtimeContext.Provider>
	);
}

// Hook principal para consumir en componentes
export function useConsumibles() {
	return useConsumiblesRealtimeContext();
} 