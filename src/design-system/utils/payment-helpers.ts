/**
 * Payment Helper Utilities
 * GHXSTSHIP Entertainment Platform Payment Processing (Stripe)
 */

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  clientSecret: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'wallet';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Convert dollars to cents
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Convert cents to dollars
 */
export function centsToDollars(cents: number): number {
  return cents / 100;
}

/**
 * Calculate service fee
 */
export function calculateServiceFee(amount: number, feePercentage: number = 2.9, fixedFee: number = 30): number {
  return Math.round((amount * (feePercentage / 100)) + fixedFee);
}

/**
 * Calculate total with fees
 */
export function calculateTotalWithFees(amount: number, feePercentage: number = 2.9, fixedFee: number = 30): number {
  return amount + calculateServiceFee(amount, feePercentage, fixedFee);
}

/**
 * Validate credit card number (Luhn algorithm)
 */
export function validateCardNumber(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }
  
  let sum = 0;
  let isEven = false;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

/**
 * Get card brand from number
 */
export function getCardBrand(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, '');
  
  if (/^4/.test(digits)) return 'Visa';
  if (/^5[1-5]/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'American Express';
  if (/^6(?:011|5)/.test(digits)) return 'Discover';
  if (/^35/.test(digits)) return 'JCB';
  if (/^30[0-5]/.test(digits)) return 'Diners Club';
  
  return 'Unknown';
}

/**
 * Validate expiry date
 */
export function validateExpiryDate(month: number, year: number): boolean {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  if (month < 1 || month > 12) return false;
  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  
  return true;
}

/**
 * Validate CVV
 */
export function validateCVV(cvv: string, cardBrand: string = 'Unknown'): boolean {
  const digits = cvv.replace(/\D/g, '');
  
  if (cardBrand === 'American Express') {
    return digits.length === 4;
  }
  
  return digits.length === 3;
}

/**
 * Format card number for display
 */
export function formatCardNumberDisplay(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, '');
  const brand = getCardBrand(digits);
  
  if (brand === 'American Express') {
    return digits.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
  }
  
  return digits.replace(/(\d{4})/g, '$1 ').trim();
}

/**
 * Mask card number
 */
export function maskCardNumber(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, '');
  const last4 = digits.slice(-4);
  return `•••• •••• •••• ${last4}`;
}

/**
 * Create payment intent data
 */
export function createPaymentIntentData(
  amount: number,
  currency: string = 'USD',
  metadata?: Record<string, string>
): {
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
} {
  return {
    amount: dollarsToCents(amount),
    currency: currency.toLowerCase(),
    metadata,
  };
}

/**
 * Parse payment error
 */
export function parsePaymentError(error: any): string {
  if (error.type === 'card_error') {
    return error.message || 'Your card was declined.';
  }
  
  if (error.type === 'validation_error') {
    return 'Please check your payment information.';
  }
  
  return 'An error occurred processing your payment.';
}

/**
 * Get payment status display
 */
export function getPaymentStatusDisplay(status: PaymentIntent['status']): string {
  const statusMap: Record<PaymentIntent['status'], string> = {
    requires_payment_method: 'AWAITING PAYMENT',
    requires_confirmation: 'CONFIRMING',
    requires_action: 'ACTION REQUIRED',
    processing: 'PROCESSING',
    succeeded: 'COMPLETED',
    canceled: 'CANCELED',
  };
  
  return statusMap[status] || status.toUpperCase();
}

/**
 * Calculate installment amount
 */
export function calculateInstallmentAmount(
  totalAmount: number,
  numberOfInstallments: number
): number {
  return Math.ceil(totalAmount / numberOfInstallments);
}

/**
 * Generate installment schedule
 */
export function generateInstallmentSchedule(
  totalAmount: number,
  numberOfInstallments: number,
  startDate: Date = new Date()
): Array<{ amount: number; dueDate: Date }> {
  const installmentAmount = calculateInstallmentAmount(totalAmount, numberOfInstallments);
  const schedule: Array<{ amount: number; dueDate: Date }> = [];
  
  for (let i = 0; i < numberOfInstallments; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    
    // Adjust last installment for rounding
    const amount = i === numberOfInstallments - 1
      ? totalAmount - (installmentAmount * (numberOfInstallments - 1))
      : installmentAmount;
    
    schedule.push({ amount, dueDate });
  }
  
  return schedule;
}

/**
 * Validate payment amount
 */
export function validatePaymentAmount(amount: number, minAmount: number = 0.5, maxAmount: number = 999999): boolean {
  return amount >= minAmount && amount <= maxAmount;
}

/**
 * Calculate tax
 */
export function calculateTax(amount: number, taxRate: number): number {
  return Math.round(amount * (taxRate / 100));
}

/**
 * Calculate discount
 */
export function calculateDiscount(amount: number, discountPercentage: number): number {
  return Math.round(amount * (discountPercentage / 100));
}

/**
 * Apply coupon
 */
export function applyCoupon(
  amount: number,
  coupon: { type: 'percentage' | 'fixed'; value: number }
): number {
  if (coupon.type === 'percentage') {
    return amount - calculateDiscount(amount, coupon.value);
  }
  
  return Math.max(0, amount - dollarsToCents(coupon.value));
}

/**
 * Format payment method display
 */
export function formatPaymentMethodDisplay(method: PaymentMethod): string {
  if (method.type === 'card') {
    return `${method.brand} •••• ${method.last4}`;
  }
  
  return method.type.toUpperCase();
}

/**
 * Check if payment is refundable
 */
export function isPaymentRefundable(
  paymentDate: Date,
  refundWindowDays: number = 30
): boolean {
  const now = new Date();
  const diffTime = now.getTime() - paymentDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= refundWindowDays;
}

/**
 * Calculate refund amount
 */
export function calculateRefundAmount(
  originalAmount: number,
  refundPercentage: number = 100,
  refundFee: number = 0
): number {
  const refundAmount = Math.round(originalAmount * (refundPercentage / 100));
  return Math.max(0, refundAmount - refundFee);
}

/**
 * Generate receipt data
 */
export function generateReceiptData(
  orderId: string,
  items: Array<{ name: string; quantity: number; price: number }>,
  subtotal: number,
  tax: number,
  fees: number,
  total: number
): {
  orderId: string;
  date: string;
  items: Array<{ name: string; quantity: number; price: number; total: number }>;
  subtotal: string;
  tax: string;
  fees: string;
  total: string;
} {
  return {
    orderId,
    date: new Date().toISOString(),
    items: items.map(item => ({
      ...item,
      total: item.quantity * item.price,
    })),
    subtotal: formatCurrency(centsToDollars(subtotal)),
    tax: formatCurrency(centsToDollars(tax)),
    fees: formatCurrency(centsToDollars(fees)),
    total: formatCurrency(centsToDollars(total)),
  };
}

/**
 * Validate billing address
 */
export function validateBillingAddress(address: {
  line1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}): boolean {
  return !!(
    address.line1 &&
    address.city &&
    address.state &&
    address.postalCode &&
    address.country
  );
}

/**
 * Format postal code
 */
export function formatPostalCode(postalCode: string, country: string = 'US'): string {
  const cleaned = postalCode.replace(/\s/g, '');
  
  if (country === 'US') {
    if (cleaned.length === 5) return cleaned;
    if (cleaned.length === 9) return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  
  return cleaned;
}

/**
 * Get payment icon (GHXSTSHIP monochromatic)
 */
export function getPaymentIcon(type: string): string {
  // All icons are monochromatic for GHXSTSHIP
  return type.toUpperCase();
}
