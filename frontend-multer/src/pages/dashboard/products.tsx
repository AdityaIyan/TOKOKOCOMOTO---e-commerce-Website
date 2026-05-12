import React, { useEffect, useState } from 'react';
import { ProductForm } from '@/features/dashboard/components/ProductForm';
import api from '@/lib/axios';
import { formatCurrency } from '@/lib/utils';
import { Product } from '@/types';

const DashboardProductsPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [showForm, setShowForm] = useState(false);

    const fetchProducts = async () => {
        try {
            // In a real app, this should filter by seller
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Failed to fetch products', error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure?')) return;
        try {
            await api.delete(`/products/${id}`);
            fetchProducts();
        } catch (error) {
            console.error('Failed to delete product', error);
        }
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold !no-underline">Manage Products</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    {showForm ? 'Cancel' : 'Add New Product'}
                </button>
            </div>

            {showForm && (
                <div className="mb-8">
                    <ProductForm onSuccess={() => { setShowForm(false); fetchProducts(); }} />
                </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-4 text-left">Name</th>
                            <th className="p-4 text-left">Price</th>
                            <th className="p-4 text-left">Stock</th>
                            <th className="p-4 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id} className="border-b">
                                <td className="p-4">{product.name}</td>
                                <td className="p-4">{formatCurrency(product.price)}</td>
                                <td className="p-4">{product.stock}</td>
                                <td className="p-4">
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DashboardProductsPage;
