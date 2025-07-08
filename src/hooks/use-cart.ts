"use client"

import { useState, useEffect, useRef } from "react"
import type { CartItem, CartItemWithWine, Wine } from "@/types"
import { parsePrice } from "@/utils/price"
import { updateURLWithData, getDataFromURL } from "@/lib/utils"

export function useCart(wines: Wine[]) {
  const [cart, setCart] = useState<CartItem[]>([])
  const isInitialized = useRef(false)

  // Cargar carrito desde URL al inicializar
  useEffect(() => {
    const savedCart = getDataFromURL('cart')
    if (savedCart && Array.isArray(savedCart)) {
      setCart(savedCart)
    }
    isInitialized.current = true
  }, [])

  // Actualizar URL cuando cambie el carrito (después del renderizado)
  useEffect(() => {
    if (isInitialized.current) {
      updateURLWithData(cart, 'cart')
    }
  }, [cart])

  const addToCart = (wineId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === wineId)
      const newCart = existing
        ? prev.map((item) => (item.id === wineId ? { ...item, quantity: item.quantity + 1 } : item))
        : [...prev, { id: wineId, quantity: 1 }]
      return newCart
    })
  }

  const removeFromCart = (wineId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== wineId))
  }

  const updateQuantity = (wineId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(wineId)
      return
    }
    setCart((prev) => prev.map((item) => (item.id === wineId ? { ...item, quantity } : item)))
  }

  const clearCart = () => {
    setCart([])
  }

  const cartItems: CartItemWithWine[] = cart
    .map((cartItem) => {
      const wine = wines.find((w) => w.id_vino === cartItem.id)
      return wine ? { ...wine, quantity: cartItem.quantity } : null
    })
    .filter(Boolean) as CartItemWithWine[]

  const cartTotal = cartItems.reduce((total, item) => total + parsePrice(item.precio) * item.quantity, 0)

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0)

  return {
    cart,
    cartItems,
    cartTotal,
    cartItemCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  }
}
