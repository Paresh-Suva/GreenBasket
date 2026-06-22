import { api } from "./api";
import { ApiResponse, Address } from "@/types";

export const addressesService = {
  async getAddresses() {
    const res = await api.get<ApiResponse<Address[]>>("/addresses");
    return res.data;
  },

  async createAddress(data: Omit<Address, "id" | "isDefault"> & { isDefault?: boolean }) {
    const res = await api.post<ApiResponse<Address>>("/addresses", data);
    return res.data;
  },

  async updateAddress(id: number, data: Omit<Address, "id">) {
    const res = await api.put<ApiResponse<Address>>(`/addresses/${id}`, data);
    return res.data;
  },

  async deleteAddress(id: number) {
    const res = await api.delete<ApiResponse<void>>(`/addresses/${id}`);
    return res.data;
  },

  async setDefaultAddress(id: number) {
    const res = await api.patch<ApiResponse<Address>>(`/addresses/${id}/default`);
    return res.data;
  }
};
