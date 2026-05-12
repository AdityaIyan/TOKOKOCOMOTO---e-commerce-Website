import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import api from '@/lib/axios';
import Link from 'next/link';

const SellerDashboard = () => {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [dashboardLoading, setDashboardLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!loading) {
            // Allow both SELLER and ADMIN
            if (!user || (user.role !== 'SELLER' && user.role !== 'ADMIN')) {
                router.push('/');
            } else {
                fetchStats();
            }
        }
    }, [user, loading, router]);

    const fetchStats = async () => {
        setDashboardLoading(true);
        console.log("Fetching Client-side Stats...");
        try {
            // Fetch products and orders in parallel
            const [productsRes, ordersRes] = await Promise.all([
                api.get('/products'),
                api.get('/orders')
            ]);

            const products = productsRes.data;
            const ordersResponse = ordersRes.data;

            // Handle potentially paginated orders response
            const allOrders = Array.isArray(ordersResponse) ? ordersResponse : (ordersResponse.data || []);
            const allProducts = Array.isArray(products) ? products : (products.data || []);

            console.log("RAW PRODUCTS:", allProducts);
            console.log("RAW ORDERS:", allOrders);

            // --- CALCULATION LOGIC RESTORED ---
            let revenue = 0;
            let orderCount = 0;
            const trend: Record<string, number> = {};

            // Initialize last 7 days trend
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                trend[d.toISOString().split('T')[0]] = 0;
            }

            // Calculate Stats for SELLER or ADMIN
            const sellerOrders = user?.role === 'ADMIN' 
                ? allOrders 
                : allOrders.filter((order: any) =>
                    order.items.some((item: any) => item.product.sellerId === user?.username)
                );

            sellerOrders.forEach((order: any) => {
                const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
                let orderRevenue = 0;

                order.items.forEach((item: any) => {
                    if (user?.role === 'ADMIN' || item.product.sellerId === user?.username) {
                        const itemTotal = Number(item.price) * item.quantity;
                        revenue += itemTotal;
                        orderRevenue += itemTotal;
                    }
                });

                if (orderRevenue > 0) {
                    if (trend[orderDate] !== undefined) {
                        trend[orderDate] += orderRevenue;
                    }
                }
            });

            orderCount = sellerOrders.length;

            // Low Stock
            const myProducts = user?.role === 'ADMIN' ? allProducts : allProducts.filter((p: any) => p.sellerId === user?.username);
            const lowStock = myProducts
                .filter((p: any) => p.stock < 10)
                .sort((a: any, b: any) => a.stock - b.stock)
                .slice(0, 5);

            setStats({
                totalRevenue: revenue,
                orderCount: orderCount,
                lowStockProducts: lowStock,
                salesTrend: Object.entries(trend).map(([date, amount]) => ({ date, amount }))
            });

        } catch (error: any) {
            console.error('Failed to fetch stats', error);

            // Alert removed
            setError('Failed to load dashboard data. Please refresh.');
        } finally {
            setDashboardLoading(false);
        }
    };

    if (loading || (dashboardLoading && !stats)) {
        return (
            <div className="container mx-auto py-20 text-center">
                <h2 className="text-2xl font-bold text-gray-500">Loading Dashboard...</h2>
                <p className="text-gray-400 mt-2">Please wait while we fetch your data.</p>
            </div>
        );
    }

    if (error) {
        return <div className="text-center py-20 text-red-500 font-bold">{error}</div>;
    }

    if (!stats) return null;

    return (
        <div className="container mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Total Revenue</h3>
                    <p className="text-4xl font-bold mt-2">Rp {stats.totalRevenue.toLocaleString('id-ID')}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Total Orders</h3>
                    <p className="text-4xl font-bold mt-2">{stats.orderCount}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <h3 className="text-lg font-bold mb-4">Sales Trend (Last 7 Days)</h3>
                    <div className="h-64 flex items-end justify-between space-x-2">
                        {stats.salesTrend.map((day: any) => (
                            <div key={day.date} className="flex flex-col items-center flex-1">
                                <div
                                    className="w-full bg-black rounded-t hover:bg-gray-800 transition-colors"
                                    style={{ height: `${(day.amount / (Math.max(...stats.salesTrend.map((d: any) => d.amount)) || 1)) * 100}%`, minHeight: '4px' }}
                                ></div>
                                <span className="text-xs text-gray-500 mt-2 transform -rotate-45">{day.date.slice(5)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <h3 className="text-lg font-bold mb-4 text-red-600 flex items-center">
                        <span className="mr-2">⚠️</span> Low Stock Alerts
                    </h3>
                    <div className="space-y-4">
                        {stats.lowStockProducts.length === 0 ? (
                            <p className="text-gray-500">Inventory looks good.</p>
                        ) : (
                            stats.lowStockProducts.map((product: any) => (
                                <div key={product.id} className="flex justify-between items-center border-b pb-2 last:border-0 hover:bg-red-50 p-2 rounded transition-colors">
                                    <span className="font-medium text-gray-800">{product.name}</span>
                                    <span className="text-red-600 font-bold">{product.stock} left</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-4">
                <Link href="/seller/products/new" className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-transform hover:scale-105 shadow-lg !no-underline">
                    + Add New Product
                </Link>
                <Link href="/seller/products" className="bg-white text-black border-2 border-black px-8 py-3 rounded-full font-bold hover:bg-black hover:text-white transition-colors !no-underline">
                    Manage Inventory
                </Link>
                <Link href="/seller/orders" className="bg-white text-black border-2 border-black px-8 py-3 rounded-full font-bold hover:bg-black hover:text-white transition-colors !no-underline">
                    Manage Orders
                </Link>
            </div>
        </div>
    );
};

export default SellerDashboard;
