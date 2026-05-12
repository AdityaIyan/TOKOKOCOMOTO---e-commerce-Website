import React from 'react';
import Link from 'next/link';

const DashboardPage = () => {
    return (
        <div className="container mx-auto py-8 px-4 !no-underline">
            <h1 className="text-3xl font-bold mb-8 !no-underline">Seller Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/dashboard/products" className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow !no-underline">
                    <h2 className="text-xl font-bold mb-2">Manage Products</h2>
                    <p className="text-gray-600">Add, edit, or remove your products.</p>
                </Link>
                <Link href="/dashboard/orders" className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <h2 className="text-xl font-bold mb-2">View Orders</h2>
                    <p className="text-gray-600">Track and manage customer orders.</p>
                </Link>
            </div>
        </div>
    );
};

export default DashboardPage;
