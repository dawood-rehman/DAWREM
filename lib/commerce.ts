export const FREE_SHIPPING_THRESHOLD = 5000;
export const STANDARD_SHIPPING_COST = 200;
export const MAX_CART_ITEM_QUANTITY = 99;

export function normalizeQuantity(
  value: unknown,
  max = MAX_CART_ITEM_QUANTITY
) {
  const quantity = Math.floor(Number(value));
  const safeMax = Math.max(1, Math.floor(Number(max)) || MAX_CART_ITEM_QUANTITY);

  if (!Number.isFinite(quantity) || quantity < 1) return 1;
  return Math.min(quantity, safeMax);
}

export function calculateDiscountedSubtotal(subtotal: number, discount = 0) {
  return Math.max(Number(subtotal) - Math.max(Number(discount) || 0, 0), 0);
}

export function calculateShipping(subtotal: number, discount = 0) {
  const discountedSubtotal = calculateDiscountedSubtotal(subtotal, discount);
  return discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
}

export function calculateOrderTotal(subtotal: number, discount = 0) {
  const discountedSubtotal = calculateDiscountedSubtotal(subtotal, discount);
  return discountedSubtotal + calculateShipping(subtotal, discount);
}
