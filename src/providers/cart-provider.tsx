"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

interface CartContextProps {
	isCartOpen: boolean
	openCart: () => void
	closeCart: () => void
	toggleCart: () => void
}

const CartContext = createContext<CartContextProps | undefined>(undefined)

interface CartProviderProps {
	children: ReactNode
}

export const CartProvider = ({ children }: CartProviderProps) => {
	const [isCartOpen, setIsCartOpen] = useState(false)

	const openCart = () => setIsCartOpen(true)
	const closeCart = () => setIsCartOpen(false)
	const toggleCart = () => setIsCartOpen(!isCartOpen)

	return (
		<CartContext.Provider value={{ isCartOpen, openCart, closeCart, toggleCart }}>
			{children}
		</CartContext.Provider>
	)
}

export function useCartModal() {
	const context = useContext(CartContext)
	if (!context) {
		throw new Error("useCartModal debe usarse dentro de un CartProvider")
	}
	return context
} 