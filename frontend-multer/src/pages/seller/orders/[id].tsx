import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '@/lib/axios';
import { Order } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

const SellerOrderDetailPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const { user, loading: authLoading } = useAuth();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (!authLoading) {
            if (!user || (user.role !== 'SELLER' && user.role !== 'ADMIN')) {
                router.push('/');
            } else if (id) {
                fetchOrder();
            }
        }
    }, [id, user, authLoading]);

    const fetchOrder = async () => {
        try {
            const response = await api.get(`/orders/${id}`);
            setOrder(response.data);
        } catch (error) {
            console.error('Failed to fetch order', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;

        setUpdating(true);
        try {
            await api.put(`/orders/${id}/status`, { status: newStatus });
            setOrder(prev => prev ? { ...prev, status: newStatus } : null);
            alert('Order status updated');
        } catch (error: any) {
            console.error('Failed to update status', error);
            alert(error.response?.data?.message || 'Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    if (loading || authLoading) return <div className="text-center py-20">Loading...</div>;
    if (!order) return <div className="text-center py-20">Order not found</div>;

    return (
        <div className="container mx-auto py-12 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Order Details #{order.id}</h1>
                <Link href="/seller/orders" className="text-sm font-bold hover:text-gray-600 transition-colors">Back to Orders</Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-bold mb-4">Items</h3>
                        <div className="space-y-4">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex justify-between items-center border-b pb-4 last:border-0">
                                    <div>
                                        <p className="font-medium">{item.product.name}</p>
                                        <p className="text-sm text-gray-500">Qty: {item.quantity} x {formatCurrency(item.price)}</p>
                                    </div>
                                    <p className="font-bold">{formatCurrency(item.price * item.quantity)}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>{formatCurrency(order.totalAmount)}</span>
                        </div>
                    </div>

                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-bold mb-4">Shipping Information</h3>
                        <p className="text-gray-700">{order.shippingAddress || 'No address provided'}</p>
                    </div>

                    {order.paymentProof && (
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-bold mb-4">Payment Verification</h3>
                            <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Method: <span className="text-black">{order.paymentMethod}</span></p>
                            <div className="w-full h-auto bg-gray-100 rounded border border-gray-200 overflow-hidden mb-6 flex justify-center">
                                <img 
                                    src={`http://localhost:4000/public/uploads/${order.paymentProof}`} 
                                    alt="Payment Proof" 
                                    className="max-w-full object-contain max-h-[500px]"
                                />
                            </div>
                            
                            {order.status === 'VERIFYING' && (
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => handleStatusChange('PAID')}
                                        disabled={updating}
                                        className="flex-1 bg-black text-white py-3 rounded font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
                                    >
                                        Approve Payment
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange('UNPAID')}
                                        disabled={updating}
                                        className="flex-1 bg-white text-red-600 border border-red-600 py-3 rounded font-bold uppercase tracking-widest hover:bg-red-50 transition-colors disabled:opacity-50"
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-bold mb-4">Order Status</h3>
                        <div className="mb-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wide block text-center ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                order.status === 'VERIFYING' ? 'bg-orange-100 text-orange-800' :
                                    'bg-blue-100 text-blue-800'
                                }`}>
                                {order.status}
                            </span>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500 mb-2">Update Status:</p>
                            {['UNPAID', 'VERIFYING', 'PAID', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => handleStatusChange(status)}
                                    disabled={updating || order.status === status}
                                    className={`w-full py-2 px-4 rounded text-xs font-bold uppercase tracking-widest transition-colors ${order.status === status
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white border border-black hover:bg-black hover:text-white'
                                        }`}
                                >
                                    Mark as {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerOrderDetailPage;
