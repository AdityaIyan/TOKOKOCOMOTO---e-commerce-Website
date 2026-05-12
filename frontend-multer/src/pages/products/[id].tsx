import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '@/lib/axios';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const ProductDetailPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const { user } = useAuth();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await api.get(`/products/${id}`);
            setProduct(response.data);
        } catch (error) {
            console.error('Failed to fetch product', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!user) {
            router.push('/auth/login');
            return;
        }
        try {
            await api.post('/cart', { productId: product?.id, quantity: 1 });
            alert('Added to cart!');
        } catch (error: any) {
            console.error('Failed to add to cart', error);
            alert('Failed to add to cart');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await api.delete(`/products/${product?.id}`);
            alert('Product deleted');
            router.push('/seller/dashboard');
        } catch (error) {
            console.error('Failed to delete product', error);
            alert('Failed to delete product');
        }
    };

    if (loading) return <div className="text-center py-20">Loading...</div>;
    if (!product) return <div className="text-center py-20">Product not found</div>;

    const images = JSON.parse(product.images || '[]');
    let imageSrc = 'https://via.placeholder.com/400x500?text=No+Image';

    if (images.length > 0) {
        if (images[0].startsWith('/image/')) {
            const filename = images[0].replace('/image/', '');
            imageSrc = `http://localhost:4000/public/uploads/${encodeURIComponent(filename)}`;
        } else if (images[0].startsWith('/') || images[0].startsWith('http')) {
            imageSrc = images[0];
        } else {
            imageSrc = `http://localhost:4000/public/uploads/${encodeURIComponent(images[0])}`;
        }
    }

    const isSellerOrAdmin = user?.role === 'SELLER' || user?.role === 'ADMIN';

    return (
        <div className="container mx-auto py-12 px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Image Section */}
                <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
                    <img
                        src={imageSrc}
                        alt={product.name}
                        className="w-full h-full object-cover object-center"
                    />
                </div>

                {/* Details Section */}
                <div>
                    <h1 className="text-3xl font-bold uppercase tracking-wide mb-2">{product.name}</h1>
                    <p className="text-sm text-gray-500 mb-4">SKU: {product.sku || 'N/A'}</p>
                    <p className="text-2xl font-bold mb-6">{formatCurrency(product.price)}</p>

                    <div className="mb-6">
                        <h3 className="text-sm font-bold uppercase mb-2">Description</h3>
                        <p className="text-gray-600 leading-relaxed">{product.description || 'No description available.'}</p>
                    </div>

                    <div className="mb-6">
                        <p className="text-sm text-gray-500">Category: <span className="text-black font-medium uppercase">{product.category}</span></p>
                        <p className="text-sm text-gray-500">Stock: <span className="text-black font-medium">{product.stock}</span></p>
                    </div>

                    {/* Actions */}
                    <div className="mt-8">
                        {isSellerOrAdmin ? (
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => alert('Edit functionality to be implemented')}
                                    className="flex-1 bg-black text-white py-3 px-6 uppercase font-bold tracking-widest hover:bg-gray-800 transition-colors"
                                >
                                    Edit Product
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 border border-red-500 text-red-500 py-3 px-6 uppercase font-bold tracking-widest hover:bg-red-50 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleAddToCart}
                                className="w-full bg-black text-white py-4 px-8 uppercase font-bold tracking-widest hover:bg-gray-800 transition-colors"
                            >
                                Add to Cart
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
