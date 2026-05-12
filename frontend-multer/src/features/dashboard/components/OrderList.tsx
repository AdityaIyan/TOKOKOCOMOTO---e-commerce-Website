import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { Order } from '@/types';

interface OrderListProps {
    orders: Order[];
}

export const OrderList: React.FC<OrderListProps> = ({ orders }) => {
    if (orders.length === 0) {
        return <div className="text-gray-500">No orders found.</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-4 text-left">Order ID</th>
                        <th className="p-4 text-left">Date</th>
                        <th className="p-4 text-left">Total</th>
                        <th className="p-4 text-left">Status</th>
                        <th className="p-4 text-left">Items</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">#{order.id}</td>
                            <td className="p-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td className="p-4 font-bold">{formatCurrency(order.total)}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-sm ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                    }`}>
                                    {order.status}
                                </span>
                            </td>
                            <td className="p-4">
                                {order.items.map((item) => (
                                    <div key={item.id} className="text-sm">
                                        {item.product.name} x {item.quantity}
                                    </div>
                                ))}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
