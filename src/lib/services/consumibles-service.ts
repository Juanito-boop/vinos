import { supabase } from '@/lib/supabase';
import type { Consumibles } from '../../types';

export class ConsumiblesService {
	static async getAllConsumibles(): Promise<Consumibles[]> {
		const { data, error } = await supabase
			.from('consumibles')
			.select('*')
			.order('nombre', { ascending: true });
		if (error) throw error;
		return data as Consumibles[];
	}

	static async getConsumibleById(id: string): Promise<Consumibles | null> {
		const { data, error } = await supabase
			.from('consumibles')
			.select('*')
			.eq('id', id)
			.single();
		if (error) return null;
		return data as Consumibles;
	}

	static subscribeToConsumibles(onChange: (payload: any) => void) {
		return supabase
			.channel('public:consumibles')
			.on(
				'postgres_changes',
				{ event: '*', schema: 'public', table: 'consumibles' },
				onChange
			)
			.subscribe();
	}
} 