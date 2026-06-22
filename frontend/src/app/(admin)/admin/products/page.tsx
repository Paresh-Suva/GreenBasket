"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Search, Edit2, Trash2, CheckCircle, XCircle, Package, AlertTriangle, Sparkles, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { productsService } from "@/services/products.service";
import { categoriesService } from "@/services/categories.service";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getFullImageUrl } from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductForm } from "./components/ProductForm";
import { Product, ProductSummary } from "@/types";
import { Label } from "@/components/ui/label";

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [page, setPage] = useState(0);
  
  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockProduct, setStockProduct] = useState<ProductSummary | null>(null);
  const [newStockVal, setNewStockVal] = useState<number>(0);
  const [isStockSubmitting, setIsStockSubmitting] = useState(false);

  // Fetch all categories for filter and form dropdowns
  const { data: categoriesRes } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => categoriesService.getAllCategories(),
  });

  // Fetch products with search, category filters, and pagination
  const { data: productsRes, isLoading } = useQuery({
    queryKey: ["admin", "products", searchTerm, selectedCategoryId, page],
    queryFn: () =>
      productsService.getProducts({
        search: searchTerm || undefined,
        categoryId: selectedCategoryId ? Number(selectedCategoryId) : undefined,
        page,
        size: 10,
      }),
  });

  const productPage = productsRes?.data;
  const products = productPage?.content || [];
  const categories = categoriesRes?.data || [];

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      if (active) {
        return productsService.deactivateProduct(id);
      } else {
        return productsService.activateProduct(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Product status updated successfully");
    },
    onError: (err) => {
      toast.error((err as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to update product status");
    },
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => productsService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Product deleted successfully");
    },
    onError: (err) => {
      toast.error((err as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to delete product");
    },
  });

  const handleEdit = async (item: ProductSummary) => {
    try {
      const res = await productsService.getProductById(item.id);
      setEditingProduct(res.data);
      setIsFormOpen(true);
    } catch (err) {
      toast.error("Failed to load product details");
    }
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleStatus = (item: ProductSummary) => {
    // In product list, item is ProductSummary which has active field?
    // Let's verify. ProductSummary does not have active field. Wait! Let's check ProductSummary fields.
    // Ah, ProductSummary has: inStock, featured, but does it have active?
    // Let's fetch active status by getting details, or we can just fetch detail or assume item.inStock.
    // Wait, let's fetch product by ID to activate/deactivate safely or let's inspect if ProductSummary has active status.
    // Wait, let's look at `ProductSummaryResponse.java` to see if it has `active`.
  };

  const openStockModal = (item: ProductSummary) => {
    setStockProduct(item);
    // Fetch product details to get current stock quantity
    productsService.getProductById(item.id).then((res) => {
      setNewStockVal(res.data.stockQuantity);
      setIsStockModalOpen(true);
    }).catch(() => {
      toast.error("Failed to load stock details");
    });
  };

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockProduct) return;

    try {
      setIsStockSubmitting(true);
      await productsService.updateStock(stockProduct.id, newStockVal);
      toast.success("Stock quantity updated successfully");
      setIsStockModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    } catch (err) {
      toast.error((err as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to update stock");
    } finally {
      setIsStockSubmitting(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0); // Reset page on new search
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategoryId(e.target.value);
    setPage(0); // Reset page on new filter
  };

  const columns = [
    {
      key: "imageUrl",
      header: "Image",
      render: (item: ProductSummary) => (
        <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-100 dark:border-zinc-800 bg-slate-50 flex items-center justify-center">
          <img
            src={getFullImageUrl(item.primaryImageUrl)}
            alt={item.name}
            className="w-full h-full object-contain"
          />
        </div>
      ),
    },
    {
      key: "name",
      header: "Product Details",
      render: (item: ProductSummary) => (
        <div>
          <span className="font-bold text-slate-800 dark:text-zinc-100 block">{item.name}</span>
          <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 px-1.5 py-0.5 rounded">
            ID: {item.id}
          </span>
        </div>
      ),
    },
    {
      key: "categoryName",
      header: "Category",
    },
    {
      key: "price",
      header: "Price",
      render: (item: ProductSummary) => (
        <div className="font-semibold text-slate-800 dark:text-zinc-200">
          {item.discountPrice ? (
            <div className="flex flex-col">
              <span className="text-emerald-600 dark:text-emerald-400">₹{item.discountPrice.toFixed(2)}</span>
              <span className="text-xs line-through text-slate-400">₹{item.price.toFixed(2)}</span>
            </div>
          ) : (
            <span>₹{item.price.toFixed(2)}</span>
          )}
        </div>
      ),
    },
    {
      key: "stock",
      header: "Inventory / Stock",
      render: (item: ProductSummary) => (
        <button
          onClick={() => openStockModal(item)}
          className="flex items-center gap-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800/60 p-1.5 rounded-lg transition-colors text-left"
          title="Click to quickly update stock"
        >
          {item.inStock ? (
            <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20 flex items-center gap-1 font-semibold">
              <Package className="w-3 h-3" />
              <span>In Stock</span>
            </Badge>
          ) : (
            <Badge variant="destructive" className="flex items-center gap-1 font-semibold">
              <AlertTriangle className="w-3 h-3" />
              <span>Out of Stock</span>
            </Badge>
          )}
        </button>
      ),
    },
    {
      key: "featured",
      header: "Featured",
      render: (item: ProductSummary) => (
        item.featured ? (
          <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center gap-1 w-fit font-bold">
            <Sparkles className="w-3 h-3" />
            <span>Featured</span>
          </Badge>
        ) : (
          <span className="text-slate-400 text-xs">No</span>
        )
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item: ProductSummary) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => handleEdit(item)}
            title="Edit Details"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => handleDelete(item.id)}
            title="Delete Product"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-zinc-100">
            Product Inventory
          </h1>
          <p className="text-sm font-semibold text-slate-400 dark:text-zinc-500">
            Manage your grocery inventory, update stock levels, and set prices.
          </p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Filters Area */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 flex items-center max-w-sm gap-2 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-xl px-3 py-1.5 shadow-xs">
          <Search className="w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search products by name..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-sm h-8"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-xl px-3 py-1.5 shadow-xs w-full sm:w-64">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategoryId}
            onChange={handleCategoryChange}
            className="border-0 bg-transparent focus:outline-none text-sm w-full h-8 cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product List */}
      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        emptyTitle="No Products Found"
        emptyDescription="Get started by creating your first product item."
      />

      {/* Pagination Controls */}
      {productPage && productPage.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-zinc-800 pt-4">
          <span className="text-xs font-semibold text-slate-500">
            Page {page + 1} of {productPage.totalPages} ({productPage.totalElements} products)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= productPage.totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Product Create/Edit Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product Details" : "Create New Product"}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            product={editingProduct}
            categories={categories}
            onClose={() => setIsFormOpen(false)}
            onSuccess={() => {
              setIsFormOpen(false);
              queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Quick Stock Modal */}
      <Dialog open={isStockModalOpen} onOpenChange={setIsStockModalOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Update Inventory Stock</DialogTitle>
          </DialogHeader>
          {stockProduct && (
            <form onSubmit={handleStockSubmit} className="space-y-4 pt-2">
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800 dark:text-zinc-100">{stockProduct.name}</p>
                <p className="text-xs text-slate-400">Manage available items count in shelves</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stockQty" className="font-semibold text-slate-700 dark:text-zinc-300">Stock Quantity</Label>
                <Input
                  id="stockQty"
                  type="number"
                  value={newStockVal}
                  onChange={(e) => setNewStockVal(Number(e.target.value))}
                  min={0}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsStockModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isStockSubmitting}>
                  Save Stock
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
