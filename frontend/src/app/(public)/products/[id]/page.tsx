"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { productsService } from "@/services/products.service";
import { reviewsService } from "@/services/reviews.service";
import { useAuthStore } from "@/store/useAuthStore";
import { PriceTag } from "@/components/storefront/PriceTag";
import { RatingStars } from "@/components/storefront/RatingStars";
import { AddToCartButton } from "@/components/storefront/AddToCartButton";
import { LoadingState } from "@/components/ui/loading-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Star, ShieldCheck } from "lucide-react";
import { AxiosError } from "axios";
import { getProductImage } from "@/components/storefront/ProductCard";
import { getFullImageUrl } from "@/services/api";

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const slug = params.id as string;

  const { isAuthenticated } = useAuthStore();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Review form states
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState("");

  // 1. Fetch Product details
  const { data: productRes, isLoading: isProductLoading, error: productError } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => productsService.getProductBySlug(slug),
    enabled: !!slug
  });

  const product = productRes?.data;
  const productId = product?.id;

  // 2. Fetch Reviews (only if product is loaded)
  const { data: reviewsRes, isLoading: isReviewsLoading } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => reviewsService.getProductReviews(productId!),
    enabled: !!productId
  });

  // 3. Fetch Ratings Summary (only if product is loaded)
  const { data: ratingSummaryRes, isLoading: isSummaryLoading } = useQuery({
    queryKey: ["rating-summary", productId],
    queryFn: () => reviewsService.getProductRatingSummary(productId!),
    enabled: !!productId
  });

  // 4. Mutation to create review
  const createReviewMutation = useMutation({
    mutationFn: (data: { productId: number; rating: number; reviewText: string }) =>
      reviewsService.createReview(data),
    onSuccess: () => {
      toast.success("Review submitted successfully!");
      setReviewText("");
      setRating(5);
      // Invalidate queries to reload review list
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["rating-summary", productId] });
    },
    onError: (error: unknown) => {
      const errMsg = (error as AxiosError<{ message?: string }>).response?.data?.message || "Failed to submit review. You may have already reviewed this product.";
      toast.error(errMsg);
    }
  });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please login to submit a review");
      router.push("/login");
      return;
    }
    if (!productId) return;

    createReviewMutation.mutate({
      productId,
      rating,
      reviewText
    });
  };

  const isLoading = isProductLoading || isReviewsLoading || isSummaryLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingState text="Loading product details..." />
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 bg-card rounded-2xl border border-slate-100 p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Product Not Found</h2>
        <p className="text-slate-500 mb-6">{"We couldn't find the product you're looking for. It may have been deactivated or removed."}</p>
        <Link href="/products">
          <Button className="bg-primary hover:bg-primary/95 text-white rounded-full">
            Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  const reviews = reviewsRes?.data || [];
  const ratingSummary = ratingSummaryRes?.data;

  // Image list extraction
  const images = product.images.length > 0
    ? product.images.map(img => ({
        ...img,
        imageUrl: getFullImageUrl(img.imageUrl)
      })).sort((a, b) => a.sortOrder - b.sortOrder)
    : [{
        id: 0,
        imageUrl: getProductImage(product.name, product.categoryName, null),
        altText: product.name,
        primaryImage: true,
        sortOrder: 0
      }];

  const activeImage = images[activeImageIndex]?.imageUrl || "/images/placeholder.png";

  // Compute rating percentage bars
  const totalReviews = ratingSummary?.totalReviews || 0;
  const avgRating = ratingSummary?.averageRating || 0.0;
  const distribution = ratingSummary?.ratingDistribution || {};

  const getPercent = (stars: number) => {
    if (totalReviews === 0) return 0;
    const count = distribution[String(stars)] || 0;
    return Math.round((count / totalReviews) * 100);
  };

  return (
    <div className="max-w-7xl mx-auto py-4">
      {/* Back Link */}
      <Link href="/products" className="flex items-center gap-1.5 text-slate-600 hover:text-primary text-sm font-semibold mb-6 w-max cursor-pointer">
        <ArrowLeft size={16} />
        <span>Back to Products</span>
      </Link>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-card border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm mb-12">
        
        {/* Left Column: Product Gallery */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square w-full bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden flex items-center justify-center p-6">
            <Image
              src={activeImage}
              alt={product.name}
              fill
              className="object-contain p-4 transition-all duration-300"
              priority
            />
          </div>
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden bg-slate-50 border flex items-center justify-center p-2 cursor-pointer shrink-0 transition-all ${
                    idx === activeImageIndex
                      ? "border-primary ring-2 ring-primary/10 shadow-sm"
                      : "border-slate-100 hover:border-slate-300"
                  }`}
                >
                  <Image
                    src={img.imageUrl}
                    alt={img.altText || product.name}
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info */}
        <div className="flex flex-col gap-5 text-left justify-start">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-primary tracking-widest uppercase bg-primary/5 border border-primary/10 px-2.5 py-0.5 rounded-full w-max">
              {product.categoryName}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-tight mt-1">
              {product.name}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-sm font-semibold">
              <RatingStars rating={avgRating} count={totalReviews} showCount />
              <span className="text-slate-300">|</span>
              <span className="text-slate-600">Brand: <span className="font-bold text-slate-800">{product.brand || "GreenBasket"}</span></span>
            </div>
          </div>

          <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-3">
            <PriceTag
              price={product.price}
              discountPrice={product.discountPrice}
              priceClassName="text-2xl sm:text-3xl font-black"
              originalPriceClassName="text-base"
            />
            {product.discountPrice && (
              <Badge className="bg-success text-white font-bold text-[10px] uppercase w-max tracking-wide">
                Save {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(product.price - product.discountPrice)}
              </Badge>
            )}
          </div>

          <div className="flex flex-col gap-3.5 text-sm font-semibold text-slate-700">
            <div className="flex gap-2">
              <span className="text-slate-400 w-24">SKU:</span>
              <span className="text-slate-800">{product.sku}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-slate-400 w-24">Pack Weight:</span>
              <span className="text-slate-800">{product.weight ? `${product.weight} ${product.unit}` : `1 ${product.unit}`}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-slate-400 w-24">Availability:</span>
              <span className={`font-bold ${product.stockQuantity > 0 ? "text-primary" : "text-red-500"}`}>
                {product.stockQuantity > 0 ? `In Stock (${product.stockQuantity} items)` : "Out of Stock"}
              </span>
            </div>
          </div>

          {/* Checkout CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 items-center mt-3 w-full border-t border-slate-100 pt-5">
            <AddToCartButton
              productId={product.id}
              stockQuantity={product.stockQuantity}
              className="w-full h-12 text-base rounded-full shadow-md shadow-emerald-700/5"
            />
          </div>
        </div>

      </div>

      {/* Product Description Tabs & Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-12">
        <div className="lg:col-span-2 bg-card border border-slate-100 rounded-3xl p-6 sm:p-8 text-left">
          <h3 className="font-extrabold text-slate-800 text-lg tracking-tight mb-4 border-b border-slate-50 pb-2">
            Product Description
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
            {product.description || "No description available for this product. Our organic groceries are sourced from selected ecological growers and processed under strict quality control to deliver the highest freshness and taste."}
          </p>
        </div>

        <div className="bg-card border border-slate-100 rounded-3xl p-6 sm:p-8 text-left">
          <h3 className="font-extrabold text-slate-800 text-lg tracking-tight mb-4 border-b border-slate-50 pb-2">
            Specifications
          </h3>
          <div className="flex flex-col gap-3 text-xs font-semibold text-slate-700">
            <div className="flex justify-between border-b border-slate-50 pb-1.5">
              <span className="text-slate-400">Brand</span>
              <span>{product.brand || "Local Farm"}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-1.5">
              <span className="text-slate-400">SKU</span>
              <span>{product.sku}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-1.5">
              <span className="text-slate-400">Package Unit</span>
              <span>{product.unit}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-1.5">
              <span className="text-slate-400">Weight</span>
              <span>{product.weight ? `${product.weight} ${product.unit}` : "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Featured</span>
              <span>{product.featured ? "Yes" : "No"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-card border border-slate-100 rounded-3xl p-6 sm:p-8 text-left grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Review Summaries Column */}
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="font-extrabold text-slate-800 text-lg tracking-tight mb-1">
              Customer Reviews
            </h3>
            <p className="text-xs text-muted-foreground font-semibold">
              Share your thoughts with other customers
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50/50 border border-slate-100 rounded-2xl p-5 w-full">
            <div className="text-center">
              <span className="text-4xl font-black text-slate-800">{avgRating.toFixed(1)}</span>
              <span className="block text-[10px] font-bold text-slate-400 uppercase mt-0.5">out of 5</span>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <RatingStars rating={avgRating} starSize={14} />
              <span className="text-xs text-slate-500 font-semibold">{totalReviews} customer ratings</span>
            </div>
          </div>

          {/* Rating Percentage bars */}
          <div className="flex flex-col gap-2.5 font-semibold text-xs text-slate-600">
            {[5, 4, 3, 2, 1].map((stars) => {
              const pct = getPercent(stars);
              return (
                <div key={stars} className="flex items-center gap-3">
                  <span className="w-12 text-right">{stars} star</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-slate-400 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews List & Submission Form */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Submit Review Form */}
          <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/30">
            <h4 className="font-bold text-slate-800 text-sm mb-4">
              Write a Review
            </h4>
            <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
              {/* Star Rating picker */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Your Rating:</span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onMouseEnter={() => setHoveredRating(val)}
                      onMouseLeave={() => setHoveredRating(null)}
                      onClick={() => setRating(val)}
                      className="text-slate-300 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        size={20}
                        className={`${
                          val <= (hoveredRating ?? rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div className="flex flex-col gap-1.5">
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="What did you like or dislike? How fresh was the packaging?"
                  required
                  className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl min-h-[90px] p-3 text-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={createReviewMutation.isPending}
                className="bg-primary hover:bg-primary/95 text-white font-bold rounded-full w-max px-6 h-9 self-end cursor-pointer"
              >
                Submit Review
              </Button>
            </form>
          </div>

          {/* List of Reviews */}
          <div className="flex flex-col gap-6">
            <h4 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-2">
              Reviews ({reviews.length})
            </h4>
            {reviews.length > 0 ? (
              <div className="flex flex-col gap-6 divide-y divide-slate-50">
                {reviews.map((rev, idx) => (
                  <div key={rev.id} className={`flex flex-col gap-2 ${idx > 0 ? "pt-5" : ""}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-sm">{rev.userFullName}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <RatingStars rating={rev.rating} starSize={12} />
                      {rev.verifiedPurchase && (
                        <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                          <ShieldCheck size={10} />
                          <span>Verified Purchase</span>
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mt-1">
                      {rev.reviewText}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm font-semibold text-center py-6">
                No reviews yet. Be the first to write a review!
              </p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
