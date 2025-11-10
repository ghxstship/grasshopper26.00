/**
 * Cart Helper Utilities
 * GHXSTSHIP Entertainment Platform Shopping Cart Management
 */

export interface CartItem {
  id: string;
  type: 'ticket' | 'merchandise' | 'addon';
  productId: string;
  name: string;
  price: number;
  quantity: number;
  variant?: {
    size?: string;
    color?: string;
    [key: string]: string | undefined;
  };
  metadata?: Record<string, unknown>;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  fees: number;
  total: number;
}

/**
 * Add item to cart
 */
export function addToCart(cart: Cart, item: CartItem): Cart {
  const existingIndex = cart.items.findIndex(
    i => i.productId === item.productId && JSON.stringify(i.variant) === JSON.stringify(item.variant)
  );

  let items: CartItem[];
  if (existingIndex >= 0) {
    items = [...cart.items];
    items[existingIndex] = {
      ...items[existingIndex],
      quantity: items[existingIndex].quantity + item.quantity,
    };
  } else {
    items = [...cart.items, item];
  }

  return recalculateCart({ ...cart, items });
}

/**
 * Remove item from cart
 */
export function removeFromCart(cart: Cart, itemId: string): Cart {
  const items = cart.items.filter(item => item.id !== itemId);
  return recalculateCart({ ...cart, items });
}

/**
 * Update item quantity
 */
export function updateCartItemQuantity(cart: Cart, itemId: string, quantity: number): Cart {
  if (quantity <= 0) {
    return removeFromCart(cart, itemId);
  }

  const items = cart.items.map(item =>
    item.id === itemId ? { ...item, quantity } : item
  );

  return recalculateCart({ ...cart, items });
}

/**
 * Clear cart
 */
export function clearCart(): Cart {
  return {
    items: [],
    subtotal: 0,
    tax: 0,
    fees: 0,
    total: 0,
  };
}

/**
 * Calculate cart subtotal
 */
export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/**
 * Calculate cart tax
 */
export function calculateCartTax(subtotal: number, taxRate: number = 8.5): number {
  return Math.round(subtotal * (taxRate / 100));
}

/**
 * Calculate cart fees
 */
export function calculateCartFees(subtotal: number, feePercentage: number = 2.9, fixedFee: number = 30): number {
  return Math.round((subtotal * (feePercentage / 100)) + fixedFee);
}

/**
 * Recalculate cart totals
 */
export function recalculateCart(cart: Cart, taxRate?: number, feePercentage?: number, fixedFee?: number): Cart {
  const subtotal = calculateSubtotal(cart.items);
  const tax = calculateCartTax(subtotal, taxRate);
  const fees = calculateCartFees(subtotal, feePercentage, fixedFee);
  const total = subtotal + tax + fees;

  return {
    ...cart,
    subtotal,
    tax,
    fees,
    total,
  };
}

/**
 * Get cart item count
 */
