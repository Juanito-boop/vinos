#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
// require('dotenv').config({ path: '.env.local' }); // Eliminado: no usar dotenv

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Verificando configuración de Supabase...\n');

// Verificar variables de entorno
console.log('1. Variables de entorno:');
console.log(`   URL: ${supabaseUrl ? '✅ Configurada' : '❌ No configurada'}`);
console.log(`   Anon Key: ${supabaseAnonKey ? '✅ Configurada' : '❌ No configurada'}`);

if (!supabaseUrl || !supabaseAnonKey) {
	console.log('\n❌ Error: Variables de entorno faltantes');
	console.log('   Crea un archivo .env.local con las siguientes variables:');
	console.log('   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
	console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here');
	process.exit(1);
}

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkConnection() {
	console.log('\n2. Conexión a Supabase:');
  
	try {
		const { data, error } = await supabase
			.from('wines')
			.select('id_vino')
			.limit(1);

		if (error) {
			console.log(`   ❌ Error de conexión: ${error.message}`);
			return false;
		}

		console.log('   ✅ Conexión exitosa');
		console.log(`   ✅ Acceso a tabla 'wines': ${data !== null ? 'Sí' : 'No'}`);
		return true;
	} catch (error) {
		console.log(`   ❌ Error de conexión: ${error.message}`);
		return false;
	}
}

async function checkRealtime() {
	console.log('\n3. Verificación de Realtime:');
  
	return new Promise((resolve) => {
		const channel = supabase
			.channel('config-test')
			.on('postgres_changes', { event: '*', schema: 'public', table: 'wines' }, () => {})
			.subscribe((status) => {
				if (status === 'SUBSCRIBED') {
					console.log('   ✅ Realtime funcionando correctamente');
					supabase.removeChannel(channel);
					resolve(true);
				} else if (status === 'CHANNEL_ERROR') {
					console.log('   ❌ Error en Realtime');
					supabase.removeChannel(channel);
					resolve(false);
				}
			});

		// Timeout después de 10 segundos
		setTimeout(() => {
			console.log('   ⚠️  Timeout en verificación de Realtime');
			supabase.removeChannel(channel);
			resolve(false);
		}, 10000);
	});
}

async function main() {
	const connectionOk = await checkConnection();
  
	if (connectionOk) {
		await checkRealtime();
	}

	console.log('\n📋 Resumen:');
	console.log('   - Variables de entorno: ✅');
	console.log(`   - Conexión: ${connectionOk ? '✅' : '❌'}`);
  
	if (connectionOk) {
		console.log('   - Realtime: Verificado');
	}

	console.log('\n💡 Si hay problemas:');
	console.log('   1. Verifica que tu proyecto de Supabase esté activo');
	console.log('   2. Asegúrate de que Realtime esté habilitado en Database > Replication');
	console.log('   3. Verifica las políticas RLS en la tabla wines');
	console.log('   4. Consulta el archivo SUPABASE_SETUP.md para más detalles');
}

main().catch(console.error); 