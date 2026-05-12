import React from 'react';
import { formatCurrency } from '@/lib/utils';
import api from '@/lib/axios';
import { CartItem as CartItemType } from '@/types';

interface CartItemProps {
    item: CartItemType;
    onUpdate: () => void;
}

export const CartItem: React.FC<CartItemProps> = ({ item, onUpdate }) => {
    const handleQuantityChange = async (newQuantity: number) => {
        if (newQuantity < 1) return;
        try {
            await api.patch(`/cart/${item.id}`, { quantity: newQuantity });
            onUpdate();
        } catch (error) {
            console.error('Failed to update quantity', error);
        }
    };

    const handleRemove = async () => {
        try {
            await api.delete(`/cart/${item.id}`);
            onUpdate();
        } catch (error) {
            console.error('Failed to remove item', error);
        }
    };

    const images = JSON.parse(item.product.images || '[]');
    let imageSrc = 'https://via.placeholder.com/150';

    if (images.length > 0) {
        if (images[0].startsWith('/') || images[0].startsWith('http')) {
            imageSrc = images[0];
        } else {
            imageSrc = `http://localhost:4000/public/uploads/${images[0]}`;
        }
    }

    return (
        <div className="flex items-center justify-between border-b py-4">
            <div className="flex items-center gap-4">
                <img src={imageSrc} alt={item.product.name} className="w-16 h-16 object-cover rounded" />
                <div>
                    <h4 className="font-semibold">{item.product.name}</h4>
                    <p className="text-gray-500">{formatCurrency(item.product.price)}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center border rounded">
                    <button
                        className="px-2 py-1 hover:bg-gray-100"
                        onClick={() => handleQuantityChange(item.quantity - 1)}
                    >
                        -
                    </button>
                    <span className="px-4">{item.quantity}</span>
                    <button
                        className="px-2 py-1 hover:bg-gray-100"
                        onClick={() => handleQuantityChange(item.quantity + 1)}
                    >
                        +
                    </button>
                </div>
                <button className="text-red-500 hover:text-red-700" onClick={handleRemove}>
                    Remove
                </button>
            </div>
        </div>
    );
};
