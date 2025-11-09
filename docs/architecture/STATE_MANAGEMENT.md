# GVTEWAY State Management Guide

**Status:** ✅ Enterprise-Grade  
**Last Updated:** 2025-01-09  
**Owner:** Engineering Team

---

## Overview

This document defines the state management architecture for GVTEWAY, covering client-side state, server state, and global state patterns.

---

## Table of Contents

1. [State Types](#state-types)
2. [State Management Tools](#state-management-tools)
3. [Architecture Patterns](#architecture-patterns)
4. [Implementation Guidelines](#implementation-guidelines)
5. [Best Practices](#best-practices)

---

## State Types

### 1. Server State
**Definition:** Data that originates from the server  
**Examples:** Events, orders, user profiles, analytics  
**Tool:** React Query (TanStack Query)

```typescript
// Server state - managed by React Query
const { data: event } = useQuery({
  queryKey: ['event', eventId],
  queryFn: () => fetchEvent(eventId),
  staleTime: 5 * 60 * 1000,
});
```

### 2. Client State
**Definition:** UI state that doesn't need to persist  
**Examples:** Modal open/closed, form state, UI preferences  
**Tool:** React useState, useReducer

```typescript
// Client state - managed by React hooks
const [isOpen, setIsOpen] = useState(false);
const [selectedTab, setSelectedTab] = useState('details');
```

### 3. Global Client State
**Definition:** Client state shared across components  
**Examples:** Cart, theme, user preferences  
**Tool:** Zustand

```typescript
// Global client state - managed by Zustand
const { items, addItem } = useCartStore();
const { theme, setTheme } = useThemeStore();
```

### 4. Persistent State
**Definition:** State that survives page refreshes  
**Examples:** Cart contents, user preferences, auth tokens  
**Tool:** Zustand with persist middleware, localStorage

```typescript
// Persistent state - Zustand with persist
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => ({ 
        items: [...state.items, item] 
      })),
    }),
    { name: 'gvteway-cart' }
  )
);
```

### 5. URL State
**Definition:** State reflected in the URL  
**Examples:** Search filters, pagination, selected items  
**Tool:** Next.js router, useSearchParams

```typescript
// URL state - managed by Next.js router
const searchParams = useSearchParams();
const page = searchParams.get('page') || '1';
const filter = searchParams.get('filter') || 'all';
```

---

## State Management Tools

### React Query (TanStack Query)
**Use For:** All server state  
**Configuration:** `/src/lib/query-client.ts`

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,     // 5 minutes
      gcTime: 10 * 60 * 1000,       // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

### Zustand
**Use For:** Global client state  
**Location:** `/src/lib/stores/`

```typescript
// Store structure
/src/lib/stores/
  ├── cart.store.ts        // Shopping cart
  ├── theme.store.ts       // Theme preferences
  ├── user.store.ts        // User preferences
  └── ui.store.ts          // UI state (modals, etc.)
```

### React Hooks
**Use For:** Local component state  
**Built-in:** useState, useReducer, useContext

```typescript
// Local state
const [count, setCount] = useState(0);

// Complex local state
const [state, dispatch] = useReducer(reducer, initialState);
```

---

## Architecture Patterns

### Pattern 1: Server State with React Query

```typescript
// hooks/use-event.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useEvent(eventId: string) {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();
      
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: EventData }) => {
      const { data: updated, error } = await supabase
        .from('events')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return updated;
    },
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['event', data.id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
```

### Pattern 2: Global State with Zustand

```typescript
// stores/cart.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => set((state) => ({
        items: [...state.items, item],
      })),
      
      removeItem: (id) => set((state) => ({
        items: state.items.filter(i => i.id !== id),
      })),
      
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'gvteway-cart',
      version: 1,
    }
  )
);
```

### Pattern 3: Optimistic Updates

```typescript
export function useOptimisticUpdate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateEvent,
    
    // Optimistic update
    onMutate: async (newEvent) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['event', newEvent.id] });
      
      // Snapshot previous value
      const previous = queryClient.getQueryData(['event', newEvent.id]);
      
      // Optimistically update
      queryClient.setQueryData(['event', newEvent.id], newEvent);
      
      return { previous };
    },
    
    // Rollback on error
    onError: (err, newEvent, context) => {
      queryClient.setQueryData(
        ['event', newEvent.id],
        context?.previous
      );
    },
    
    // Always refetch after error or success
    onSettled: (newEvent) => {
      queryClient.invalidateQueries({ queryKey: ['event', newEvent?.id] });
    },
  });
}
```

### Pattern 4: Realtime State with Supabase

```typescript
// hooks/use-realtime-event.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

export function useRealtimeEvent(eventId: string) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const channel = supabase
      .channel(`event:${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
          filter: `id=eq.${eventId}`,
        },
        (payload) => {
          // Update cache with realtime data
          queryClient.setQueryData(['event', eventId], payload.new);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, queryClient]);
}
```

### Pattern 5: Derived State

```typescript
// Derive state from stores
export const useCartTotal = () => {
  const items = useCartStore((state) => state.items);
  
  // Derived value - computed on each render
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

// Or use selectors for better performance
export const useCartStore = create<CartStore>((set) => ({
  items: [],
  // ... actions
}));

// Selector - only re-renders when total changes
export const useCartTotal = () => 
  useCartStore((state) => 
    state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
```

---

## Implementation Guidelines

### When to Use Each Tool

| State Type | Tool | Example |
|------------|------|---------|
| Server data (read) | React Query | Events, artists, orders |
| Server data (write) | React Query mutations | Create/update/delete |
| Global UI state | Zustand | Cart, theme, preferences |
| Local UI state | useState | Modal open, form input |
| Complex local state | useReducer | Multi-step forms |
| URL-based state | Next.js router | Filters, pagination |
| Persistent state | Zustand + persist | Cart, preferences |
| Realtime data | React Query + Supabase | Live updates |

### State Colocation

**Principle:** Keep state as close to where it's used as possible

```typescript
// ❌ Bad - Global state for local concern
const useModalStore = create((set) => ({
  isProfileModalOpen: false,
  isSettingsModalOpen: false,
  // ... 50 more modal states
}));

// ✅ Good - Local state for local concern
function ProfileModal() {
  const [isOpen, setIsOpen] = useState(false);
  // ...
}
```

### State Synchronization

```typescript
// Sync Zustand with React Query
export function useSyncCartWithServer() {
  const { items } = useCartStore();
  const { mutate: syncCart } = useMutation({
    mutationFn: (items: CartItem[]) => 
      supabase.from('carts').upsert({ items }),
  });
  
  useEffect(() => {
    // Debounce sync
    const timer = setTimeout(() => {
      syncCart(items);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [items, syncCart]);
}
```

---

## Best Practices

### DO ✅

1. **Use React Query for server state** - Don't reinvent the wheel
2. **Colocate state** - Keep it close to where it's used
3. **Use selectors** - Prevent unnecessary re-renders
4. **Normalize data** - Store by ID, not nested
5. **Implement optimistic updates** - Better UX
6. **Handle loading/error states** - Always
7. **Use TypeScript** - Type your state
8. **Persist critical state** - Cart, preferences
9. **Clean up subscriptions** - Prevent memory leaks
10. **Test state logic** - Unit test stores and hooks

### DON'T ❌

1. **Don't use global state for everything** - Overuse leads to complexity
2. **Don't duplicate server state** - Use React Query
3. **Don't mutate state directly** - Use immutable updates
4. **Don't forget error handling** - Handle failures gracefully
5. **Don't over-optimize** - Premature optimization
6. **Don't mix concerns** - Separate UI and data state
7. **Don't store derived state** - Compute it
8. **Don't ignore loading states** - Show feedback
9. **Don't use context for everything** - Performance issues
10. **Don't forget to clean up** - Memory leaks

### State Decision Tree

```
Does the state come from the server?
├─ Yes → Use React Query
└─ No
   ├─ Is it shared across many components?
   │  ├─ Yes → Use Zustand
   │  └─ No → Use useState/useReducer
   ├─ Does it need to persist?
   │  ├─ Yes → Use Zustand with persist
   │  └─ No → Use useState
   └─ Is it reflected in the URL?
      ├─ Yes → Use Next.js router
      └─ No → Use useState
```

---

## Store Organization

### Recommended Structure

```
/src/lib/stores/
  ├── cart.store.ts          # Shopping cart
  ├── theme.store.ts         # Theme preferences
  ├── user-preferences.store.ts  # User settings
  └── ui.store.ts            # Global UI state

/src/hooks/
  ├── use-event.ts           # Event queries
  ├── use-orders.ts          # Order queries
  ├── use-cart.ts            # Cart helpers
  └── use-realtime.ts        # Realtime subscriptions
```

### Store Template

```typescript
// stores/example.store.ts
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

interface ExampleState {
  // State
  value: string;
  count: number;
  
  // Actions
  setValue: (value: string) => void;
  increment: () => void;
  reset: () => void;
}

export const useExampleStore = create<ExampleState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        value: '',
        count: 0,
        
        // Actions
        setValue: (value) => set({ value }),
        increment: () => set((state) => ({ count: state.count + 1 })),
        reset: () => set({ value: '', count: 0 }),
      }),
      {
        name: 'gvteway-example',
        version: 1,
      }
    ),
    { name: 'ExampleStore' }
  )
);
```

---

## Testing State

### Testing React Query Hooks

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEvent } from './use-event';

describe('useEvent', () => {
  it('fetches event data', async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
    
    const { result } = renderHook(() => useEvent('event-1'), { wrapper });
    
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockEvent);
  });
});
```

### Testing Zustand Stores

```typescript
import { renderHook, act } from '@testing-library/react';
import { useCartStore } from './cart.store';

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });
  
  it('adds item to cart', () => {
    const { result } = renderHook(() => useCartStore());
    
    act(() => {
      result.current.addItem(mockItem);
    });
    
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toEqual(mockItem);
  });
});
```

---

## Migration Guide

### From Redux to Zustand

```typescript
// Before (Redux)
const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] },
  reducers: {
    addItem: (state, action) => {
      state.items.push(action.payload);
    },
  },
});

// After (Zustand)
const useCartStore = create((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ 
    items: [...state.items, item] 
  })),
}));
```

### From useState to React Query

```typescript
// Before (useState + useEffect)
const [event, setEvent] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchEvent(id).then(setEvent).finally(() => setLoading(false));
}, [id]);

// After (React Query)
const { data: event, isLoading } = useQuery({
  queryKey: ['event', id],
  queryFn: () => fetchEvent(id),
});
```

---

## Related Documentation

- [Caching Strategy](./CACHING_STRATEGY.md)
- [Performance Optimization](../performance/OPTIMIZATION.md)
- [React Query Setup](../setup/REACT_QUERY.md)

---

**Last Review:** 2025-01-09  
**Next Review:** 2025-04-09  
**Maintained By:** Engineering Team
