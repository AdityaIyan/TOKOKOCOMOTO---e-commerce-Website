import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { Product } from '@/types';
import Link from 'next/link';

interface ProductCardProps {
    product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
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

    return (
        <Link href={`/products/${product.id}`} className="group cursor-pointer block !no-underline text-black">
            <div className="relative overflow-hidden bg-gray-100 aspect-[3/4] mb-3">
                <img
                    src={imageSrc}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
            </div>

            <div className="text-center px-2">
                <h3 className="text-[10px] font-medium uppercase tracking-wide mb-1 truncate text-black">{product.name}</h3>
                <p className="text-[10px] text-gray-500 mb-1">Stock: {product.stock}</p>
                <span className="text-xs font-bold block text-black">{formatCurrency(product.price)}</span>
            </div>
        </Link>
    );
};
