import React, { useEffect, useState } from 'react';
import { OrderList } from '@/features/dashboard/components/OrderList';
import api from '@/lib/axios';
import { Order } from '@/types';

const DashboardOrdersPage = () => {
    const [orders, setOrders] = useState<Order[]>([]);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders');
            setOrders(response.data);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8">Manage Orders</h1>
            <OrderList orders={orders} />
        </div>
    );
};

export default DashboardOrdersPage;
