'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    variantName?: string;
}

interface CartContextType {
    cart: CartItem[];
    addItem: (item: any) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, qr: number) => void;
    clearCart: () => void;
    total: number;
    count: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);

    const addItem = (item: any) => {
        setCart((prev) => {
            const existing = prev.find((i) => i.id === item.id);
            if (existing) {
                if (item.quantity === 0) return prev.filter((i) => i.id !== item.id);
                return prev.map((i) => (i.id === item.id ? { ...i, quantity: item.quantity } : i));
            }
            return [...prev, item];
        });
    };

    const removeItem = (id: string) => {
        setCart((prev) => prev.filter((i) => i.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(id);
        } else {
            setCart((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
        }
    };

    const clearCart = () => setCart([]);

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addItem, removeItem, updateQuantity, clearCart, total, count }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
