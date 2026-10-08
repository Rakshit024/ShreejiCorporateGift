const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';
async function request(path, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
    };
    const token = localStorage.getItem('admin_token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
        credentials: 'include',
    });
    if (!res.ok) {
        let message = `${res.status} ${res.statusText}`;
        try {
            const data = await res.json();
            if (data?.error?.message)
                message = data.error.message;
        }
        catch {
            // ignore
        }
        const err = new Error(message);
        err.status = res.status;
        throw err;
    }
    if (res.status === 204)
        return undefined;
    return res.json();
}
export const api = {
    // Auth
    login(email, password) {
        return request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },
    me() {
        return request('/auth/me');
    },
    changePassword(currentPassword, newPassword) {
        return request('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify({ currentPassword, newPassword }),
        });
    },
    updateProfile(name) {
        return request('/auth/me', {
            method: 'PATCH',
            body: JSON.stringify({ name }),
        });
    },
    // Categories
    categories: {
        list(params) {
            const q = new URLSearchParams();
            if (params?.page)
                q.set('page', String(params.page));
            if (params?.limit)
                q.set('limit', String(params.limit));
            if (params?.search)
                q.set('search', params.search);
            if (params?.sort)
                q.set('sort', params.sort);
            if (params?.isActive !== undefined)
                q.set('isActive', String(params.isActive));
            return request(`/categories?${q.toString()}`);
        },
        options() {
            return request('/categories/options');
        },
        get(id) {
            return request(`/categories/${id}`);
        },
        create(data) {
            return request('/categories', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        },
        update(id, data) {
            return request(`/categories/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(data),
            });
        },
        delete(id) {
            return request(`/categories/${id}`, {
                method: 'DELETE',
            });
        },
        pruneEmpty() {
            return request('/categories/prune-empty', { method: 'POST' });
        },
        reorder(ids) {
            return request('/categories/reorder', {
                method: 'POST',
                body: JSON.stringify({ ids }),
            });
        },
    },
    // Products
    products: {
        list(params) {
            const q = new URLSearchParams();
            if (params?.page)
                q.set('page', String(params.page));
            if (params?.limit)
                q.set('limit', String(params.limit));
            if (params?.search)
                q.set('search', params.search);
            if (params?.sort)
                q.set('sort', params.sort);
            if (params?.categoryId)
                q.set('categoryId', params.categoryId);
            if (params?.featured !== undefined)
                q.set('featured', String(params.featured));
            if (params?.available !== undefined)
                q.set('available', String(params.available));
            if (params?.customizable !== undefined)
                q.set('customizable', String(params.customizable));
            if (params?.priceMin !== undefined)
                q.set('priceMin', String(params.priceMin));
            if (params?.priceMax !== undefined)
                q.set('priceMax', String(params.priceMax));
            if (params?.stock)
                q.set('stock', params.stock);
            return request(`/products?${q.toString()}`);
        },
        get(id) {
            return request(`/products/${id}`);
        },
        create(data) {
            return request('/products', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        },
        update(id, data) {
            return request(`/products/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(data),
            });
        },
        delete(id) {
            return request(`/products/${id}`, {
                method: 'DELETE',
            });
        },
        duplicate(id) {
            return request(`/products/${id}/duplicate`, {
                method: 'POST',
            });
        },
        toggleAvailability(id) {
            return request(`/products/${id}/availability`, { method: 'PATCH' });
        },
        toggleFeatured(id) {
            return request(`/products/${id}/featured`, { method: 'PATCH' });
        },
        adjustStock(id, delta, set) {
            return request(`/products/${id}/stock`, { method: 'PATCH', body: JSON.stringify({ delta, set }) });
        },
        bulkAction(ids, action, value) {
            return request('/products/bulk-action', {
                method: 'POST',
                body: JSON.stringify({ ids, action, value }),
            });
        },
        bulkAdjustPrices(ids, percent) {
            return request('/products/bulk-adjust-prices', {
                method: 'POST',
                body: JSON.stringify({ ids, percent }),
            });
        },
    },
    // Enquiries
    enquiries: {
        list(params) {
            const q = new URLSearchParams();
            if (params?.page)
                q.set('page', String(params.page));
            if (params?.limit)
                q.set('limit', String(params.limit));
            if (params?.search)
                q.set('search', params.search);
            if (params?.sort)
                q.set('sort', params.sort);
            if (params?.status)
                q.set('status', params.status);
            return request(`/enquiries?${q.toString()}`);
        },
        summary() {
            return request('/enquiries/summary');
        },
        get(id) {
            return request(`/enquiries/${id}`);
        },
        create(data) {
            return request('/enquiries', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        },
        update(id, data) {
            return request(`/enquiries/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(data),
            });
        },
        delete(id) {
            return request(`/enquiries/${id}`, {
                method: 'DELETE',
            });
        },
    },
    // Orders
    orders: {
        list(params) {
            const q = new URLSearchParams();
            if (params?.page)
                q.set('page', String(params.page));
            if (params?.limit)
                q.set('limit', String(params.limit));
            if (params?.search)
                q.set('search', params.search);
            if (params?.sort)
                q.set('sort', params.sort);
            if (params?.status)
                q.set('status', params.status);
            if (params?.paymentStatus)
                q.set('paymentStatus', params.paymentStatus);
            return request(`/orders?${q.toString()}`);
        },
        summary() {
            return request('/orders/summary');
        },
        get(id) {
            return request(`/orders/${id}`);
        },
        create(data) {
            return request('/orders', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        },
        update(id, data) {
            return request(`/orders/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(data),
            });
        },
        delete(id) {
            return request(`/orders/${id}`, {
                method: 'DELETE',
            });
        },
    },
    // Customers
    customers: {
        list(params) {
            const q = new URLSearchParams();
            if (params?.page)
                q.set('page', String(params.page));
            if (params?.limit)
                q.set('limit', String(params.limit));
            if (params?.search)
                q.set('search', params.search);
            if (params?.sort)
                q.set('sort', params.sort);
            if (params?.isBlocked !== undefined)
                q.set('isBlocked', String(params.isBlocked));
            return request(`/customers?${q.toString()}`);
        },
        get(id) {
            return request(`/customers/${id}`);
        },
        create(data) {
            return request('/customers', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        },
        update(id, data) {
            return request(`/customers/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(data),
            });
        },
        toggleBlocked(id) {
            return request(`/customers/${id}/block`, { method: 'PATCH' });
        },
        delete(id) {
            return request(`/customers/${id}`, {
                method: 'DELETE',
            });
        },
    },
    // Coupons
    coupons: {
        list(params) {
            const q = new URLSearchParams();
            if (params?.page)
                q.set('page', String(params.page));
            if (params?.limit)
                q.set('limit', String(params.limit));
            if (params?.search)
                q.set('search', params.search);
            if (params?.sort)
                q.set('sort', params.sort);
            return request(`/coupons?${q.toString()}`);
        },
        get(id) {
            return request(`/coupons/${id}`);
        },
        create(data) {
            return request('/coupons', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        },
        update(id, data) {
            return request(`/coupons/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(data),
            });
        },
        toggle(id) {
            return request(`/coupons/${id}/toggle`, { method: 'PATCH' });
        },
        delete(id) {
            return request(`/coupons/${id}`, {
                method: 'DELETE',
            });
        },
    },
    // Banners
    banners: {
        list(params) {
            const q = new URLSearchParams();
            if (params?.page)
                q.set('page', String(params.page));
            if (params?.limit)
                q.set('limit', String(params.limit));
            if (params?.search)
                q.set('search', params.search);
            if (params?.sort)
                q.set('sort', params.sort);
            if (params?.placement)
                q.set('placement', params.placement);
            if (params?.isActive !== undefined)
                q.set('isActive', String(params.isActive));
            return request(`/banners?${q.toString()}`);
        },
        get(id) {
            return request(`/banners/${id}`);
        },
        create(data) {
            return request('/banners', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        },
        update(id, data) {
            return request(`/banners/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(data),
            });
        },
        toggle(id) {
            return request(`/banners/${id}/toggle`, { method: 'PATCH' });
        },
        delete(id) {
            return request(`/banners/${id}`, {
                method: 'DELETE',
            });
        },
    },
    // Settings
    settings: {
        get() {
            return request('/settings');
        },
        update(data) {
            return request('/settings', {
                method: 'PUT',
                body: JSON.stringify(data),
            });
        },
    },
    // Uploads
    uploads: {
        uploadImages(files) {
            const form = new FormData();
            files.forEach((f) => form.append('images', f));
            return request('/uploads/images', {
                method: 'POST',
                body: form,
                headers: {}, // Let browser set Content-Type with boundary
            });
        },
        uploadImage(file) {
            const form = new FormData();
            form.append('image', file);
            return request('/uploads/image', {
                method: 'POST',
                body: form,
                headers: {},
            });
        },
        delete(url) {
            return request('/uploads/image', {
                method: 'DELETE',
                body: JSON.stringify({ url }),
            });
        },
    },
    // Dashboard
    admin: {
        dashboard() {
            return request('/admin/dashboard');
        },
        stockAlerts() {
            return request('/admin/stock-alerts');
        },
        health() {
            return request('/admin/health');
        },
    },
};
