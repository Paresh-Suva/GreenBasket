import { api } from "./api";
import { ApiResponse, Review, RatingSummary } from "@/types";

export interface CreateReviewData {
  productId: number;
  orderId?: number;
  rating: number;
  reviewText?: string;
}

export interface UpdateReviewData {
  rating: number;
  reviewText?: string;
}

export const reviewsService = {
  async getProductReviews(productId: number) {
    const res = await api.get<ApiResponse<Review[]>>(`/products/${productId}/reviews`);
    return res.data;
  },

  async getProductRatingSummary(productId: number) {
    const res = await api.get<ApiResponse<RatingSummary>>(`/products/${productId}/reviews/summary`);
    return res.data;
  },

  async getMyReviews() {
    const res = await api.get<ApiResponse<Review[]>>("/reviews/me");
    return res.data;
  },

  async createReview(data: CreateReviewData) {
    const res = await api.post<ApiResponse<Review>>("/reviews", data);
    return res.data;
  },

  async updateReview(reviewId: number, data: UpdateReviewData) {
    const res = await api.put<ApiResponse<Review>>(`/reviews/${reviewId}`, data);
    return res.data;
  },

  async deleteReview(reviewId: number) {
    const res = await api.delete<ApiResponse<void>>(`/reviews/${reviewId}`);
    return res.data;
  }
};
