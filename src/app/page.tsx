import { Metadata } from "next"
import WineStore from "@/components/wine-store"

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
  metadataBase: new URL('https://tu-dominio.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Los Vinos - Tienda Online de Vinos Internacionales",
    description: "Descubre los mejores vinos internacionales en nuestra tienda online. Vinos tintos, blancos y rosados de las mejores bodegas del mundo.",
    url: 'https://tu-dominio.com',
    siteName: 'Los Vinos',
    images: [
      {
        url: '/og-image.jpg',
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
}

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <WineStore />
    </main>
  )
}
