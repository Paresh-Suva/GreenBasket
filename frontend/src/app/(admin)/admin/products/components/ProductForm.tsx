"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Upload, X, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { Product, Category } from "@/types";
import { productsService } from "@/services/products.service";
import { categoriesService } from "@/services/categories.service";
import { getFullImageUrl } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  sku: z.string().min(3, "SKU must be at least 3 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  categoryId: z.number({ message: "Category is required" }),
  description: z.string().optional(),
  price: z.number().min(0.01, "Price must be at least 0.01"),
  discountPrice: z.number().min(0, "Discount price must be non-negative").nullable().optional(),
  stockQuantity: z.number().min(0, "Stock quantity must be non-negative"),
  weight: z.number().min(0.001, "Weight must be greater than 0"),
  unit: z.enum(["KG", "GRAM", "LITER", "MILLILITER", "PIECE", "PACK", "DOZEN"]),
  brand: z.string().optional(),
  featured: z.boolean(),
  active: z.boolean(),
  imageUrl: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product | null;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

export function ProductForm({ product, categories, onClose, onSuccess }: ProductFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>(
    product?.images?.find((img) => img.primaryImage)?.imageUrl || undefined
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<Category | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      sku: product?.sku || "",
      slug: product?.slug || "",
      categoryId: product?.categoryId || (categories.length > 0 ? categories[0].id : 0),
      description: product?.description || "",
      price: product?.price || 0.01,
      discountPrice: product?.discountPrice || null,
      stockQuantity: product?.stockQuantity || 0,
      weight: product?.weight || 1,
      unit: (product?.unit as "KG" | "GRAM" | "LITER" | "MILLILITER" | "PIECE" | "PACK" | "DOZEN") || "PIECE",
      brand: product?.brand || "",
      featured: product?.featured || false,
      active: product?.active ?? true,
      imageUrl: product?.images?.find((img) => img.primaryImage)?.imageUrl || "",
    },
  });

  const productName = watch("name");

  // Auto-generate slug from name if creating a new product
  useEffect(() => {
    if (!product && productName) {
      const generatedSlug = productName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [productName, product, setValue]);

  // AI Category Suggestion Helper
  useEffect(() => {
    if (!productName || categories.length === 0) {
      setAiSuggestion(null);
      return;
    }

    const nameLower = productName.toLowerCase();
    let suggestedSlug = "";

    if (/apple|banana|orange|mango|grape|berry|strawberry|fruit/i.test(nameLower)) {
      suggestedSlug = "fruits";
    } else if (/spinach|carrot|potato|tomato|onion|cabbage|garlic|ginger|vegetable|veg/i.test(nameLower)) {
      suggestedSlug = "vegetables";
    } else if (/milk|cheese|butter|yogurt|cream|dairy/i.test(nameLower)) {
      suggestedSlug = "dairy";
    } else if (/bread|bun|cake|cookie|pastry|bakery/i.test(nameLower)) {
      suggestedSlug = "bakery";
    } else if (/chicken|meat|beef|pork|fish|egg|mutton/i.test(nameLower)) {
      suggestedSlug = "meat-fish";
    } else if (/juice|soda|water|drink|tea|coffee|beverage/i.test(nameLower)) {
      suggestedSlug = "beverages";
    } else if (/oil|rice|flour|sugar|salt|spice|pulse|lentil|grain|grocery/i.test(nameLower)) {
      suggestedSlug = "groceries";
    }

    if (suggestedSlug) {
      const matchedCategory = categories.find(
        (c) => c.slug.toLowerCase() === suggestedSlug || c.slug.toLowerCase().includes(suggestedSlug)
      );
      if (matchedCategory) {
        setAiSuggestion(matchedCategory);
      } else {
        setAiSuggestion(null);
      }
    } else {
      setAiSuggestion(null);
    }
  }, [productName, categories]);

  const applyAiSuggestion = () => {
    if (aiSuggestion) {
      setValue("categoryId", aiSuggestion.id, { shouldValidate: true });
      toast.success(`Category set to "${aiSuggestion.name}"`);
      setAiSuggestion(null);
    }
  };

  const generateSku = () => {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    setValue("sku", `GB-PROD-${randomSuffix}`, { shouldValidate: true });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);
      const res = await categoriesService.uploadImage(formData);
      setImageUrl(res.data.imageUrl);
      setValue("imageUrl", res.data.imageUrl, { shouldValidate: true });
      toast.success("Product image uploaded successfully");
    } catch (err) {
      console.error(err);
      toast.error((err as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(undefined);
    setValue("imageUrl", "");
  };

  const onSubmit = async (values: ProductFormValues) => {
    try {
      setIsSubmitting(true);
      
      const payloadDetails = {
        categoryId: Number(values.categoryId),
        sku: values.sku,
        name: values.name,
        slug: values.slug,
        description: values.description || null,
        price: values.price,
        discountPrice: values.discountPrice || null,
        weight: values.weight,
        unit: values.unit,
        brand: values.brand || null,
        featured: values.featured,
      };

      let createdOrUpdatedProduct: Product;

      if (product) {
        // Edit flow
        const detailsRes = await productsService.updateProduct(product.id, payloadDetails);
        createdOrUpdatedProduct = detailsRes.data;

        // If stock has changed, update stock separately
        if (values.stockQuantity !== product.stockQuantity) {
          await productsService.updateStock(product.id, values.stockQuantity);
        }

        // Handle image changes
        const existingPrimary = product.images?.find((img) => img.primaryImage);
        if (imageUrl && imageUrl !== existingPrimary?.imageUrl) {
          // If there was an old image, remove it
          if (existingPrimary) {
            await productsService.removeProductImage(existingPrimary.id);
          }
          // Associate the new uploaded image
          await productsService.addProductImage(product.id, {
            imageUrl,
            altText: values.name,
            primaryImage: true,
            sortOrder: 0,
          });
        } else if (!imageUrl && existingPrimary) {
          // Image removed completely
          await productsService.removeProductImage(existingPrimary.id);
        }

        toast.success("Product updated successfully");
      } else {
        // Create flow (Create request requires stockQuantity on creation)
        const createPayload = {
          ...payloadDetails,
          stockQuantity: values.stockQuantity,
          active: values.active,
        };
        const createRes = await productsService.createProduct(createPayload);
        createdOrUpdatedProduct = createRes.data;

        // If an image was uploaded, associate it
        if (imageUrl) {
          await productsService.addProductImage(createdOrUpdatedProduct.id, {
            imageUrl,
            altText: values.name,
            primaryImage: true,
            sortOrder: 0,
          });
        }
        toast.success("Product created successfully");
      }

      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error((err as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto px-1 py-2">
      {/* 2 Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Hand Details */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="font-semibold text-slate-700 dark:text-zinc-300">
              Product Name *
            </Label>
            <Input id="name" placeholder="e.g. Organic Gala Apples" {...register("name")} />
            {errors.name && <p className="text-xs font-semibold text-rose-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sku" className="font-semibold text-slate-700 dark:text-zinc-300">
              SKU (Stock Keeping Unit) *
            </Label>
            <div className="flex gap-2">
              <Input id="sku" placeholder="e.g. GB-APPLE-001" className="font-mono text-sm" {...register("sku")} />
              <Button type="button" variant="outline" size="sm" onClick={generateSku}>
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                Auto
              </Button>
            </div>
            {errors.sku && <p className="text-xs font-semibold text-rose-500">{errors.sku.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="slug" className="font-semibold text-slate-700 dark:text-zinc-300">
              SEO Slug *
            </Label>
            <Input id="slug" placeholder="e.g. organic-gala-apples" {...register("slug")} />
            {errors.slug && <p className="text-xs font-semibold text-rose-500">{errors.slug.message}</p>}
          </div>

          {/* Category Input & AI Suggestion Block */}
          <div className="space-y-1.5 relative">
            <Label htmlFor="categoryId" className="font-semibold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
              <span>Category *</span>
            </Label>
            
            <select
              id="categoryId"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("categoryId", { valueAsNumber: true })}
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.parentName ? `${c.parentName} > ${c.name}` : c.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className="text-xs font-semibold text-rose-500">{errors.categoryId.message}</p>}

            {/* Premium AI suggestion badge */}
            {aiSuggestion && (
              <div className="mt-2 p-2.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-zinc-800/20 dark:to-zinc-800/10 border border-emerald-100 dark:border-zinc-700 flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-400 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                  <span>Suggest placing in: {aiSuggestion.name}</span>
                </div>
                <Button type="button" size="xs" onClick={applyAiSuggestion} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-6 py-0 px-2.5 text-[11px] rounded-lg">
                  Apply
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Hand Details */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="price" className="font-semibold text-slate-700 dark:text-zinc-300">
                Price (₹) *
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="4.99"
                {...register("price", { valueAsNumber: true })}
              />
              {errors.price && <p className="text-xs font-semibold text-rose-500">{errors.price.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="discountPrice" className="font-semibold text-slate-700 dark:text-zinc-300">
                Discount Price (₹)
              </Label>
              <Input
                id="discountPrice"
                type="number"
                step="0.01"
                placeholder="3.99"
                {...register("discountPrice", {
                  setValueAs: (v) => (v === "" ? null : Number(v)),
                })}
              />
              {errors.discountPrice && <p className="text-xs font-semibold text-rose-500">{errors.discountPrice.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="weight" className="font-semibold text-slate-700 dark:text-zinc-300">
                Weight *
              </Label>
              <Input
                id="weight"
                type="number"
                step="0.001"
                placeholder="1.5"
                {...register("weight", { valueAsNumber: true })}
              />
              {errors.weight && <p className="text-xs font-semibold text-rose-500">{errors.weight.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="unit" className="font-semibold text-slate-700 dark:text-zinc-300">
                Unit *
              </Label>
              <select
                id="unit"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                {...register("unit")}
              >
                <option value="KG">Kilogram (KG)</option>
                <option value="GRAM">Gram (GRAM)</option>
                <option value="LITER">Liter (LITER)</option>
                <option value="MILLILITER">Milliliter (MILLILITER)</option>
                <option value="PIECE">Piece (PIECE)</option>
                <option value="PACK">Pack (PACK)</option>
                <option value="DOZEN">Dozen (DOZEN)</option>
              </select>
              {errors.unit && <p className="text-xs font-semibold text-rose-500">{errors.unit.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="stockQuantity" className="font-semibold text-slate-700 dark:text-zinc-300">
                Stock Quantity *
              </Label>
              <Input
                id="stockQuantity"
                type="number"
                placeholder="100"
                {...register("stockQuantity", { valueAsNumber: true })}
              />
              {errors.stockQuantity && <p className="text-xs font-semibold text-rose-500">{errors.stockQuantity.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="brand" className="font-semibold text-slate-700 dark:text-zinc-300">
                Brand Name
              </Label>
              <Input id="brand" placeholder="e.g. GreenFarm" {...register("brand")} />
              {errors.brand && <p className="text-xs font-semibold text-rose-500">{errors.brand.message}</p>}
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="flex gap-4 pt-4">
            <div className="flex items-center gap-2">
              <input
                id="featured"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                {...register("featured")}
              />
              <Label htmlFor="featured" className="font-semibold text-slate-700 dark:text-zinc-300 select-none">
                Featured Product
              </Label>
            </div>

            {!product && (
              <div className="flex items-center gap-2">
                <input
                  id="active"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  {...register("active")}
                />
                <Label htmlFor="active" className="font-semibold text-slate-700 dark:text-zinc-300 select-none">
                  Active
                </Label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description" className="font-semibold text-slate-700 dark:text-zinc-300">
          Product Description
        </Label>
        <textarea
          id="description"
          rows={3}
          placeholder="Details about the organic product..."
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          {...register("description")}
        />
        {errors.description && <p className="text-xs font-semibold text-rose-500">{errors.description.message}</p>}
      </div>

      {/* Image Upload Area */}
      <div className="space-y-1.5">
        <Label className="font-semibold text-slate-700 dark:text-zinc-300">Product Image</Label>

        {imageUrl ? (
          <div className="relative w-full h-44 border border-slate-100 dark:border-zinc-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-zinc-800/10 flex items-center justify-center">
            <img
              src={getFullImageUrl(imageUrl)}
              alt="Product preview"
              className="max-h-full max-w-full object-contain"
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
          <div className="flex justify-center rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 px-6 py-6 hover:bg-slate-50/50 dark:hover:bg-zinc-800/10 transition-colors">
            <div className="text-center">
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                  <span className="text-sm text-slate-500 font-semibold">Uploading product image...</span>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto h-8 w-8 text-slate-400" />
                  <div className="mt-2 flex text-sm text-slate-600 dark:text-zinc-400">
                    <label
                      htmlFor="p-image-upload"
                      className="relative cursor-pointer rounded-md font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 focus-within:outline-none"
                    >
                      <span>Upload an image</span>
                      <input
                        id="p-image-upload"
                        name="p-image-upload"
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

      {/* Action Buttons */}
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
          ) : product ? (
            "Update Product"
          ) : (
            "Create Product"
          )}
        </Button>
      </div>
    </form>
  );
}
