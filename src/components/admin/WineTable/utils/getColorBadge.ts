export function getColorBadge(color: string): string {
  const colorClasses = {
    Tinto: "bg-red-100 text-red-800 border-red-200",
    Blanco: "bg-amber-100 text-amber-800 border-amber-200",
    Rosé: "bg-pink-100 text-pink-800 border-pink-200",
    Espumoso: "bg-blue-100 text-blue-800 border-blue-200",
  }

  return colorClasses[color as keyof typeof colorClasses] || "bg-gray-100 text-gray-800 border-gray-200"
}
