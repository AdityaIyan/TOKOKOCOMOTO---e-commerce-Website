import React from 'react';
import Link from 'next/link';

export const Hero = () => {
    return (
        <div className="relative h-[70vh] w-full bg-gray-100 overflow-hidden">
            {/* Background Image Placeholder */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=2080&auto=format&fit=crop")',
                    filter: 'brightness(0.9)'
                }}
            />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4 bg-black/40">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 uppercase drop-shadow-lg">
                    See the World
                </h1>
                <p className="text-lg md:text-xl mb-8 max-w-lg font-light tracking-wide drop-shadow-md">
                    Premium eyewear for the modern visionary. Crafted for style, designed for clarity.
                </p>

            </div>
        </div>
    );
};
