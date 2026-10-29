import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  CartItem,
  getCart,
  addToCart as libAddToCart,
  removeFromCart as libRemoveFromCart,
  updateQuantity as libUpdateQuantity,
  clearCart as libClearCart,
  getCartTotal as libGetCartTotal,
  getCartCount as libGetCartCount
} from '../lib/cart';

interface CartContextType {
  cart: CartItem[];
  itemCount: number;
  cartTotal: number;
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (id: string | number) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [itemCount, setItemCount] = useState<number>(0);
  const [cartTotal, setCartTotal] = useState<number>(0);

  const refreshCart = () => {
    const items = getCart();
    setCart(items);
    setItemCount(libGetCartCount());
    setCartTotal(libGetGetCartTotal(items));
  };

  function libGetGetCartTotal(items: CartItem[]): number {
    return items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }

  useEffect(() => {
    refreshCart();

    const handleUpdate = () => {
      refreshCart();
    };

    window.addEventListener('cart-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('cart-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const addToCart = (product: any, quantity: number = 1) => {
    libAddToCart(product, quantity);
    refreshCart();
  };

  const removeFromCart = (id: string | number) => {
    libRemoveFromCart(id);
    refreshCart();
  };

  const updateQuantity = (id: string | number, quantity: number) => {
    libUpdateQuantity(id, quantity);
    refreshCart();
  };

  const clearCart = () => {
    libClearCart();
    refreshCart();
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
