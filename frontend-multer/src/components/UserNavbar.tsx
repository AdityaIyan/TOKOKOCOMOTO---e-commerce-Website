import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { User as UserIcon, Camera, ShoppingBag, Heart, Search, Filter } from 'lucide-react';
import api from '@/lib/axios';

export const UserNavbar = () => {
    const { user, logout, updateUser } = useAuth();

    // Popover states
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Form states
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState((router.query.search as string) || '');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        setSearchQuery((router.query.search as string) || '');
    }, [router.query.search]);

    useEffect(() => {
        api.get('/products').then(res => {
            const cats = res.data.map((p: any) => p.category).filter((c: any) => !!c);
            setCategories(Array.from(new Set(cats)).sort() as string[]);
        }).catch(console.error);
    }, []);

    // Reset states when user changes or popover opens
    useEffect(() => {
        if (user) {
            setUsername(user.username || '');
            setEmail(user.email || '');
            if (user.avatar) {
                setAvatarPreview(`http://localhost:4000/public/uploads/${user.avatar}`);
            } else {
                setAvatarPreview(null);
            }
        }
    }, [user, isOpen]);

    // Close popover when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setIsEditing(false);
            }
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('email', email);
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            const response = await api.put('/auth/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            updateUser(response.data.user);
            setIsEditing(false);
        } catch (error: any) {
            console.error('Failed to update profile', error);
            alert(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Revert form state
        if (user) {
            setUsername(user.username || '');
            setEmail(user.email || '');
            setAvatarPreview(user.avatar ? `http://localhost:4000/public/uploads/${user.avatar}` : null);
            setAvatarFile(null);
        }
    };

    const avatarUrl = user?.avatar ? `http://localhost:4000/public/uploads/${user?.avatar}` : null;

    return (
        <nav className="bg-white sticky top-0 z-50 h-[60px] flex items-center px-4 md:px-10 justify-between font-sans border-none shadow-none">
            {/* Left: Logo */}
            <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-2xl font-black tracking-widest text-black uppercase !no-underline hover:opacity-70 transition-opacity">
                    TOKOKOCOMOTO
                </Link>
            </div>

            {/* Center: Links */}
            <div className="hidden lg:flex items-center space-x-6 absolute left-1/2 transform -translate-x-1/2">
                <Link href="/products?gender=Men" className="text-[15px] font-medium text-black hover:border-b-2 hover:border-black border-b-2 border-transparent transition-all pb-1 !no-underline">Men</Link>
                <Link href="/products?gender=Women" className="text-[15px] font-medium text-black hover:border-b-2 hover:border-black border-b-2 border-transparent transition-all pb-1 !no-underline">Women</Link>
                <Link href="/products?gender=Kids" className="text-[15px] font-medium text-black hover:border-b-2 hover:border-black border-b-2 border-transparent transition-all pb-1 !no-underline">Kids</Link>
                <Link href="/products?gender=Unisex" className="text-[15px] font-medium text-black hover:border-b-2 hover:border-black border-b-2 border-transparent transition-all pb-1 !no-underline">Unisex</Link>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-4 relative" ref={popoverRef}>
                {/* Search */}
                <div className="hidden md:flex relative group items-center mr-2">
                    <div className="absolute left-2 p-1 rounded-full hover:bg-gray-200 transition-colors cursor-pointer">
                        <Search className="w-4 h-4 text-black" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                router.push({ pathname: '/products', query: { ...router.query, search: searchQuery } });
                            }
                        }}
                        className="bg-[#f5f5f5] hover:bg-[#e5e5e5] rounded-full py-2 pl-8 pr-4 focus:outline-none transition-colors w-40 font-medium text-sm text-black placeholder-gray-500"
                    />
                </div>

                {/* Filter */}
                <div className="relative" ref={filterRef}>
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors flex items-center"
                    >
                        <Filter className="w-5 h-5 text-black" />
                    </button>
                    {isFilterOpen && (
                        <div className="absolute top-12 right-0 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 z-50 flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-gray-500">Category (Brand)</label>
                                <select
                                    className="w-full border p-2 rounded focus:outline-none focus:border-black transition-colors"
                                    value={(router.query.category as string) || ''}
                                    onChange={(e) => {
                                        router.push({ pathname: '/products', query: { ...router.query, category: e.target.value } });
                                    }}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-gray-500">Sort By</label>
                                <select
                                    className="w-full border p-2 rounded focus:outline-none focus:border-black transition-colors"
                                    value={(router.query.sort as string) || 'newest'}
                                    onChange={(e) => {
                                        router.push({ pathname: '/products', query: { ...router.query, sort: e.target.value } });
                                    }}
                                >
                                    <option value="newest">Newest</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Cart */}
                <Link href="/cart" className="p-2 hover:bg-gray-200 rounded-full transition-colors flex items-center">
                    <ShoppingBag className="w-6 h-6 text-black" />
                </Link>

                {/* User Profile */}
                {user ? (
                    <div className="flex items-center space-x-4 relative">
                        {/* Profile / Avatar Button */}
                        <button
                            onClick={() => { setIsOpen(!isOpen); setIsEditing(false); }}
                            className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-200 overflow-hidden hover:bg-gray-300 transition-all focus:outline-none ml-2"
                        >
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-center object-cover rounded-full" />
                            ) : (
                                <UserIcon className="w-5 h-5 text-black object-center rounded-full" />
                            )}
                        </button>

                        {/* POPOVER */}
                        {isOpen && (
                            <div className="absolute top-12 right-0 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl p-6 z-50">
                                <h3 className="text-lg font-bold tracking-widest uppercase mb-6 text-center">
                                    {isEditing ? 'Edit Profile' : 'My Profile'}
                                </h3>
                                {/* added Orders link inside popover to keep navbar clean */}
                                {!isEditing && (
                                    <div className="mb-4 flex justify-center">
                                        <Link href="/orders" onClick={() => setIsOpen(false)} className="text-sm font-bold uppercase tracking-widest hover:text-gray-600 transition-colors !no-underline">
                                            My Orders
                                        </Link>
                                    </div>
                                )}

                                <form onSubmit={handleSave} className="flex flex-col">
                                    {/* Avatar Section */}
                                    <div className="flex flex-col items-center justify-center mb-6">
                                        <div
                                            className={`w-24 h-24 rounded-full border-2 border-gray-100 overflow-hidden relative ${isEditing ? 'cursor-pointer group' : ''}`}
                                            onClick={() => isEditing && fileInputRef.current?.click()}
                                        >
                                            {avatarPreview ? (
                                                <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                                    <UserIcon className="w-8 h-8" />
                                                </div>
                                            )}

                                            {isEditing && (
                                                <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Camera className="w-6 h-6 text-white mb-1" />
                                                    <span className="text-white text-[10px] font-bold uppercase tracking-wider">Change</span>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                        />
                                    </div>

                                    {/* User Details */}
                                    <div className="space-y-4 mb-8">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1 text-gray-500">Username</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    className="w-full p-2 border-b border-gray-300 focus:outline-none focus:border-black transition-colors text-sm"
                                                    required
                                                />
                                            ) : (
                                                <p className="text-sm font-semibold">{user.username}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1 text-gray-500">Email Address</label>
                                            {isEditing ? (
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full p-2 border-b border-gray-300 focus:outline-none focus:border-black transition-colors text-sm"
                                                    required
                                                />
                                            ) : (
                                                <p className="text-sm">{user.email || '-'}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions (Bottom Right) */}
                                    <div className="flex justify-end space-x-3 mt-auto">
                                        {isEditing ? (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={handleCancel}
                                                    className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
                                                >
                                                    {loading ? 'Saving...' : 'Save'}
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEditing(true)}
                                                    className="px-4 py-2 bg-gray-100 text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => { setIsOpen(false); logout(); }}
                                                    className="px-4 py-2 bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest hover:bg-red-100 transition-colors"
                                                >
                                                    Logout
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link href="/auth/login" className="text-sm font-bold tracking-widest hover:text-gray-600 transition-colors !no-underline ml-2">
                        Sign In
                    </Link>
                )}
            </div>
        </nav>
    );
};
