'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CartItem } from '@/lib/types/production-advances';

interface AdvanceCartContextType {
  items: CartItem[];
  itemCount: number;
  isCartOpen: boolean;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  updateItem: (id: string, updates: Partial<CartItem>) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const AdvanceCartContext = createContext<AdvanceCartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'gvteway_advance_cart';

export const AdvanceCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setItems(parsed);
      } catch (error) {
        console.error('Failed to parse saved cart:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } else {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, [items]);

  const addItem = useCallback((newItem: Omit<CartItem, 'id'>) => {
    const id = `cart-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const cartItem: CartItem = { ...newItem, id };
    
    setItems((prev) => [...prev, cartItem]);
    setIsCartOpen(true); // Auto-open cart when item is added
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<CartItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const openCart = useCallback(() => {
    setIsCartOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  const toggleCart = useCallback(() => {
    setIsCartOpen((prev) => !prev);
  }, []);

  const value: AdvanceCartContextType = {
    items,
    itemCount: items.length,
    isCartOpen,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    openCart,
    closeCart,
    toggleCart,
  };

  return (
    <AdvanceCartContext.Provider value={value}>
      {children}
    </AdvanceCartContext.Provider>
  );
};

export const useAdvanceCart = () => {
  const context = useContext(AdvanceCartContext);
  if (context === undefined) {
    throw new Error('useAdvanceCart must be used within an AdvanceCartProvider');
  }
  return context;
};
