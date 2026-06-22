"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Search, Edit2, Trash2, CheckCircle, XCircle } from "lucide-react";
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
import { CategoryForm } from "./components/CategoryForm";
import { Category } from "@/types";

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Fetch all categories (admin route)
  const { data: categoriesRes, isLoading } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => categoriesService.getAllCategories(),
  });

  const categories = categoriesRes?.data || [];

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      if (active) {
        return categoriesService.deactivateCategory(id);
      } else {
        return categoriesService.activateCategory(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      toast.success("Category status updated successfully");
    },
    onError: (err) => {
      toast.error((err as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to update category status");
    },
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoriesService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      toast.success("Category deleted successfully");
    },
    onError: (err) => {
      toast.error((err as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to delete category");
    },
  });

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this category? This might affect products under this category.")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleStatus = (category: Category) => {
    toggleStatusMutation.mutate({ id: category.id, active: category.active });
  };

  // Filtered categories
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: "imageUrl",
      header: "Image",
      render: (item: Category) => (
        <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 dark:border-zinc-800 bg-slate-50 flex items-center justify-center">
          <img
            src={getFullImageUrl(item.imageUrl)}
            alt={item.name}
            className="w-full h-full object-contain"
          />
        </div>
      ),
    },
    {
      key: "name",
      header: "Category Name",
      render: (item: Category) => (
        <div>
          <span className="font-bold text-slate-800 dark:text-zinc-100">{item.name}</span>
          {item.parentName && (
            <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500">
              Subcategory of: {item.parentName}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "slug",
      header: "Slug",
    },
    {
      key: "sortOrder",
      header: "Display Order",
    },
    {
      key: "active",
      header: "Status",
      render: (item: Category) => (
        <button
          onClick={() => handleToggleStatus(item)}
          disabled={toggleStatusMutation.isPending}
          className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-lg"
          title="Click to toggle status"
        >
          {item.active ? (
            <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              <span>Active</span>
            </Badge>
          ) : (
            <Badge variant="secondary" className="flex items-center gap-1">
              <XCircle className="w-3 h-3" />
              <span>Inactive</span>
            </Badge>
          )}
        </button>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item: Category) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => handleEdit(item)}
            title="Edit Category"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => handleDelete(item.id)}
            title="Delete Category"
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
            Category Management
          </h1>
          <p className="text-sm font-semibold text-slate-400 dark:text-zinc-500">
            Organize products into hierarchical groups for better storefront navigation.
          </p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center max-w-sm gap-2 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-xl px-3 py-1.5 shadow-xs">
        <Search className="w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search categories by name or slug..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-sm h-8"
        />
      </div>

      {/* Category List */}
      <DataTable
        columns={columns}
        data={filteredCategories}
        isLoading={isLoading}
        emptyTitle="No Categories Found"
        emptyDescription="Create categories to help organize your catalog."
      />

      {/* Category Create/Edit Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
          </DialogHeader>
          <CategoryForm
            category={editingCategory}
            categories={categories}
            onClose={() => setIsFormOpen(false)}
            onSuccess={() => {
              setIsFormOpen(false);
              queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
