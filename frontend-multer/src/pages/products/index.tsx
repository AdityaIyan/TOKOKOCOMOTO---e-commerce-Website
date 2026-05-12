import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { ProductList } from '@/features/products/components/ProductList';
import api from '@/lib/axios';
import { Product } from '@/types';

const ProductsPage = () => {
    const router = useRouter();
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const search = (router.query.search as string) || '';
    const category = (router.query.category as string) || '';
    const gender = (router.query.gender as string) || '';
    const sort = (router.query.sort as string) || 'newest';
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get('/products');
                setAllProducts(response.data);
            } catch (error) {
                console.error('Failed to fetch products', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Extract unique categories dynamically from products
    const categories = useMemo(() => {
        const cats = allProducts
            .map((p) => p.category)
            .filter((c): c is string => !!c);
        return Array.from(new Set(cats)).sort();
    }, [allProducts]);

    // Apply search, filter, and sort client-side
    const filteredProducts = useMemo(() => {
        let result = [...allProducts];

        // Search by name or description
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    (p.description && p.description.toLowerCase().includes(q))
            );
        }

        // Filter by category
        if (category) {
            result = result.filter((p) => p.category === category);
        }

        // Filter by gender
        if (gender) {
            result = result.filter((p) => p.gender === gender);
        }

        // Sort
        if (sort === 'price_asc') {
            result.sort((a, b) => a.price - b.price);
        } else if (sort === 'price_desc') {
            result.sort((a, b) => b.price - a.price);
        } else {
            // newest — default order from backend (by createdAt desc)
            result.sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        }

        return result;
    }, [allProducts, search, category, gender, sort]);

    return (
        <div className="container mx-auto py-8 px-4">

            {/* Active filters info */}
            {(search || category || gender) && (
                <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
                    <span>{filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found</span>
                    <button
                        onClick={() => router.push('/products')}
                        className="ml-auto text-xs text-red-500 hover:text-red-700 border border-red-200 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            )}

            {loading ? (
                <div className="text-center py-20 text-gray-400">Loading products...</div>
            ) : (
                <ProductList products={filteredProducts} />
            )}
        </div>
    );
};

export default ProductsPage;
