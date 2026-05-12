import React from 'react';
import { ProductCard } from './ProductCard';
import { Product } from '@/types';
import { Search } from 'lucide-react';

interface ProductListProps {
    products: Product[];
}

export const ProductList: React.FC<ProductListProps> = ({ products }) => {
    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold uppercase tracking-widest mb-2">No products found</h2>
                <p className="text-gray-500 max-w-md">Try adjusting your filters or check back later for new arrivals.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
};
