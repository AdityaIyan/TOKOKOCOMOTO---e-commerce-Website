import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AdminNavbar } from './AdminNavbar';
import { UserNavbar } from './UserNavbar';

export const Navbar = () => {
    const { user } = useAuth();

    if (user && (user.role === 'ADMIN' || user.role === 'SELLER')) {
        return <AdminNavbar />;
    }

    return <UserNavbar />;
};
