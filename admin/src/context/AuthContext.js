import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const loadSession = useCallback(async () => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const { user } = await api.me();
            setUser(user);
        }
        catch {
            localStorage.removeItem('admin_token');
            setUser(null);
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        loadSession();
    }, [loadSession]);
    const login = async (email, password) => {
        const { token, user } = await api.login(email, password);
        localStorage.setItem('admin_token', token);
        setUser(user);
    };
    const logout = () => {
        localStorage.removeItem('admin_token');
        setUser(null);
    };
    const changePassword = async (currentPassword, newPassword) => {
        await api.changePassword(currentPassword, newPassword);
    };
    const updateProfile = async (name) => {
        const { user } = await api.updateProfile(name);
        setUser(user);
    };
    return (_jsx(AuthContext.Provider, { value: { user, loading, login, logout, changePassword, updateProfile }, children: children }));
}
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
