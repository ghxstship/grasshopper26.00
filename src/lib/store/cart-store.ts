import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  type: 'ticket' | 'product';
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: {
    size?: string;
    color?: string;
    sku?: string;
  };
  eventId?: string;
  eventName?: string;
  ticketTypeId?: string;
  productId?: string;
  metadata?: Record<string, any>;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  hasItem: (id: string) => boolean;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find(i => i.id === item.id);
          
          if (existingItem) {
            // Update quantity if item already exists
            return {
              items: state.items.map(i =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          
          // Add new item
          return { items: [...state.items, item] };
        });
      },
      
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter(i => i.id !== id),
        }));
      },
      
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        
        set((state) => ({
          items: state.items.map(i =>
            i.id === id ? { ...i, quantity } : i
          ),
        }));
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getTotal: () => {
        return get().items.reduce(
          (sum, item) => sum + (item.price * item.quantity),
          0
        );
      },
      
      getItemCount: () => {
        return get().items.reduce(
          (count, item) => count + item.quantity,
          0
        );
      },
      
      hasItem: (id) => {
        return get().items.some(i => i.id === id);
      },
    }),
    {
      name: 'grasshopper-cart-storage',
    }
  )
);
