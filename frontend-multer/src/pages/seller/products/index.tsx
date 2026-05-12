import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import api from '@/lib/axios';
import Link from 'next/link';
import { Product } from '@/types';

const SellerProductsPage = () => {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        if (!loading) {
            if (!user || (user.role !== 'SELLER' && user.role !== 'ADMIN')) {
                router.push('/');
            } else {
                fetchProducts();
            }
        }
    }, [user, loading, router]);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            // Filter client-side: ADMIN sees all, SELLER sees own
            const myProducts = user?.role === 'ADMIN' 
                ? response.data 
                : response.data.filter((p: Product) => p.sellerId === user?.username);
            setProducts(myProducts);
        } catch (error) {
            console.error('Failed to fetch products', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`/products/${id}`);
                fetchProducts();
            } catch (error) {
                console.error('Failed to delete product', error);
                alert('Failed to delete product');
            }
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">My Products</h1>
                <Link href="/seller/products/new" className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors !no-underline">
                    Add Product
                </Link>
            </div>

            <div className="bg-white shadow overflow-hidden rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0">
                                            {(() => {
                                                let imageSrc = 'https://via.placeholder.com/150?text=No+Image';
                                                try {
                                                    const images = JSON.parse(product.images || '[]');
                                                    if (images.length > 0) {
                                                        const img = images[0];
                                                        if (img.startsWith('/image/')) {
                                                            const filename = img.replace('/image/', '');
                                                            imageSrc = `http://localhost:4000/public/uploads/${filename}`;
                                                        } else if (img.startsWith('http')) {
                                                            imageSrc = img;
                                                        } else {
                                                            imageSrc = `http://localhost:4000/public/uploads/${img}`;
                                                        }
                                                    }
                                                } catch (e) {
                                                    console.error('Failed to parse images', e);
                                                }
                                                return (
                                                    <img
                                                        src={imageSrc}
                                                        alt={product.name}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                );
                                            })()}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{product.sku || '-'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">Rp {Number(product.price).toFixed(2)}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{product.stock}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link href={`/seller/products/${product.id}/edit`} className="text-indigo-600 hover:text-indigo-900 mr-4 !no-underline">
                                        Edit
                                    </Link>
                                    <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900 !no-underline">
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

export default SellerProductsPage;
