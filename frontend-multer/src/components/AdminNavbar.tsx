import React from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export const AdminNavbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <div className="flex-shrink-0">
                    {user?.role === 'ADMIN' ? (
                        <span className="text-2xl font-bold tracking-widest uppercase cursor-default">
                            TOKOKOCOMOTO
                        </span>
                    ) : (
                        <Link href="/seller/dashboard" className="text-2xl font-bold tracking-widest uppercase !no-underline">
                            TOKOKOCOMOTO
                        </Link>
                    )}
                </div>

                {/* Icons & Links */}
                <div className="flex items-center space-x-8">
                    <div className="flex items-center space-x-6">
                        <Link href="/seller/dashboard" className="text-sm font-bold uppercase tracking-widest hover:text-gray-600 transition-colors !no-underline">
                            Dashboard
                        </Link>
                        <Link href="/seller/products" className="text-sm font-bold uppercase tracking-widest hover:text-gray-600 transition-colors !no-underline">
                            My Products
                        </Link>
                        <button
                            onClick={logout}
                            className="text-sm font-bold uppercase tracking-widest hover:text-red-600 transition-colors !no-underline"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};
