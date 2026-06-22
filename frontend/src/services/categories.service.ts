import { api } from "./api";
import { ApiResponse, Category } from "@/types";

export const categoriesService = {
  async getAllActiveCategories() {
    const res = await api.get<ApiResponse<Category[]>>("/categories");
    return res.data;
  },

  async getCategoryBySlug(slug: string) {
    const res = await api.get<ApiResponse<Category>>(`/categories/${slug}`);
    return res.data;
  },

  async getCategoryTree() {
    const res = await api.get<ApiResponse<Category[]>>("/categories/tree");
    return res.data;
  },

  // ── Admin Category CRUD ──
  async getAllCategories() {
    const res = await api.get<ApiResponse<Category[]>>("/admin/categories");
    return res.data;
  },

  async getCategoryById(id: number) {
    const res = await api.get<ApiResponse<Category>>(`/admin/categories/${id}`);
    return res.data;
  },

  async createCategory(data: Record<string, unknown>) {
    const res = await api.post<ApiResponse<Category>>("/admin/categories", data);
    return res.data;
  },

  async updateCategory(id: number, data: Record<string, unknown>) {
    const res = await api.put<ApiResponse<Category>>(`/admin/categories/${id}`, data);
    return res.data;
  },

  async deleteCategory(id: number) {
    const res = await api.delete<ApiResponse<void>>(`/admin/categories/${id}`);
    return res.data;
  },

  async activateCategory(id: number) {
    const res = await api.patch<ApiResponse<Category>>(`/admin/categories/${id}/activate`);
    return res.data;
  },

  async deactivateCategory(id: number) {
    const res = await api.patch<ApiResponse<Category>>(`/admin/categories/${id}/deactivate`);
    return res.data;
  },

  async uploadImage(formData: FormData) {
    const res = await api.post<ApiResponse<{ imageUrl: string }>>("/admin/uploads/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return res.data;
  }
};
