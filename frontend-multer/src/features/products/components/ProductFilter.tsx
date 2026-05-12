import React from 'react';

interface ProductFilterProps {
    onFilterChange: (filters: Record<string, any>) => void;
}

export const ProductFilter: React.FC<ProductFilterProps> = ({ onFilterChange }) => {
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFilterChange({ search: e.target.value });
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onFilterChange({ category: e.target.value });
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
            <div className="flex flex-col md:flex-row gap-4">
                <input
                    type="text"
                    placeholder="Search products..."
                    className="border p-2 rounded flex-grow"
                    onChange={handleSearchChange}
                />
                <select className="border p-2 rounded" onChange={handleCategoryChange}>
                    <option value="">All Categories</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Unisex">Unisex</option>
                </select>
                <select className="border p-2 rounded" onChange={(e) => onFilterChange({ sort: e.target.value })}>
                    <option value="newest">Newest</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                </select>
            </div>
        </div>
    );
};
