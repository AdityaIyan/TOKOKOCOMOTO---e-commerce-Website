import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '@/lib/axios';
import { Order } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Package } from 'lucide-react';

const OrdersPage = () => {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        status: '',
        startDate: '',
        endDate: '',
    });

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                alert(orders)
                // router.push('/auth/login');
            } else {
                fetchOrders();
            }
        }
    }, [user, authLoading, page, filters]); // Re-fetch when filters/page change

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '5',
                ...(filters.status && { status: filters.status }),
                ...(filters.startDate && { startDate: filters.startDate }),
                ...(filters.endDate && { endDate: filters.endDate }),
            });
            const response = await api.get(`/orders?${params.toString()}`);
            setOrders(response.data.data || []);
            setTotalPages(response.data.totalPages || 1);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (orderId: string) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status: 'CANCELLED' });
            alert('Order cancelled successfully');
            fetchOrders();
        } catch (error: any) {
            console.error('Failed to cancel order', error);
            alert(error.response?.data?.message || 'Failed to cancel order');
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setPage(1); // Reset to page 1 on filter change
    };

    if (authLoading) return <div className="text-center py-20">Loading...</div>;

    return (
        <div className="container mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold mb-8">My Orders</h1>

            {/* Filters */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-wrap gap-6 items-end">
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500">Status</label>
                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="w-40 p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                    >
                        <option value="">All Statuses</option>
                        <option value="UNPAID">Unpaid</option>
                        <option value="PAID">Paid</option>
                        <option value="PACKED">Packed</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500">Start Date</label>
                    <input
                        type="date"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                        className="p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500">End Date</label>
                    <input
                        type="date"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                        className="p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20">Loading Orders...</div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                        <Package className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-bold uppercase tracking-widest mb-2">No orders found</h2>
                    <p className="text-gray-500 mb-8 max-w-md">You haven't placed any orders yet. Start exploring our collection!</p>
                    <Link href="/products" className="bg-black text-white px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-colors shadow-md">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <Link href={`/orders/${order.id}`} key={order.id} className="block bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row justify-between md:items-center">
                                    <div className="mb-4 md:mb-0">
                                        <p className="font-bold text-lg">Order #{order.id}</p>
                                        <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        {/* Show part of shipping address if present */}
                                        {order.shippingAddress && <p className="text-xs text-gray-400 mt-1 truncate max-w-xs">{order.shippingAddress}</p>}
                                    </div>
                                    <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                            order.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                            order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
                                            order.status === 'PACKED' ? 'bg-indigo-100 text-indigo-800' :
                                            order.status === 'UNPAID' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {order.status}
                                        </span>
                                        <span className="font-bold text-lg">{formatCurrency(order.totalAmount)}</span>

                                        {/* Cancel Button - only for UNPAID orders */}
                                        {order.status === 'UNPAID' && (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (confirm('Are you sure you want to cancel this order?')) {
                                                        handleCancel(order.id);
                                                    }
                                                }}
                                                className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="mt-8 flex justify-center space-x-4">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="flex items-center font-medium">Page {page} of {totalPages}</span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default OrdersPage;
