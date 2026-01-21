"use client"

import { useCart } from "@/hooks/use-cart"
import { WineService } from "@/lib/services/wine-service"
import type { Wine } from "@/types"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from "lucide-react"
import { formatPrice } from "@/utils/price"

interface CartViewProps {
	onBack: () => void
	wines: Wine[]
}

function CheckoutQR(
	{ cart, ciudad, direccion, nombre, onBack }:
		{ cart: any[], ciudad: string, direccion: string, nombre: string, onBack: () => void }) {
	const [timer, setTimer] = useState(60);
	const [whatsappSent, setWhatsappSent] = useState(false);
	const [popupBlocked, setPopupBlocked] = useState(false);

	useEffect(() => {
		if (timer === 0 && !whatsappSent) {
			const mensaje = encodeURIComponent(
				`Nombre: ${nombre}\nCiudad: ${ciudad}\nDirección: ${direccion}\n\n` +
				cart.map(item => `${item.nombre} ${item.variedades}\nCantidad: ${item.quantity}\nPrecio: $${item.precio}`).join("\n---\n")
			);
			const numero = "573219085857";

			// Intentar abrir WhatsApp y detectar si está bloqueado
			const whatsappWindow = window.open(`https://wa.me/${numero}?text=${mensaje}`, "_blank");

			if (whatsappWindow) {
				// La ventana se abrió correctamente
				setWhatsappSent(true);
				// Redirigir inmediatamente a la tienda
				setTimeout(() => {
					const url = new URL(window.location.href);
					url.searchParams.set("view", "store");
					window.location.href = url.toString();
				}, 1000);
			} else {
				// La ventana emergente fue bloqueada
				setPopupBlocked(true);
				setWhatsappSent(true);
				// Esperar 15 segundos antes de redirigir
				setTimeout(() => {
					const url = new URL(window.location.href);
					url.searchParams.set("view", "store");
					window.location.href = url.toString();
				}, 15000);
			}
			return;
		}

		const interval = setInterval(() => setTimer(t => t - 1), 1000);
		return () => clearInterval(interval);
	}, [timer, cart, ciudad, direccion, nombre, whatsappSent]);

	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh]">
			<h2 className="text-2xl font-bold mb-4">Escanea el QR para pagar</h2>
			<img src="/qr-pago.jpg" alt="QR de pago" className="w-56 h-56 mb-4" />

			{!whatsappSent ? (
				<>
					<p className="mb-2 max-w-3xl text-center">En 1 minuto se enviará tu pedido por WhatsApp automáticamente</p>
					<p className="mb-2 max-w-3xl text-center">Si por alguna razon no hay disponibilidad de algun producto, con su pago usted esta reservando el mismo para el siguiente pedido</p>
					<p className="text-lg font-semibold">Tiempo restante: {timer} segundos</p>
				</>
			) : popupBlocked ? (
				<>
					<p className="mb-2 max-w-3xl text-center text-orange-600 font-semibold">
						⚠️ Las ventanas emergentes están bloqueadas
					</p>
					<p className="mb-2 max-w-3xl text-center">
						Tu pedido se envió por WhatsApp. Si no se abrió automáticamente,
						puedes hacer clic en el enlace que apareció en la barra de notificaciones.
					</p>
					<p className="mb-2 max-w-3xl text-center">
						Serás redirigido a la tienda en 15 segundos para permitir que autorices la ventana emergente.
					</p>
					<p className="text-lg font-semibold text-orange-600">
						Redirigiendo en 15 segundos...
					</p>
				</>
			) : (
				<>
					<p className="mb-2 max-w-3xl text-center text-green-600 font-semibold">
						✅ Pedido enviado por WhatsApp
					</p>
					<p className="mb-2 max-w-3xl text-center">
						Tu pedido se envió correctamente. Serás redirigido a la tienda en unos segundos.
					</p>
				</>
			)}

			<Button onClick={onBack} className="mt-6">Volver al carrito</Button>
		</div>
	);
}

