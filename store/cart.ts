import { create } from "zustand";
import { persist } from "zustand/middleware";
import { calculateOrderTotal, normalizeQuantity } from "@/lib/commerce";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  salePrice?: number;
  quantity: number;
  size: string;
  color: string;
  sku?: string;
  stock: number;
}

interface CartStore {
  items: CartItem[];
  couponCode: string;
  couponDiscount: number;

  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;

  totalItems: () => number;
  subtotal: () => number;
  total: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: "",
      couponDiscount: 0,

      addItem: (item) => {
        const stock = Math.max(0, Number(item.stock) || 0);
        const quantity = normalizeQuantity(item.quantity, stock || undefined);
        if (stock === 0) return;

        const existing = get().items.find(
          (i) =>
            i.productId === item.productId &&
            i.size === item.size &&
            i.color === item.color
        );

        if (existing) {
          const newQty = normalizeQuantity(existing.quantity + quantity, stock);
          set((s) => ({
            items: s.items.map((i) =>
              i.id === existing.id ? { ...i, quantity: newQty } : i
            ),
          }));
        } else {
          set((s) => ({ items: [...s.items, { ...item, quantity, stock }] }));
        }
      },

      removeItem: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id ? { ...i, quantity: normalizeQuantity(quantity, i.stock) } : i
          ),
        }));
      },

      clearCart: () =>
        set({ items: [], couponCode: "", couponDiscount: 0 }),

      applyCoupon: (code, discount) =>
        set({ couponCode: code, couponDiscount: discount }),

      removeCoupon: () => set({ couponCode: "", couponDiscount: 0 }),

      totalItems: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        get().items.reduce(
          (sum, i) => sum + (i.salePrice ?? i.price) * i.quantity,
          0
        ),

      total: () => {
        const sub = get().subtotal();
        const discount = get().couponDiscount;
        return calculateOrderTotal(sub, discount);
      },
    }),
    {
      name: "dawrem-cart",
      skipHydration: true,
      partialize: (s) => ({
        items: s.items,
        couponCode: s.couponCode,
        couponDiscount: s.couponDiscount,
      }),
    }
  )
);
