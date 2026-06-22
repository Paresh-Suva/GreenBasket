import { api } from "./api";
import { ApiResponse, OrderResponse, OrderSummaryResponse, PaymentMethod, OrderTrackingResponse } from "@/types";

export interface PlaceOrderRequest {
  deliveryAddressId: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  couponCode?: string;
  useWallet?: boolean;
}

export const ordersService = {
  async placeOrder(data: PlaceOrderRequest) {
    const res = await api.post<ApiResponse<OrderResponse>>("/orders", data);
    return res.data;
  },

  async getMyOrders() {
    const res = await api.get<ApiResponse<OrderSummaryResponse[]>>("/orders");
    return res.data;
  },

  async getOrderDetails(orderId: string) {
    const res = await api.get<ApiResponse<OrderResponse>>(`/orders/${orderId}`);
    return res.data;
  },

  async cancelOrder(orderId: string) {
    const res = await api.patch<ApiResponse<OrderResponse>>(`/orders/${orderId}/cancel`);
    return res.data;
  },

  async getTrackingDetails(orderNumber: string) {
    const res = await api.get<ApiResponse<OrderTrackingResponse>>(`/orders/tracking/${orderNumber}`);
    return res.data;
  }
};