export function getCartItemCount(cart: Cart): number {
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Check if cart is empty
 */
export function isCartEmpty(cart: Cart): boolean {
  return cart.items.length === 0;
}

/**
 * Get cart items by type
 */
export function getCartItemsByType(cart: Cart, type: CartItem['type']): CartItem[] {
  return cart.items.filter(item => item.type === type);
}

/**
 * Validate cart
 */
export function validateCart(cart: Cart, inventory: Record<string, number>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  cart.items.forEach(item => {
    const available = inventory[item.productId];
    if (available === undefined) {
      errors.push(`${item.name} is no longer available`);
    } else if (item.quantity > available) {
      errors.push(`Only ${available} ${item.name} available`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Apply discount code
 */
export function applyDiscount(
  cart: Cart,
  discount: { type: 'percentage' | 'fixed'; value: number; minPurchase?: number }
): Cart {
  if (discount.minPurchase && cart.subtotal < discount.minPurchase) {
    return cart;
  }

  let discountAmount = 0;
  if (discount.type === 'percentage') {
    discountAmount = Math.round(cart.subtotal * (discount.value / 100));
  } else {
    discountAmount = discount.value;
  }

  const newSubtotal = Math.max(0, cart.subtotal - discountAmount);
  const tax = calculateCartTax(newSubtotal);
  const fees = calculateCartFees(newSubtotal);
  const total = newSubtotal + tax + fees;

  return {
    ...cart,
    subtotal: newSubtotal,
    tax,
    fees,
    total,
  };
}

/**
 * Merge carts
 */
export function mergeCarts(cart1: Cart, cart2: Cart): Cart {
  let merged = cart1;

  cart2.items.forEach(item => {
    merged = addToCart(merged, item);
  });

  return merged;
}

/**
 * Save cart to storage
 */
export function saveCartToStorage(cart: Cart, key: string = 'cart'): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(cart));
}

/**
 * Load cart from storage
 */
export function loadCartFromStorage(key: string = 'cart'): Cart | null {
  if (typeof localStorage === 'undefined') return null;

  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Format cart item display
 */
export function formatCartItemDisplay(item: CartItem): string {
  let display = `${item.name} x${item.quantity}`;

  if (item.variant) {
    const variants = Object.entries(item.variant)
      .filter(([, value]) => value)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    if (variants) {
      display += ` (${variants})`;
    }
  }

  return display.toUpperCase();
}

/**
 * Calculate savings
 */
export function calculateSavings(originalPrice: number, discountedPrice: number): number {
  return Math.max(0, originalPrice - discountedPrice);
}

/**
 * Get cart summary
 */
export function getCartSummary(cart: Cart): {
  itemCount: number;
  ticketCount: number;
  merchandiseCount: number;
  addonCount: number;
  subtotal: string;
  tax: string;
  fees: string;
  total: string;
} {
  const items = cart.items;

  return {
    itemCount: getCartItemCount(cart),
    ticketCount: items.filter(i => i.type === 'ticket').reduce((sum, i) => sum + i.quantity, 0),
    merchandiseCount: items.filter(i => i.type === 'merchandise').reduce((sum, i) => sum + i.quantity, 0),
    addonCount: items.filter(i => i.type === 'addon').reduce((sum, i) => sum + i.quantity, 0),
    subtotal: formatPrice(cart.subtotal),
    tax: formatPrice(cart.tax),
    fees: formatPrice(cart.fees),
    total: formatPrice(cart.total),
  };
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Check if item is in cart
 */
export function isItemInCart(cart: Cart, productId: string, variant?: CartItem['variant']): boolean {
  return cart.items.some(
    item => item.productId === productId && JSON.stringify(item.variant) === JSON.stringify(variant)
  );
}

/**
 * Get item quantity in cart
 */
export function getItemQuantityInCart(cart: Cart, productId: string, variant?: CartItem['variant']): number {
  const item = cart.items.find(
    i => i.productId === productId && JSON.stringify(i.variant) === JSON.stringify(variant)
  );

  return item?.quantity || 0;
}

/**
 * Create cart item
 */
export function createCartItem(
  type: CartItem['type'],
  productId: string,
  name: string,
  price: number,
  quantity: number = 1,
  variant?: CartItem['variant']
): CartItem {
  return {
    id: `${productId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    productId,
    name,
    price,
    quantity,
    variant,
  };
}

/**
 * Estimate shipping
 */
export function estimateShipping(cart: Cart, shippingMethod: 'standard' | 'express' | 'overnight'): number {
  const merchandiseItems = getCartItemsByType(cart, 'merchandise');
  if (merchandiseItems.length === 0) return 0;

  const rates = {
    standard: 500, // $5.00
    express: 1500, // $15.00
    overnight: 3000, // $30.00
  };

  return rates[shippingMethod];
}

/**
 * Calculate cart weight (for shipping)
 */
export function calculateCartWeight(cart: Cart, itemWeights: Record<string, number>): number {
  return cart.items.reduce((total, item) => {
    const weight = itemWeights[item.productId] || 0;
    return total + weight * item.quantity;
  }, 0);
}
