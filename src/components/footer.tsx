import { Instagram, Mail, Phone, MapPin, Wine } from "lucide-react"
import WineLogo from "./wine-logo"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    {
      name: "Instagram", 
      icon: Instagram,
      href: "https://www.instagram.com/losvinosvilladeleyva?igsh=amY1bzh5N2xkbHg1",
      color: "hover:text-pink-600"
    }
  ]

  const contactInfo = [
    {
      icon: Phone,
      text: "+57 321 908 5857",
      href: "tel:+573219085857"
    },
    {
      icon: Mail,
      text: "ventas@vinosdelavilla.com",
      href: "mailto:ventas@vinosdelavilla.com"
    },
    {
      icon: MapPin,
      text: "Cra. 9 #11-47, Villa de Leyva, Boyacá",
      href: "https://maps.google.com/maps/place/LOS+VINOS+WINE+BAR/@5.6328072,-73.5239815,21z/data=!4m6!3m5!1s0x8e41d7122d492603:0x7667f05f2e9e45ea!8m2!3d5.6328438!4d-73.5240519!16s%2Fg%2F11gfls7d7m?entry=ttu&g_ep=EgoyMDI1MDcwNi4wIKXMDSoASAFQAw%3D%3D"
    }
  ]

  return (
    <footer className="bg-gradient-to-r from-red-900 via-red-800 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Logo y descripción */}
          <div className="lg:col-span-2">
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
              <span className="text-sm">Desde 2018</span>
            </div>
          </div>

          {/* Información de contacto */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Contacto</h4>
            <ul className="space-y-3">
              {contactInfo.map((contact, index) => (
                <li key={index}>
                  <a 
                    href={contact.href}
                    target="_blank"
                    rel="noopener noreferrer"
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