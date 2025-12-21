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
		<footer className="bg-[#1a0a0c] text-white border-t border-primary/20">
			<div className="container mx-auto px-6 py-16">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

					{/* Logo y descripción */}
					<div className="lg:col-span-2 space-y-6">
						<div className="flex items-center gap-4">
							<div className="relative">
								<div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
								<WineLogo className="size-14 relative" />
							</div>
							<div>
								<h3 className="text-3xl font-black bg-gradient-to-r from-white via-primary/50 to-red-400 bg-clip-text text-transparent tracking-tighter">
                  Los Vinos
								</h3>
								<p className="text-[10px] uppercase tracking-[0.4em] font-black text-primary/60">Wine Bar</p>
							</div>
						</div>
						<p className="text-gray-400 text-sm leading-relaxed max-w-md font-medium">
              Seleccionamos meticulosamente cada etiqueta para ofrecerte una experiencia sensorial inigualable.
              Desde los valles más remotos hasta tu cava personal, celebramos el arte del buen vivir.
						</p>
						<div className="flex items-center gap-3 text-primary/80 font-bold text-[10px] uppercase tracking-widest">
							<div className="size-2 bg-primary rounded-full animate-pulse" />
							<span>Legado de Excelencia desde 2018</span>
						</div>
					</div>

					{/* Información de contacto */}
					<div className="space-y-6">
						<h4 className="text-xs uppercase tracking-[0.3em] font-black text-primary/60">CONEXIÓN</h4>
						<ul className="space-y-4">
							{contactInfo.map((contact, index) => (
								<li key={index}>
									<a
										href={contact.href}
										target="_blank"
										rel="noopener noreferrer"
										className="group flex items-center gap-4 text-gray-400 hover:text-white transition-all duration-300"
									>
										<div className="p-2 rounded-lg bg-white/5 group-hover:bg-primary/20 group-hover:text-primary transition-all">
											<contact.icon className="h-4 w-4 shrink-0" />
										</div>
										<span className="text-sm font-medium">{contact.text}</span>
									</a>
								</li>
							))}
						</ul>
					</div>

					{/* Redes sociales */}
					<div className="space-y-6">
						<h4 className="text-xs uppercase tracking-[0.3em] font-black text-primary/60">SÍGUENOS</h4>
						<p className="text-gray-400 text-sm font-medium leading-relaxed">
              Únete a nuestra comunidad de sibaritas y mantente al tanto de catas exclusivas y lanzamientos.
						</p>
						<div className="flex gap-4">
							{socialLinks.map((social) => (
								<a
									key={social.name}
									href={social.href}
									target="_blank"
									rel="noopener noreferrer"
									className={`p-4 bg-white/5 rounded-2xl transition-all duration-300 hover:scale-110 hover:bg-primary/20 text-gray-400 hover:text-white border border-white/5 hover:border-primary/30`}
									aria-label={`Síguenos en ${social.name}`}
								>
									<social.icon className="h-6 w-6" />
								</a>
							))}
						</div>
					</div>
				</div>

				{/* Línea divisoria */}
				<div className="border-t border-white/5 mt-16 pt-8">
					<div className="flex flex-col md:flex-row justify-between items-center gap-6">
						<p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">
              © {currentYear} LOS VINOS · ARTE EN CADA COPA
						</p>
						<div className="flex gap-8 text-[10px] uppercase tracking-widest font-bold">
							<a href="#" className="text-gray-500 hover:text-primary transition-colors">
                Privacidad
							</a>
							<a href="#" className="text-gray-500 hover:text-primary transition-colors">
                Términos
							</a>
							<a href="#" className="text-gray-500 hover:text-primary transition-colors">
                Cookies
							</a>
						</div>
					</div>
				</div>
			</div>
		</footer>

	)
} 