export function CartView({ onBack, wines }: CartViewProps) {
	const [showQR, setShowQR] = useState(false);
	const [ciudad, setCiudad] = useState("");
	const [direccion, setDireccion] = useState("");
	const [nombre, setNombre] = useState("");
	const [formOk, setFormOk] = useState(false);

	const cart = useCart(wines)

	if (showQR && formOk) {
		return <CheckoutQR cart={cart.cartItems} ciudad={ciudad} direccion={direccion} nombre={nombre} onBack={() => setShowQR(false)} />;
	}

	if (showQR && !formOk) {
		// Formulario antes del QR
		return (
			<form
				className="flex flex-col items-center justify-center min-h-[60vh] gap-4"
				onSubmit={e => {
					e.preventDefault();
					if (ciudad && direccion && nombre) setFormOk(true);
				}}
			>
				<h2 className="text-2xl font-bold mb-4">Datos de entrega</h2>
				<input
					className="border p-2 rounded w-64"
					placeholder="Nombre"
					value={nombre}
					onChange={e => setNombre(e.target.value)}
					required
				/>
				<input
					className="border p-2 rounded w-64"
					placeholder="Ciudad"
					value={ciudad}
					onChange={e => setCiudad(e.target.value)}
					required
				/>
				<input
					className="border p-2 rounded w-64"
					placeholder="Dirección"
					value={direccion}
					onChange={e => setDireccion(e.target.value)}
					required
				/>
				<Button type="submit" className="bg-primary hover:bg-primary/90 text-white w-64 h-12 rounded-xl font-bold">Continuar al pago</Button>
				<Button type="button" variant="outline" onClick={() => setShowQR(false)} className="w-64 h-12 rounded-xl border-primary/20 text-primary hover:bg-primary/5">Volver al carrito</Button>
			</form>
		);
	}

	if (cart.cartItems.length === 0) {
		return (
			<div className="min-h-screen bg-[#f0f0f0]">
				<div className="container mx-auto px-4 py-6">
					<div className="grid grid-rows-2 grid-cols-2 lg:grid-cols-4 lg:grid-rows-1 gap-4 mb-2">
						<h1 className="text-2xl font-bold text-gray-900 col-span-2 lg:col-start-2 mx-auto">Carrito de Compras</h1>
						<Button variant="outline" onClick={onBack} className="flex items-center gap-2 lg:col-start-1 lg:row-start-1">
							<ArrowLeft className="h-4 w-4" />
							Volver
						</Button>
						<Badge variant="outline" className="mx-auto px-6 py-2 bg-primary text-white font-black uppercase tracking-widest rounded-full border-none shadow-lg">
							{cart.cartItemCount} {cart.cartItemCount === 1 ? 'artículo' : 'artículos'}
						</Badge>
					</div>

					<div className="flex items-center justify-center h-64">
						<div className="text-center">
							<ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
							<h2 className="text-xl font-semibold text-gray-600 mb-2">Tu carrito está vacío</h2>
							<p className="text-gray-500 mb-4">Agrega algunos vinos para comenzar tu compra</p>
							<Button onClick={onBack} className="bg-primary hover:bg-primary/90 px-8 h-12 rounded-xl font-bold">
								Continuar Comprando
							</Button>
						</div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-[#f0f0f0]">
			<div className="container mx-auto px-4 py-6">
				<div className="grid grid-rows-2 grid-cols-2 lg:grid-cols-4 lg:grid-rows-1 gap-4 mb-2">
					<h1 className="text-2xl font-bold text-gray-900 col-span-2 lg:col-start-2 mx-auto">Carrito de Compras</h1>
					<Button variant="outline" onClick={onBack} className="flex items-center gap-2 lg:col-start-1 lg:row-start-1 ">
						<ArrowLeft className="h-4 w-4" />
						Volver
					</Button>
					<Badge variant="outline" className="mx-auto px-4 sm:px-6 py-2 bg-primary text-white font-black uppercase tracking-widest rounded-md border-none shadow-lg whitespace-nowrap text-[10px] sm:text-xs">
						{cart.cartItemCount} {cart.cartItemCount === 1 ? 'artículo' : 'artículos'}
					</Badge>
				</div>

				<p className="text-md font bold text-center mb-8 max-w-[70%] mx-auto">
					Una vez realizado el pago, comenzaremos a procesar el pedido.
					En caso de que algún producto no esté disponible, se notificará oportunamente.
					El pago garantiza la reserva de los productos disponibles.
				</p>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Lista de productos */}
					<div className="lg:col-span-2 space-y-4">
						{cart.cartItems.map((item) => {
							const wine = wines.find(w => w.id_vino === item.id_vino)
							if (!wine) return null

							return (
								<Card key={item.id_vino} className="overflow-hidden border-none shadow-sm bg-white/60 backdrop-blur-sm rounded-2xl">
									<CardContent className="p-4">
										<div className="flex gap-4">
											{/* Lado izquierdo: Imagen */}
											<div className="w-20 h-24 bg-gray-50 rounded-xl flex-shrink-0 flex items-center justify-center p-2 border border-gray-100">
												{wine.url_imagen && (
													<img
														src={wine.url_imagen}
														alt={wine.nombre}
														className="max-w-full max-h-full object-contain drop-shadow-sm"
													/>
												)}
											</div>

											{/* Lado derecho: Info y Acciones */}
											<div className="flex-1 flex flex-col justify-between min-w-0">
												<div>
													<h3 className="font-black text-sm text-gray-900 leading-tight mb-1 line-clamp-2">
														{wine.nombre} {wine.variedades.join(", ")}
													</h3>
													<p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
														{wine.wine_details.bodega} • {wine.pais_importacion}
													</p>
												</div>

												<div className="flex items-end justify-between mt-2">
													<p className="text-lg font-black text-primary tracking-tighter">
														{formatPrice(wine.precio)}
													</p>
												</div>
											</div>
										</div>

										{/* Fila inferior de acciones (Solo móvil/Tablet) */}
										<div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100/50">
											<div className="flex items-center bg-gray-100 rounded-xl p-0.5 border border-gray-200">
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 rounded-lg text-primary hover:bg-white transition-all"
													onClick={() => cart.updateQuantity(item.id_vino, item.quantity - 1)}
													disabled={item.quantity <= 1}
												>
													<Minus className="h-3.5 w-3.5" />
												</Button>
												<span className="px-3 font-black text-primary min-w-[2.5rem] text-center text-sm">{item.quantity}</span>
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 rounded-lg text-primary hover:bg-white transition-all"
													onClick={() => cart.updateQuantity(item.id_vino, item.quantity + 1)}
												>
													<Plus className="h-3.5 w-3.5" />
												</Button>
											</div>

											<Button
												variant="ghost"
												size="sm"
												onClick={() => cart.removeFromCart(item.id_vino)}
												className="text-destructive hover:text-destructive hover:bg-destructive/5 font-black text-[10px] uppercase tracking-widest pl-2 pr-3 h-9 rounded-xl transition-all border border-transparent hover:border-destructive/10"
											>
												<Trash2 className="h-4 w-4 mr-2" />
												Eliminar
											</Button>
										</div>
									</CardContent>
								</Card>
							)
						})}
					</div>

					{/* Resumen del pedido */}
					<div className="lg:col-span-1">
						<Card className="sticky top-6">
							<CardHeader>
								<CardTitle>Resumen del Pedido</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-black text-gray-400 border-b border-gray-100 pb-2 px-1">
									<span className="flex-1">Producto</span>
									<span className="w-16 text-center">Cant.</span>
									<span className="w-20 text-right">Subtotal</span>
								</div>
								<div className="divide-y divide-gray-50 max-h-[40vh] overflow-y-auto">
									{cart.cartItems.map((item) => {
										const wine = wines.find(w => w.id_vino === item.id_vino);
										if (!wine) return null;
										return (
											<div key={item.id_vino} className="flex items-center justify-between py-3 px-1 gap-3">
												<div className="flex-1 min-w-0">
													<p className="text-xs font-bold text-gray-800 truncate">{wine.nombre}</p>
													<p className="text-[10px] text-gray-400 font-medium truncate">{wine.variedades.join(", ")}</p>
												</div>
												<span className="w-16 text-center text-xs font-black text-primary bg-primary/5 py-1 rounded-lg">x{item.quantity}</span>
												<span className="w-20 text-right text-xs font-black text-gray-900">{formatPrice(wine.precio * item.quantity)}</span>
											</div>
										);
									})}
								</div>

								<div className="flex justify-between text-sm">
									<span>Envío</span>
									<span className="text-green-600">Gratis</span>
								</div>

								<div className="border-t pt-4">
									<div className="flex justify-between font-bold text-lg">
										<span>Total</span>
										<span>{formatPrice(cart.cartTotal)}</span>
									</div>
								</div>

								<Button
									className="w-full bg-primary hover:bg-primary/90 text-white h-14 rounded-2xl font-black tracking-widest shadow-xl shadow-primary/20 active:scale-[0.98] transition-all"
									onClick={() => setShowQR(true)}
								>
									PROCEDER AL PAGO
								</Button>

								<Button variant="outline" onClick={onBack} className="w-full">
									Continuar Comprando
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	)
}