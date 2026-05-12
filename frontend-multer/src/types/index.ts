export interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
    sku?: string;
    description?: string;
    category: string;
    images: string; // JSON string
    sellerId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CartItem {
    id: number;
    cartId: number;
    productId: number;
    quantity: number;
    product: Product;
}

export interface Cart {
    id: number;
    userId: string;
    items: CartItem[];
    updatedAt: string;
}

export interface OrderItem {
    id: number;
    orderId: number;
    productId: number;
    quantity: number;
    price: number;
    product: Product;
}

export interface Order {
    id: number;
    userId: string;
    totalAmount: number;
    status: string;
    shippingAddress: string;
    paymentMethod?: string;
    paymentProof?: string;
    items: OrderItem[];
    createdAt: string;
    updatedAt: string;
}

export interface User {
    username: string;
    role: string;
    email: string;
    avatar?: string;
}
