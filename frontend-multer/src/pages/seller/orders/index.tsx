import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '@/lib/axios';
import { Order } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

const SellerOrdersPage = () => {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            if (!user || (user.role !== 'SELLER' && user.role !== 'ADMIN')) {
                router.push('/');
            } else {
                fetchOrders();
            }
        }
    }, [user, authLoading]);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders');
            // Assuming the backend returns all orders for now, or filters by seller if implemented.
            // If backend returns all orders, we might need to filter client-side if the API doesn't do it.
            // But typically /orders for a seller should return orders relevant to them.
            // Let's assume the backend handles it or we show all for now.
            const data = response.data;
            // Handle potentially paginated response
            const ordersData = Array.isArray(data) ? data : (data.data || []);
            setOrders(ordersData);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || authLoading) return <div className="text-center py-20">Loading...</div>;

    return (
        <div className="container mx-auto py-12 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Manage Orders</h1>
                <Link href="/seller/dashboard" className="text-sm font-bold hover:text-gray-600 transition-colors !no-underline">Back to Dashboard</Link>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(order.totalAmount)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <Link href={`/seller/orders/${order.id}`} className="text-indigo-600 hover:text-indigo-900 !no-underline">
                                        View Details
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SellerOrdersPage;
