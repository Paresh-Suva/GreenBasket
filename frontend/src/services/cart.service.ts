import { api } from "./api";
import { ApiResponse, Cart } from "@/types";

export const cartService = {
  async getCart() {
    const res = await api.get<ApiResponse<Cart>>("/cart");
    return res.data;
  },

  async addItem(productId: number, quantity: number) {
    const res = await api.post<ApiResponse<Cart>>("/cart/items", { productId, quantity });
    return res.data;
  },

  async updateItemQuantity(itemId: number, quantity: number) {
    const res = await api.put<ApiResponse<Cart>>(`/cart/items/${itemId}`, { quantity });
    return res.data;
  },

  async removeItem(itemId: number) {
    const res = await api.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`);
    return res.data;
  },

  async clearCart() {
    const res = await api.delete<ApiResponse<void>>("/cart");
    return res.data;
  }
};
