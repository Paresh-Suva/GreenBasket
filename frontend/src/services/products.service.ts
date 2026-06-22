import { api } from "./api";
import { ApiResponse, PageResponse, ProductSummary, Product } from "@/types";

export interface ProductQueryParams {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  search?: string;
  page?: number; // 0-indexed for Spring backend
  size?: number;
  sort?: string; // e.g., 'price,asc' or 'name,desc'
}

export const productsService = {
  async getProducts(params?: ProductQueryParams) {
    const res = await api.get<ApiResponse<PageResponse<ProductSummary>>>("/products", { params });
    return res.data;
  },

  async getProductBySlug(slug: string) {
    const res = await api.get<ApiResponse<Product>>(`/products/${slug}`);
    return res.data;
  },

  async getFeaturedProducts() {
    const res = await api.get<ApiResponse<ProductSummary[]>>("/products/featured");
    return res.data;
  },

  // ── Admin Product CRUD ──
  async getProductById(id: number) {
    const res = await api.get<ApiResponse<Product>>(`/admin/products/${id}`);
    return res.data;
  },

  async createProduct(data: Record<string, unknown>) {
    const res = await api.post<ApiResponse<Product>>("/admin/products", data);
    return res.data;
  },

  async updateProduct(id: number, data: Record<string, unknown>) {
    const res = await api.put<ApiResponse<Product>>(`/admin/products/${id}`, data);
    return res.data;
  },

  async deleteProduct(id: number) {
    const res = await api.delete<ApiResponse<void>>(`/admin/products/${id}`);
    return res.data;
  },

  async activateProduct(id: number) {
    const res = await api.patch<ApiResponse<Product>>(`/admin/products/${id}/activate`);
    return res.data;
  },

  async deactivateProduct(id: number) {
    const res = await api.patch<ApiResponse<Product>>(`/admin/products/${id}/deactivate`);
    return res.data;
  },

  async addProductImage(productId: number, data: { imageUrl: string; altText?: string; primaryImage?: boolean; sortOrder?: number }) {
    const res = await api.post<ApiResponse<Product>>(`/admin/products/${productId}/images`, data);
    return res.data;
  },

  async removeProductImage(imageId: number) {
    const res = await api.delete<ApiResponse<void>>(`/admin/products/images/${imageId}`);
    return res.data;
  },

  async updateStock(id: number, stockQuantity: number) {
    const res = await api.patch<ApiResponse<Product>>(`/admin/products/${id}/stock`, { stockQuantity });
    return res.data;
  }
};
