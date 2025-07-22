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
        <div className="text-center py-10 text-red-600">
          Error al cargar los vinos. Por favor, inténtalo de nuevo más tarde.
        </div>
      )}
    </main>
  )
}
