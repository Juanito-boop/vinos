"use client"

import { useState } from "react"
import { User, Mail, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { useAuth } from "@/providers/auth-provider"

export function LoginModal() {
	const [isOpen, setIsOpen] = useState(false)
	const [email, setEmail] = useState("")
	const [emailSent, setEmailSent] = useState(false)
	const [error, setError] = useState("")
	const { login, isLoading, isProcessingMagicLink } = useAuth()

	const handleLogin = async () => {
		if (!email) {
			setError("Por favor ingresa tu email");
			return;
		}

		setError("");
		try {
			await login(email)
			setEmailSent(true)
		} catch (error: any) {
			setError(error.message || "Error al enviar el enlace de acceso")
		}
	}

	const handleClose = () => {
		setIsOpen(false)
		setEmail("")
		setEmailSent(false)
		setError("")
	}

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			handleClose()
		} else {
			setIsOpen(true)
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button variant="outline" aria-label="Iniciar sesión">
					<User className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						{emailSent ? <CheckCircle className="h-5 w-5 text-green-600" /> : <User className="h-5 w-5" />}
						{emailSent ? "Enlace Enviado" : "Iniciar Sesión"}
					</DialogTitle>
					<DialogDescription>
						{emailSent
							? "Revisa tu email y haz clic en el enlace para acceder"
							: "Ingresa tu email para recibir un enlace de acceso seguro"
						}
					</DialogDescription>
				</DialogHeader>

				{!emailSent ? (
					<div className="space-y-4">
						<div>
							<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
							</label>
							<Input
								id="email"
								placeholder="tu@email.com"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
								disabled={isLoading}
								className={error ? "border-destructive focus-visible:ring-destructive" : ""}
							/>
							{error && (
								<p className="text-sm text-destructive mt-1 flex items-center gap-1 font-medium">
									<AlertCircle className="h-4 w-4" />
									{error}
								</p>
							)}
						</div>

						<Button
							onClick={handleLogin}
							disabled={isLoading || !email}
							className="w-full bg-primary hover:bg-primary/90 h-12 rounded-xl font-bold transition-all shadow-lg shadow-primary/10"
						>
							{isLoading ? (
								<div className="flex items-center gap-2">
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Enviando...
								</div>
							) : (
								<div className="flex items-center gap-2">
									<Mail className="h-4 w-4" />
                  Enviar Enlace de Acceso
								</div>
							)}
						</Button>

						<p className="text-xs text-gray-500 text-center">
              Te enviaremos un enlace seguro a tu email para acceder sin contraseña
						</p>
					</div>
				) : (
					<div className="space-y-4">
						<div className="text-center py-4">
							<CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
							<p className="text-sm text-gray-600 mb-2">
                Enlace enviado a <strong>{email}</strong>
							</p>
							<p className="text-xs text-gray-500">
                Revisa tu bandeja de entrada y spam. El enlace expira en 1 hora.
							</p>
						</div>

						<div className="space-y-2">
							<Button
								onClick={() => setEmailSent(false)}
								variant="outline"
								className="w-full"
							>
                Enviar a otro email
							</Button>
							<Button
								onClick={handleClose}
								className="w-full bg-gray-600 hover:bg-gray-700"
							>
                Cerrar
							</Button>
						</div>
					</div>
				)}

				{isProcessingMagicLink && (
					<div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg backdrop-blur-[2px]">
						<div className="text-center">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
							<p className="text-sm font-bold text-primary">Procesando enlace de acceso...</p>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	)
}
