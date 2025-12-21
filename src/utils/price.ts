export function formatPrice(price: number): string {
	return `$${price.toLocaleString()}`
}

export function parsePrice(price: number): number {
	return price
}

export function getCountryFlag(country: string): string {
	const flags: Record<string, string> = {
		Argentina: "🇦🇷",
		Chile: "🇨🇱",
		Uruguay: "🇺🇾",
		"Estados Unidos": "🇺🇸",
		España: "🇪🇸",
		Francia: "🇫🇷",
		Italia: "🇮🇹",
		Portugal: "🇵🇹",
		Colombia: "🇨🇴",
		Russia: "🇷🇺",
		Mexico: "🇲🇽"
	}
	return flags[country] || "🍷"
}
