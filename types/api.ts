// ---------- Users ----------
export interface Address {
  _id?: string;
  label?: string;
  street: string;
  city: string;
  state: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  avatarUrl?: string;
  addresses: Address[]; // present on auth/refresh/PATCH-me payloads
}

export interface AuthPayload {
  token: string;
  refreshToken: string;
  user: User;
}

// ---------- Catalog ----------
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  sku?: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: Category | string;
  imageUrl: { url: string; publicId: string }[]; // raw
  images: string[]; // flat convenience array — prefer this
  care: { sunlight: string; watering: string; temperature: string };
  stock: number;
  sold: number;
  rating: number;
  ratingCount: number;
  isPremium: boolean;
  tags: string[];
  status: 'active' | 'archived';
  createdAt: string;
}

export interface Paged<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

// ---------- Reviews ----------
export interface Review {
  _id: string;
  product: string;
  user: { _id: string; name: string; avatarUrl?: string };
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  createdAt: string;
}

// ---------- Cart ----------
export interface CartItem {
  id: string; // item id (also addressable by product id)
  product: string;
  name: string;
  price: number;
  stock: number;
  image: string;
  qty: number;
  size?: string;
  lineTotal: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
}

// ---------- Wishlist ----------
export interface WishlistEntry {
  _id: string;
  user: string;
  product: Pick<
    Product,
    | '_id'
    | 'name'
    | 'slug'
    | 'price'
    | 'compareAtPrice'
    | 'imageUrl'
    | 'stock'
    | 'rating'
    | 'sold'
    | 'status'
  > & {
    images?: string[];
  };
  createdAt: string;
}

// ---------- Checkout / orders ----------
export interface DeliveryQuote {
  deliveryFee: number;
  etaDays: number | null;
  freeShippingApplied: boolean;
  matchedArea: string | null;
  currency: 'NGN';
}

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  product: string;
  name: string;
  price: number;
  qty: number;
  size?: string;
  image?: string;
}

export interface Order {
  _id: string;
  user?: string;
  customerName?: string;
  customerEmail?: string;
  phone?: string;
  notes?: string;
  items: OrderItem[];
  shippingAddress: {
    state: string;
    city: string;
    street?: string;
    phone: string;
    name?: string;
  };
  payment: {
    provider: string;
    status: 'unpaid' | 'paid' | 'failed' | 'refunded';
    reference?: string;
    amount: number;
  };
  delivery: {
    provider?: string;
    trackingId?: string;
    status?: 'pending' | 'in_transit' | 'delivered' | 'returned';
    etaDays?: number;
    fee?: number;
  };
  status: OrderStatus;
  total: number;
  subtotal?: number;
  paidAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  createdAt: string;
}

export interface CheckoutResult {
  order: Order;
  txRef: string;
  paymentLink?: string;
  deliveryFee: number;
  subtotal: number;
  total: number;
}

export interface TimelineEntry {
  status: string;
  at: string | null;
}

// ---------- Settings ----------
export interface PublicSettings {
  storeName: string;
  supportEmail: string;
  phone: string;
  deliveryFee: number;
  freeShippingThreshold: number;
  paymentProvider: 'flutterwave' | 'paystack';
}

export interface AdminSettings extends PublicSettings {
  lowStockThreshold: number;
  vipThreshold: number;
  notifyOnNewOrder: boolean;
  notifyOnLowStock: boolean;
}

// ---------- Admin ----------
export interface AdminCustomer {
  id: string | null;
  name: string;
  email: string;
  joinedAt: string | null;
  totalSpend: number;
  ordersCount: number;
  lastOrderAt: string;
  vip: boolean;
}

export interface DashboardData {
  metrics: {
    revenue: number;
    monthOverMonthPct: number;
    orders: number;
    products: number;
    customers: number;
    lowStockCount: number;
  };
  recentOrders: Order[];
  topProducts: Product[];
}

export interface AnalyticsData {
  monthlySales: { year: number; month: number; revenue: number; orders: number }[]; // zero-filled, chronological
  statusDistribution: { status: OrderStatus; count: number }[];
  bestSellersBySales: Product[];
  bestSellersByRating: Product[];
}

export interface AdminNotification {
  _id: string;
  type: 'NEW_ORDER' | 'LOW_STOCK' | 'ORDER_STATUS';
  title: string;
  payload: Record<string, unknown>;
  readAt?: string;
  createdAt: string;
}

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'NEW' | 'REPLIED' | 'CLOSED';
  createdAt: string;
}
