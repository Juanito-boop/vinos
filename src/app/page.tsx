import { Metadata } from "next"
import { WineService } from "@/lib/services/wine-service"
import WineStore from "@/components/store/wine-store"
import { ConsumiblesRealtimeProvider } from "@/hooks/use-consumibles";

export const metadata: Metadata = {
	title: "Los Vinos - Tienda Online de Vinos Internacionales",
	description: "Descubre los mejores vinos internacionales en nuestra tienda online. Vinos tintos, blancos y rosados de las mejores bodegas del mundo. Envío a domicilio.",
	keywords: "vinos, tienda de vinos, vinos online, vinos tintos, vinos blancos, bodegas, comprar vinos",
	authors: [{ name: "Los Vinos" }],
	creator: "Los Vinos",
	publisher: "Los Vinos",
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	metadataBase: new URL('https://wines-theta.vercel.app'),
	alternates: {
		canonical: '/',
	},
	openGraph: {
		title: "Los Vinos - Tienda Online de Vinos Internacionales",
		description: "Descubre los mejores vinos internacionales en nuestra tienda online. Vinos tintos, blancos y rosados de las mejores bodegas del mundo.",
		url: 'https://wines-theta.vercel.app',
		siteName: 'Los Vinos',
		images: [
			{
				url: '/logo.svg',
				width: 1200,
				height: 630,
				alt: 'Los Vinos - Tienda Online de Vinos',
			},
		],
		locale: 'es_ES',
		type: 'website',
	},
	twitter: {
		card: 'summary_large_image',
		title: "Los Vinos - Tienda Online de Vinos Internacionales",
		description: "Descubre los mejores vinos internacionales en nuestra tienda online.",
		images: ['/logo.svg'],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
}

export const revalidate = 60;

export default async function HomePage() {
	const wines = await WineService.getAllWines();
	return (
		<main className="min-h-screen">
			{Array.isArray(wines) ? (
				<ConsumiblesRealtimeProvider>
					<WineStore wines={wines} />
				</ConsumiblesRealtimeProvider>
			) : (
				<div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
					<div className="bg-destructive/5 border border-destructive/20 p-8 rounded-[2rem] max-w-md">
						<h2 className="text-2xl font-black text-destructive mb-4 tracking-tight">Vaya, algo salió mal</h2>
						<p className="text-gray-600 font-medium">
              No pudimos cargar nuestra selección de vinos en este momento. Por favor, refresca la página o inténtalo de nuevo más tarde.
						</p>
					</div>
				</div>
			)}
		</main>
	)
}
