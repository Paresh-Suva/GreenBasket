import { api } from "./api";
import { ApiResponse } from "@/types";

export interface WarehouseConfig {
  id?: number;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactNumber: string;
  latitude: number;
  longitude: number;
}

export const warehouseService = {
  async getWarehouse() {
    const res = await api.get<ApiResponse<WarehouseConfig | null>>("/warehouse");
    return res.data;
  },

  async saveWarehouse(data: WarehouseConfig) {
    const res = await api.post<ApiResponse<WarehouseConfig>>("/admin/warehouse", data);
    return res.data;
  }
};
