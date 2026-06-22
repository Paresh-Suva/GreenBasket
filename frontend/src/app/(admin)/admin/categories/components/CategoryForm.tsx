"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Upload, X, Loader2 } from "lucide-react";
import { Category } from "@/types";
import { categoriesService } from "@/services/categories.service";
import { getFullImageUrl } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  parentId: z.number().nullable().optional(),
  description: z.string().optional(),
  sortOrder: z.number().min(0, "Sort order must be 0 or greater"),
  active: z.boolean(),
  imageUrl: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: Category | null;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

export function CategoryForm({ category, categories, onClose, onSuccess }: CategoryFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>(category?.imageUrl || undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || "",
      slug: category?.slug || "",
      parentId: category?.parentId || null,
      description: category?.description || "",
      sortOrder: category?.sortOrder ?? 0,
      active: category?.active ?? true,
      imageUrl: category?.imageUrl || "",
    },
  });

  const categoryName = watch("name");

  // Auto-generate slug from name if creating a new category
  useEffect(() => {
    if (!category && categoryName) {
      const generatedSlug = categoryName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [categoryName, category, setValue]);

  // Sync image URL with form state
  useEffect(() => {
    setValue("imageUrl", imageUrl);
  }, [imageUrl, setValue]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WEBP, etc.)");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);
      const res = await categoriesService.uploadImage(formData);
      setImageUrl(res.data.imageUrl);
      toast.success("Image uploaded successfully");
    } catch (err) {
      console.error(err);
      toast.error((err as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(undefined);
  };

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      setIsSubmitting(true);
      // Clean up values: convert empty string description to null, map string select to number
      const payload = {
        ...values,
        description: values.description || null,
        parentId: values.parentId ? Number(values.parentId) : null,
      };

      if (category) {
        await categoriesService.updateCategory(category.id, payload);
        toast.success("Category updated successfully");
      } else {
        await categoriesService.createCategory(payload);
        toast.success("Category created successfully");
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error((err as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter out the current category and its children from parent selections to prevent cycle
  const availableParents = categories.filter((c) => {
    if (!category) return true;
    return c.id !== category.id && c.parentId !== category.id;
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="font-semibold text-slate-700 dark:text-zinc-300">
            Category Name *
          </Label>
          <Input
            id="name"
            placeholder="e.g. Fresh Fruits"
            className="w-full"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs font-semibold text-rose-500">{errors.name.message}</p>
          )}
        </div>

        {/* Slug */}
        <div className="space-y-1.5">
          <Label htmlFor="slug" className="font-semibold text-slate-700 dark:text-zinc-300">
            SEO Slug *
          </Label>
          <Input
            id="slug"
            placeholder="e.g. fresh-fruits"
            className="w-full"
            {...register("slug")}
          />
          {errors.slug && (
            <p className="text-xs font-semibold text-rose-500">{errors.slug.message}</p>
          )}
        </div>

        {/* Parent Category */}
        <div className="space-y-1.5">
          <Label htmlFor="parentId" className="font-semibold text-slate-700 dark:text-zinc-300">
            Parent Category
          </Label>
          <select
            id="parentId"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            {...register("parentId", {
              setValueAs: (v) => (v === "" || v === "null" ? null : Number(v)),
            })}
          >
            <option value="null">None (Root Category)</option>
            {availableParents.map((c) => (
              <option key={c.id} value={c.id}>
                {c.parentName ? `${c.parentName} > ${c.name}` : c.name}
              </option>
            ))}
          </select>
          {errors.parentId && (
            <p className="text-xs font-semibold text-rose-500">{errors.parentId.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description" className="font-semibold text-slate-700 dark:text-zinc-300">
            Description
          </Label>
          <textarea
            id="description"
            rows={3}
            placeholder="Describe this category..."
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            {...register("description")}
          />
          {errors.description && (
            <p className="text-xs font-semibold text-rose-500">{errors.description.message}</p>
          )}
        </div>

        {/* Sort Order & Active */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="sortOrder" className="font-semibold text-slate-700 dark:text-zinc-300">
              Display Order *
            </Label>
            <Input
              id="sortOrder"
              type="number"
              className="w-full"
              {...register("sortOrder", { valueAsNumber: true })}
            />
            {errors.sortOrder && (
              <p className="text-xs font-semibold text-rose-500">{errors.sortOrder.message}</p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-8">
            <input
              id="active"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              {...register("active")}
            />
            <Label htmlFor="active" className="font-semibold text-slate-700 dark:text-zinc-300 select-none">
              Is Active & Visible
            </Label>
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-1.5">
          <Label className="font-semibold text-slate-700 dark:text-zinc-300">
            Category Illustration / Image
          </Label>
          
          {imageUrl ? (
            <div className="relative w-full h-40 border border-slate-100 rounded-xl overflow-hidden bg-slate-50 dark:bg-zinc-800/20">
              <img
                src={getFullImageUrl(imageUrl)}
                alt="Category preview"
                className="w-full h-full object-contain"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 px-6 py-8 hover:bg-slate-50/50 dark:hover:bg-zinc-800/10 transition-colors">
              <div className="text-center">
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                    <span className="text-sm text-slate-500">Uploading illustration...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-8 w-8 text-slate-400" />
                    <div className="mt-2 flex text-sm text-slate-600 dark:text-zinc-400">
                      <label
                        htmlFor="image-upload"
                        className="relative cursor-pointer rounded-md font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 focus-within:outline-none"
                      >
                        <span>Upload a file</span>
                        <input
                          id="image-upload"
                          name="image-upload"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleImageUpload}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-slate-400">PNG, JPG, WEBP up to 5MB</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || isUploading}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : category ? (
            "Update Category"
          ) : (
            "Create Category"
          )}
        </Button>
      </div>
    </form>
  );
}
