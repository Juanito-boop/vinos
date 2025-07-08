"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { AuthContextType, User } from "@/types"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>({
    id: "193eb9dc-e3ee-4aca-8672-d91484cca3ce",
    email: "",
    password: "",
    name: "Josie",
    isAdmin: true,
  })
  const [isLoading, setIsLoading] = useState(false)

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock user data
      const mockUser: User = {
        id: "193eb9dc-e3ee-4aca-8672-d91484cca3ce",
        email,
        password,
        name: "Leopold",
        isAdmin: true,
      }

      setUser(mockUser)
    } catch (error) {
      throw new Error("Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    isLoggedIn: !!user,
    login,
    logout,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
