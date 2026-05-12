import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CartItem } from '@/features/cart/components/CartItem';
import { CartSummary } from '@/features/cart/components/CartSummary';
import api from '@/lib/axios';
import { Cart } from '@/types';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';

const CartPage = () => {
    const [cart, setCart] = useState<Cart | null>(null);

    const { user, loading } = useAuth();
    const router = useRouter();

    const fetchCart = async () => {
        try {
            const response = await api.get('/cart');
            setCart(response.data);
        } catch (error) {
            console.error('Failed to fetch cart', error);
        }
    };

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/auth/login');
            } else {
                fetchCart();
            }
        }
    }, [user, loading, router]);

    if (!cart) return <div className="text-center py-20">Loading...</div>;

    return (
        <div className="container mx-auto py-12 px-6">
            <h1 className="text-3xl font-bold mb-12 uppercase tracking-widest text-center">Shopping Cart</h1>
            
            {cart.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold uppercase tracking-widest mb-4">Your cart is empty</h2>
                    <p className="text-gray-500 mb-8 max-w-md">Looks like you haven't added any premium eyewear to your cart yet.</p>
                    <Link href="/products" className="bg-black text-white px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-colors shadow-md">
                        Continue Shopping
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        {cart.items.map((item) => (
                            <CartItem key={item.id} item={item} onUpdate={fetchCart} />
                        ))}
                    </div>
                    <div>
                        <CartSummary items={cart.items} onCheckout={fetchCart} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
