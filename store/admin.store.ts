import { create } from "zustand";
import { persist } from "zustand/middleware";
import { products as initialProducts, type Product as SeedProduct } from "@/lib/data/products";

export interface Product extends SeedProduct {
    stock: number;
    rating?: number;
    sku?: string;
    createdAt: string;
    updatedAt: string;
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
    productId: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
}

export interface Order {
    id: string;
    customerName: string;
    customerEmail: string;
    items: OrderItem[];
    subtotal: number;
    delivery: number;
    total: number;
    status: OrderStatus;
    paymentStatus: "paid" | "unpaid";
    createdAt: string;
    shippingAddress: string;
}

export interface Customer {
    id: string;
    name: string;
    email: string;
    joinedAt: string;
    totalSpend: number;
    ordersCount: number;
}

interface AdminState {
    products: Product[];
    orders: Order[];
    customers: Customer[];

    // product ops
    addProduct: (p: Omit<Product, "id" | "createdAt" | "updatedAt">) => void;
    updateProduct: (id: string, p: Partial<Product>) => void;
    deleteProduct: (id: string) => void;

    // order ops
    addOrder: (o: Omit<Order, "id" | "createdAt" | "status" | "paymentStatus">) => Order;
    updateOrderStatus: (id: string, status: OrderStatus) => void;
    deleteOrder: (id: string) => void;
}

const now = () => new Date().toISOString();

const seedOrders: Order[] = [
    {
        id: "ord_1001",
        customerName: "Amaka Okoye",
        customerEmail: "amaka@example.com",
        items: [
            {
                productId: "p1",
                name: "Monstera Deliciosa",
                price: 7500,
                image: "/images/plants/5.jpg",
                quantity: 1,
            },
        ],
        subtotal: 7500,
        delivery: 3500,
        total: 11000,
        status: "delivered",
        paymentStatus: "paid",
        createdAt: "2025-07-12T09:30:00.000Z",
        shippingAddress: "12 Admiralty Way, Lekki, Lagos",
    },
    {
        id: "ord_1002",
        customerName: "Daniel Adebayo",
        customerEmail: "daniel@example.com",
        items: [
            {
                productId: "p2",
                name: "Home Space Optimizer",
                price: 11900,
                image: "/images/plants/2.jpg",
                quantity: 1,
            },
        ],
        subtotal: 11900,
        delivery: 3500,
        total: 15400,
        status: "shipped",
        paymentStatus: "paid",
        createdAt: "2025-07-21T14:12:00.000Z",
        shippingAddress: "4 Bodija Road, Ibadan, Oyo",
    },
    {
        id: "ord_1003",
        customerName: "Sarah Johnson",
        customerEmail: "sarah@example.com",
        items: [
            {
                productId: "p3",
                name: "Workspace Productivity Designer",
                price: 9500,
                image: "/images/plants/3.jpg",
                quantity: 2,
            },
        ],
        subtotal: 19000,
        delivery: 3500,
        total: 22500,
        status: "processing",
        paymentStatus: "paid",
        createdAt: "2025-08-01T08:05:00.000Z",
        shippingAddress: "21 Wuse Zone 5, Abuja, FCT",
    },
    {
        id: "ord_1004",
        customerName: "Chinedu Obi",
        customerEmail: "chinedu@example.com",
        items: [
            {
                productId: "p4",
                name: "Garden & Outdoor Planner",
                price: 8500,
                image: "/images/plants/4.jpg",
                quantity: 1,
            },
        ],
        subtotal: 8500,
        delivery: 3500,
        total: 12000,
        status: "pending",
        paymentStatus: "unpaid",
        createdAt: "2025-08-05T17:48:00.000Z",
        shippingAddress: "7 Independence Layout, Enugu",
    },
];

const deriveCustomers = (orders: Order[]): Customer[] => {
    const map = new Map<string, Customer>();
    for (const o of orders) {
        const existing = map.get(o.customerEmail);
        if (existing) {
            existing.ordersCount += 1;
            existing.totalSpend += o.total;
        } else {
            map.set(o.customerEmail, {
                id: `c_${o.customerEmail}`,
                name: o.customerName,
                email: o.customerEmail,
                joinedAt: o.createdAt,
                totalSpend: o.total,
                ordersCount: 1,
            });
        }
    }
    return Array.from(map.values()).sort((a, b) => b.totalSpend - a.totalSpend);
};

const seedProducts: Product[] = initialProducts.map((p, idx) => ({
    ...p,
    stock: 25 - idx * 3,
    rating: 4.2 + idx * 0.2,
    sku: `SKU-${p.id.toUpperCase()}-${100 + idx}`,
    createdAt: "2025-01-15T10:00:00.000Z",
    updatedAt: "2025-07-20T12:00:00.000Z",
}));

export const useAdminStore = create<AdminState>()(
    persist(
        (set, get) => ({
            products: seedProducts,
            orders: seedOrders,
            customers: deriveCustomers(seedOrders),

            addProduct: (p) =>
                set((state) => {
                    const id = `p_${Date.now()}`;
                    const product: Product = {
                        ...p,
                        id,
                        createdAt: now(),
                        updatedAt: now(),
                    };
                    return { products: [product, ...state.products] };
                }),

            updateProduct: (id, patch) =>
                set((state) => ({
                    products: state.products.map((p) =>
                        p.id === id ? { ...p, ...patch, updatedAt: now() } : p
                    ),
                })),

            deleteProduct: (id) =>
                set((state) => ({
                    products: state.products.filter((p) => p.id !== id),
                })),

            addOrder: (o) => {
                const id = `ord_${1000 + get().orders.length + 1}`;
                const order: Order = {
                    ...o,
                    id,
                    createdAt: now(),
                    status: "pending",
                    paymentStatus: "paid",
                };
                set((state) => ({
                    orders: [order, ...state.orders],
                    customers: deriveCustomers([order, ...state.orders]),
                }));
                return order;
            },

            updateOrderStatus: (id, status) =>
                set((state) => ({
                    orders: state.orders.map((o) =>
                        o.id === id ? { ...o, status } : o
                    ),
                })),

            deleteOrder: (id) =>
                set((state) => ({
                    orders: state.orders.filter((o) => o.id !== id),
                    customers: deriveCustomers(state.orders.filter((o) => o.id !== id)),
                })),
        }),
        {
            name: "garden-fairy-admin",
        }
    )
);
