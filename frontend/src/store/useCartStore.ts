import { create } from "zustand";
import { cartService } from "@/services/cart.service";
import { Cart, CartItem } from "@/types";
import { useAuthStore } from "./useAuthStore";
import { toast } from "sonner";
import { AxiosError } from "axios";

// Helper function to evaluate the 10 coupons on the client side
export function getCouponDiscount(coupon: string, subtotal: number, items: CartItem[]): { percent: number; discount: number } {
  const code = coupon.trim().toUpperCase();
  let discount = 0;
  let percent = 0;

  const getCategorySubtotal = (slugs: string[]) => {
    return items
      .filter((i) => i.categorySlug && slugs.some(s => s.toLowerCase() === i.categorySlug?.toLowerCase()))
      .reduce((sum, i) => sum + (i.discountPrice ?? i.unitPrice) * i.quantity, 0);
  };

  switch (code) {
    case "WELCOME10":
      if (subtotal >= 100) {
        percent = 10;
        discount = subtotal * 0.1;
      }
      break;
    case "VEGGIE15": {
      const vegSub = getCategorySubtotal(["fresh-vegetables"]);
      if (vegSub >= 150) {
        percent = 15;
        discount = vegSub * 0.15;
      }
      break;
    }
    case "FRUIT20": {
      const fruitSub = getCategorySubtotal(["fresh-fruits"]);
      if (fruitSub >= 200) {
        percent = 20;
        discount = fruitSub * 0.2;
      }
      break;
    }
    case "DAIRY12": {
      const dairySub = getCategorySubtotal(["fresh-milk", "gourmet-cheese", "butter-cream", "yogurt-curd"]);
      if (dairySub >= 150) {
        percent = 12;
        discount = dairySub * 0.12;
      }
      break;
    }
    case "BAKERY20": {
      const bakerySub = getCategorySubtotal(["fresh-bread", "buns-rolls", "cakes-pastries"]);
      if (bakerySub >= 200) {
        percent = 20;
        discount = bakerySub * 0.2;
      }
      break;
    }
    case "MEAT15": {
      const meatSub = getCategorySubtotal(["fresh-poultry", "red-meat"]);
      if (meatSub >= 300) {
        percent = 15;
        discount = meatSub * 0.15;
      }
      break;
    }
    case "SEAFOOD10": {
      const seafoodSub = getCategorySubtotal(["fresh-seafood"]);
      if (seafoodSub >= 250) {
        percent = 10;
        discount = seafoodSub * 0.1;
      }
      break;
    }
    case "STAPLES10": {
      const staplesSub = getCategorySubtotal(["cooking-oils", "rice-grains", "flours-atta", "pulses-lentils"]);
      if (staplesSub >= 250) {
        percent = 10;
        discount = staplesSub * 0.1;
      }
      break;
    }
    case "DRINKS15": {
      const drinksSub = getCategorySubtotal(["soft-drinks", "fruit-juices"]);
      if (drinksSub >= 150) {
        percent = 15;
        discount = drinksSub * 0.15;
      }
      break;
    }
    case "SNACKS15": {
      const snacksSub = getCategorySubtotal(["chips-crisps", "cookies-biscuits"]);
      if (snacksSub >= 150) {
        percent = 15;
        discount = snacksSub * 0.15;
      }
      break;
    }
  }

  return { percent, discount };
}

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  appliedCoupon: string | null;
  couponDiscountPercent: number;
  couponDiscountAmount: number;
  useWallet: boolean;
  walletDiscountAmount: number;
  fetchCart: () => Promise<void>;
  addItem: (productId: number, quantity: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  setUseWallet: (use: boolean) => void;
  recalculateTotals: () => void;
  reset: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,
  appliedCoupon: null,
  couponDiscountPercent: 0,
  couponDiscountAmount: 0,
  useWallet: false,
  walletDiscountAmount: 0,

  recalculateTotals: () => {
    const { cart, appliedCoupon, useWallet } = get();
    if (!cart) {
      set({
        couponDiscountPercent: 0,
        couponDiscountAmount: 0,
        walletDiscountAmount: 0
      });
      return;
    }

    let couponDiscountAmount = 0;
    let couponDiscountPercent = 0;

    if (appliedCoupon) {
      const { percent, discount } = getCouponDiscount(appliedCoupon, cart.subtotal, cart.items || []);
      couponDiscountPercent = percent;
      couponDiscountAmount = discount;
    }

    let walletDiscountAmount = 0;
    if (useWallet) {
      const user = useAuthStore.getState().user;
      const walletBalance = user?.walletBalance || 0;

      // Delivery threshold and formulas matching page
      const isFreeDelivery = cart.subtotal >= 35;
      const deliveryFee = isFreeDelivery ? 0 : 4.99;
      const tax = cart.subtotal * 0.08;
      const totalBeforeWallet = Math.max(0, cart.subtotal - couponDiscountAmount + deliveryFee + tax);

      walletDiscountAmount = Math.min(walletBalance, totalBeforeWallet);
    }

    set({
      couponDiscountPercent,
      couponDiscountAmount,
      walletDiscountAmount
    });
  },

  fetchCart: async () => {
    const { isAuthenticated, user } = useAuthStore.getState();
    const isCustomer = user?.roles?.includes("CUSTOMER");
    if (!isAuthenticated || !isCustomer) {
      set({ cart: null });
      return;
    }

    set({ isLoading: true });
    try {
      const response = await cartService.getCart();
      if (response.status === "success") {
        set({ cart: response.data });
        get().recalculateTotals();
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (productId: number, quantity: number) => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (!isAuthenticated) {
      toast.error("Please login to add items to your cart");
      return;
    }

    set({ isLoading: true });
    try {
      const response = await cartService.addItem(productId, quantity);
      if (response.status === "success") {
        set({ cart: response.data });
        get().recalculateTotals();
        toast.success(response.message || "Item added to cart");
      }
    } catch (error) {
      const errMsg = (error as AxiosError<{ message?: string }>).response?.data?.message || "Failed to add item";
      toast.error(errMsg);
    } finally {
      set({ isLoading: false });
    }
  },

  updateQuantity: async (itemId: number, quantity: number) => {
    set({ isLoading: true });
    try {
      const response = await cartService.updateItemQuantity(itemId, quantity);
      if (response.status === "success") {
        set({ cart: response.data });
        get().recalculateTotals();
        toast.success("Cart updated");
      }
    } catch (error) {
      const errMsg = (error as AxiosError<{ message?: string }>).response?.data?.message || "Failed to update cart";
      toast.error(errMsg);
    } finally {
      set({ isLoading: false });
    }
  },

  removeItem: async (itemId: number) => {
    set({ isLoading: true });
    try {
      const response = await cartService.removeItem(itemId);
      if (response.status === "success") {
        set({ cart: response.data });
        get().recalculateTotals();
        toast.success("Item removed from cart");
      }
    } catch (error) {
      const errMsg = (error as AxiosError<{ message?: string }>).response?.data?.message || "Failed to remove item";
      toast.error(errMsg);
    } finally {
      set({ isLoading: false });
    }
  },

  clearCart: async () => {
    set({ isLoading: true });
    try {
      const response = await cartService.clearCart();
      if (response.status === "success") {
        set({
          cart: null,
          appliedCoupon: null,
          couponDiscountPercent: 0,
          couponDiscountAmount: 0,
          useWallet: false,
          walletDiscountAmount: 0
        });
        toast.success("Cart cleared");
      }
    } catch {
      toast.error("Failed to clear cart");
    } finally {
      set({ isLoading: false });
    }
  },

  applyCoupon: (code: string) => {
    const { cart } = get();
    if (!cart) return false;

    const { percent, discount } = getCouponDiscount(code, cart.subtotal, cart.items || []);
    if (percent > 0) {
      set({
        appliedCoupon: code.toUpperCase(),
        couponDiscountPercent: percent,
        couponDiscountAmount: discount
      });
      get().recalculateTotals();
      return true;
    }
    return false;
  },

  removeCoupon: () => {
    set({
      appliedCoupon: null,
      couponDiscountPercent: 0,
      couponDiscountAmount: 0
    });
    get().recalculateTotals();
  },

  setUseWallet: (use: boolean) => {
    set({ useWallet: use });
    get().recalculateTotals();
  },

  reset: () => {
    set({
      cart: null,
      isLoading: false,
      appliedCoupon: null,
      couponDiscountPercent: 0,
      couponDiscountAmount: 0,
      useWallet: false,
      walletDiscountAmount: 0
    });
  }
}));

// Subscribe to auth state changes to fetch cart automatically or reset it
if (typeof window !== "undefined") {
  let lastIsAuthenticated = useAuthStore.getState().isAuthenticated;
  let lastUser = useAuthStore.getState().user;
  useAuthStore.subscribe((state) => {
    const authChanged = state.isAuthenticated !== lastIsAuthenticated;
    const userChanged = state.user !== lastUser;
    
    if (authChanged || userChanged) {
      lastIsAuthenticated = state.isAuthenticated;
      lastUser = state.user;
      
      const isCustomer = state.user?.roles?.includes("CUSTOMER");
      if (state.isAuthenticated && isCustomer) {
        useCartStore.getState().fetchCart();
      } else {
        useCartStore.getState().reset();
      }
    }
  });
}
