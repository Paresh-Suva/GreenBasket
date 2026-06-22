export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface Category {
  id: number;
  parentId?: number | null;
  parentName?: string | null;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  active: boolean;
}

export interface ProductSummary {
  id: number;
  name: string;
  slug: string;
  effectivePrice: number;
  price: number;
  discountPrice?: number | null;
  inStock: boolean;
  featured: boolean;
  primaryImageUrl?: string;
  categoryName: string;
}

export interface ProductImage {
  id: number;
  imageUrl: string;
  altText?: string;
  primaryImage: boolean;
  sortOrder: number;
}

export interface Product {
  id: number;
  categoryId: number;
  categoryName: string;
  sku: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  discountPrice?: number | null;
  effectivePrice: number;
  stockQuantity: number;
  inStock: boolean;
  weight?: number;
  unit: 'KG' | 'GRAM' | 'LITER' | 'MILLILITER' | 'PIECE' | 'PACK' | 'DOZEN';
  brand?: string;
  featured: boolean;
  active: boolean;
  images: ProductImage[];
}

export interface CartItem {
  itemId: number;
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  discountPrice?: number | null;
  lineTotal: number;
  inStock: boolean;
  availableStock: number;
  productImageUrl?: string;
  categorySlug?: string | null;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  totalQuantity: number;
}

export interface WishlistItem {
  itemId: number;
  productId: number;
  productName: string;
  productSlug: string;
  effectivePrice: number;
  inStock: boolean;
  primaryImageUrl?: string;
  addedAt: string;
}

export interface Wishlist {
  items: WishlistItem[];
  totalItems: number;
}

export interface Review {
  id: number;
  userId: number;
  userFullName: string;
  productId: number;
  rating: number;
  reviewText?: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface RatingSummary {
  productId: number;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<string, number>;
}

export type AddressType = 'HOME' | 'WORK' | 'OTHER';

export interface Address {
  id: number;
  addressType: AddressType;
  label: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PACKED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'COD' | 'CARD' | 'UPI' | 'WALLET';

export interface DeliveryAddressSnapshot {
  label: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItemResponse {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  discountPrice?: number | null;
  lineTotal: number;
  productImageUrl?: string;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  deliveryFee: number;
  totalAmount: number;
  deliveryAddress: DeliveryAddressSnapshot;
  notes?: string;
  createdAt: string;
  items: OrderItemResponse[];
}

export interface OrderSummaryResponse {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  totalItems: number;
  productNamesSummary?: string;
}

export interface UserProfileResponse {
  publicId: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  roles: string[];
  emailVerified: boolean;
  accountStatus: string;
  walletBalance?: number;
}

export interface OrderTrackingResponse {
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerLatitude: number;
  customerLongitude: number;
  warehouseName: string;
  warehouseAddress: string;
  warehouseContact: string;
  warehouseLatitude: number;
  warehouseLongitude: number;
}


