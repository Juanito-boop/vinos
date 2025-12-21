/**
 * Desencriptador de estado de URL de Wine Store
 * Uso: node scripts/decrypt-url-state.js "TU_PARAMETRO_S_AQUI"
 */

const ENCRYPTION_KEY = "wine-store-secret-key-2024";

/**
 * Desencripta una cadena Base64URL al objeto original.
 */
function decryptData(encryptedString) {
	try {
		if (!encryptedString) return null;

		// Convertir de base64url a base64
		let base64 = encryptedString.replace(/-/g, '+').replace(/_/g, '/');
		while (base64.length % 4) base64 += '=';

		const binary = atob(base64);
		const uint8Array = new Uint8Array(binary.length);
		const keyArray = new TextEncoder().encode(ENCRYPTION_KEY);

		for (let i = 0; i < binary.length; i++) {
			uint8Array[i] = binary.charCodeAt(i) ^ keyArray[i % keyArray.length];
		}

		const jsonString = new TextDecoder().decode(uint8Array);
		return JSON.parse(jsonString);
	} catch (error) {
		console.error('Error al desencriptar:', error.message);
		return null;
	}
}

// Ejecución desde línea de comandos
const paramS = process.argv[2];

if (!paramS) {
	console.log("\x1b[31mError: Debes proporcionar el parámetro 's' como argumento.\x1b[0m");
	console.log("Ejemplo: node scripts/decrypt-url-state.js Ul4sQB9BA...");
	process.exit(1);
}

const result = decryptData(paramS);

if (result) {
	console.log("\x1b[32m--- Estado Desencriptado ---\x1b[0m");
	console.log(JSON.stringify(result, null, 2));
} else {
	console.log("\x1b[31mNo se pudo desencriptar el parámetro. Verifica que sea válido.\x1b[0m");
}
