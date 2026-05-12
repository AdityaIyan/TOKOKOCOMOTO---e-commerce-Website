import React, { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import api from '@/lib/axios';
import { CartItem } from '@/types';
import { useRouter } from 'next/router';

interface CartSummaryProps {
    items: CartItem[];
    onCheckout: () => void;
}

export const CartSummary: React.FC<CartSummaryProps> = ({ items, onCheckout }) => {
    const router = useRouter();
    const [shippingAddress, setShippingAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const handleCheckout = async () => {
        if (!shippingAddress.trim()) {
            alert('Please enter a shipping address');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/orders', { shippingAddress });
            alert('Order placed successfully!');
            onCheckout();
            router.push(`/orders/${response.data.id}`);
        } catch (error: any) {
            console.error('Checkout failed', error);
            alert(error.response?.data?.message || 'Checkout failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Order Summary</h3>
            <div className="flex justify-between mb-4">
                <span>Subtotal</span>
                <span>{formatCurrency(total)}</span>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Address</label>
                <textarea
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full p-2 border rounded-md text-sm"
                    rows={3}
                    placeholder="Enter your full address..."
                    required
                />
            </div>

            <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg mb-6">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                </div>
                <button
                    onClick={handleCheckout}
                    disabled={loading || items.length === 0}
                    className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Processing...' : 'Checkout'}
                </button>
            </div>
        </div>
    );
};
