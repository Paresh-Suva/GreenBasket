import { api } from "./api";
import { ApiResponse } from "@/types";

export interface WalletTransaction {
  id: number;
  amount: number;
  transactionType: "EARNED" | "SPENT";
  description: string;
  createdAt: string;
}

export interface WalletSummary {
  balance: number;
  transactions: WalletTransaction[];
}

export const walletService = {
  async getWalletSummary() {
    const res = await api.get<ApiResponse<WalletSummary>>("/wallet/summary");
    return res.data;
  },

  async getWalletTransactions() {
    const res = await api.get<ApiResponse<WalletTransaction[]>>("/wallet/transactions");
    return res.data;
  }
};
