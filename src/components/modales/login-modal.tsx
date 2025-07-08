"use client"

import { useState } from "react"
import { User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { useAuth } from "@/providers/auth-provider"

export function LoginModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login, isLoading } = useAuth()

  const handleLogin = async () => {
    try {
      await login(email, password)
      setIsOpen(false)
      setEmail("")
      setPassword("")
    } catch (error) {
      console.error("Error al iniciar sesión:", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" aria-label="Iniciar sesión">
          <User className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Iniciar Sesión</DialogTitle>
          <DialogDescription>
            Ingresa tus credenciales para acceder a tu cuenta
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <Input 
              id="email"
              placeholder="Email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              aria-describedby="email-description"
            />
            <p id="email-description" className="sr-only">Ingresa tu dirección de email</p>
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Contraseña</label>
            <Input
              id="password"
              placeholder="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-describedby="password-description"
            />
            <p id="password-description" className="sr-only">Ingresa tu contraseña</p>
          </div>
          <Button 
            onClick={handleLogin} 
            disabled={isLoading} 
            className="w-full bg-red-600 hover:bg-red-700"
            aria-describedby="login-status"
          >
            {isLoading ? "Iniciando..." : "Iniciar Sesión"}
          </Button>
          <p id="login-status" className="sr-only" aria-live="polite">
            {isLoading ? "Iniciando sesión..." : "Listo para iniciar sesión"}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
