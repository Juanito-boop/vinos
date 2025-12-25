import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/providers/auth-provider"
import { OrderStatusProvider } from "@/providers/order-status-provider"
import { CartProvider } from "@/providers/cart-provider"
import { Toaster } from "@/components/ui/sonner"
import { StructuredData } from "@/components/structured-data"
import { WineRealtimeProvider } from "@/providers/wine-realtime-provider"
import { MagicLinkProcessor } from "@/components/magic-link-processor"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
	title: {
		default: "Los Vinos | Tienda de Vinos en Villa de Leyva, Boyacá",
		template: "%s | Los Vinos"
	},
	applicationName: "Los Vinos",
	description: "Tu tienda de vinos preferida en Villa de Leyva, Boyacá. Descubre los mejores vinos internacionales, tintos, blancos y rosados. Envío a domicilio.",
	keywords: ["vinos Villa de Leyva", "tienda de vinos Boyacá", "Los Vinos Villa de Leyva", "vinos internacionales Colombia", "bodegas"],
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
		type: 'website',
		locale: 'es_ES',
		url: 'https://wines-theta.vercel.app',
		siteName: 'Los Vinos',
		title: 'Los Vinos - Tienda Online de Vinos Internacionales',
		description: 'Descubre los mejores vinos internacionales en nuestra tienda online.',
		images: [
			{
				url: '/og-image.jpg',
				width: 1200,
				height: 630,
				alt: 'Los Vinos - Tienda Online de Vinos',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Los Vinos - Tienda Online de Vinos Internacionales',
		description: 'Descubre los mejores vinos internacionales en nuestra tienda online.',
		images: ['/og-image.jpg'],
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
	icons: {
		icon: [
			{ url: '/logo.svg' },
			{ url: '/logo.svg', sizes: '16x16', type: 'image/svg' },
			{ url: '/logo.svg', sizes: '32x32', type: 'image/svg' },
		],
		apple: [
			{ url: '/logo.svg', sizes: '180x180', type: 'image/svg' },
		],
	},
	manifest: '/manifest.json',
	verification: {
		google: 'tu-google-verification-code',
	},
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="es">
			<head>
				<meta name="theme-color" content="#722f37" />
				<meta name="msapplication-TileColor" content="#722f37" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
				<meta name="apple-mobile-web-app-title" content="Los Vinos" />
				<meta name="application-name" content="Los Vinos" />
				<meta name="mobile-web-app-capable" content="yes" />
				<StructuredData type="website" />
				<StructuredData type="organization" />
			</head>
			{/* <meta name="google-site-verification" content="wnH05C4Cz3Cm83oxrFRPXSiPKm5vU9Ky0qYeli8ka-M" /> */}
			<body className={inter.className}>
				<WineRealtimeProvider>
					<AuthProvider>
						<MagicLinkProcessor />
						<OrderStatusProvider>
							<CartProvider>
								{children}
							</CartProvider>
						</OrderStatusProvider>
					</AuthProvider>
				</WineRealtimeProvider>
				<Toaster position="bottom-left" richColors />
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	)
}
