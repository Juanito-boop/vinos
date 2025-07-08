"use client"

import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Wine } from "lucide-react"
import WineLogo from "./wine-logo"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      href: "https://facebook.com/losvinos",
      color: "hover:text-blue-600"
    },
    {
      name: "Instagram", 
      icon: Instagram,
      href: "https://instagram.com/losvinos",
      color: "hover:text-pink-600"
    },
    {
      name: "Twitter",
      icon: Twitter,
      href: "https://twitter.com/losvinos",
      color: "hover:text-blue-400"
    },
    {
      name: "YouTube",
      icon: Youtube,
      href: "https://youtube.com/losvinos",
      color: "hover:text-red-600"
    }
  ]

  const contactInfo = [
    {
      icon: Phone,
      text: "+56 9 1234 5678",
      href: "tel:+56912345678"
    },
    {
      icon: Mail,
      text: "info@losvinos.cl",
      href: "mailto:info@losvinos.cl"
    },
    {
      icon: MapPin,
      text: "Av. Providencia 1234, Santiago",
      href: "https://maps.google.com"
    }
  ]

  return (
    <footer className="bg-gradient-to-r from-red-900 via-red-800 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Logo y descripción */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <WineLogo className="size-10" />
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent">
                  Los Vinos
                </h3>
                <p className="text-sm text-red-200">Wine Bar</p>
              </div>
            </div>
            <p className="text-red-100 text-sm leading-relaxed mb-4">
              Descubre los mejores vinos internacionales en nuestra tienda online. 
              Vinos tintos, blancos y rosados de las mejores bodegas del mundo.
            </p>
            <div className="flex items-center gap-2 text-red-200">
              <Wine className="h-4 w-4" />
              <span className="text-sm">Desde 2010</span>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-red-100 hover:text-white transition-colors text-sm">
                  Catálogo de Vinos
                </a>
              </li>
              <li>
                <a href="#" className="text-red-100 hover:text-white transition-colors text-sm">
                  Ofertas Especiales
                </a>
              </li>
              <li>
                <a href="#" className="text-red-100 hover:text-white transition-colors text-sm">
                  Guía de Vinos
                </a>
              </li>
              <li>
                <a href="#" className="text-red-100 hover:text-white transition-colors text-sm">
                  Eventos y Catas
                </a>
              </li>
              <li>
                <a href="#" className="text-red-100 hover:text-white transition-colors text-sm">
                  Blog del Sommelier
                </a>
              </li>
            </ul>
          </div>

          {/* Información de contacto */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Contacto</h4>
            <ul className="space-y-3">
              {contactInfo.map((contact, index) => (
                <li key={index}>
                  <a 
                    href={contact.href}
                    className="flex items-center gap-3 text-red-100 hover:text-white transition-colors text-sm"
                  >
                    <contact.icon className="h-4 w-4 flex-shrink-0" />
                    <span>{contact.text}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Redes sociales */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Síguenos</h4>
            <p className="text-red-100 text-sm mb-4">
              Mantente al día con nuestras novedades, ofertas especiales y eventos.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 bg-white/10 rounded-lg transition-all duration-200 hover:bg-white/20 ${social.color}`}
                  aria-label={`Síguenos en ${social.name}`}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-red-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-red-200 text-sm">
              © {currentYear} Los Vinos. Todos los derechos reservados.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-red-200 hover:text-white transition-colors">
                Política de Privacidad
              </a>
              <a href="#" className="text-red-200 hover:text-white transition-colors">
                Términos y Condiciones
              </a>
              <a href="#" className="text-red-200 hover:text-white transition-colors">
                Política de Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 