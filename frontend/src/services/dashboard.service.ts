import { api } from "./api";
import { ApiResponse } from "@/types";

export interface DashboardSummary {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  newOrdersToday: number;
  activeSupportTickets: number;
  totalCategories: number;
  activeProducts: number;
  outOfStockProducts: number;
  featuredProducts: number;
  totalCustomers: number;
}

export const dashboardService = {
  async getSummary() {
    const res = await api.get<ApiResponse<DashboardSummary>>("/admin/dashboard/summary");
    return res.data;
  },
};
