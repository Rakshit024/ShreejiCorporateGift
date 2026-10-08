import type {
  Category,
  Product,
  Enquiry,
  Order,
  Customer,
  Coupon,
  Banner,
  Settings,
  DashboardStats,
  Paginated,
  AuthResponse,
  User,
} from '../types/api';

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  };

  const token = localStorage.getItem('admin_token');
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
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
      if (data?.error?.message) message = data.error.message;
    } catch {
      // ignore
    }
    const err = new Error(message) as Error & { status: number };
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  // Auth
  login(email: string, password: string) {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  me() {
    return request<{ user: User }>('/auth/me');
  },
  changePassword(currentPassword: string, newPassword: string) {
    return request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
  updateProfile(name: string) {
    return request<{ user: User }>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });
  },

  // Categories
  categories: {
    list(params?: { page?: number; limit?: number; search?: string; sort?: string; isActive?: boolean }) {
      const q = new URLSearchParams();
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));
      if (params?.search) q.set('search', params.search);
      if (params?.sort) q.set('sort', params.sort);
      if (params?.isActive !== undefined) q.set('isActive', String(params.isActive));
      return request<Paginated<Category>>(`/categories?${q.toString()}`);
    },
    options() {
      return request<{ items: Category[] }>('/categories/options');
    },
    get(id: string) {
      return request<{ category: Category }>(`/categories/${id}`);
    },
    create(data: Partial<Category>) {
      return request<{ category: Category }>('/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update(id: string, data: Partial<Category>) {
      return request<{ category: Category }>(`/categories/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    delete(id: string) {
      return request<{ message: string; deletedId: string }>(`/categories/${id}`, {
        method: 'DELETE',
      });
    },
    pruneEmpty() {
      return request<{ deleted: number }>('/categories/prune-empty', { method: 'POST' });
    },
    reorder(ids: string[]) {
      return request<{ message: string; count: number }>('/categories/reorder', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      });
    },
  },

  // Products
  products: {
    list(params?: {
      page?: number; limit?: number; search?: string; sort?: string;
      categoryId?: string; featured?: boolean; available?: boolean;
      customizable?: boolean; priceMin?: number; priceMax?: number;
      stock?: 'all' | 'out' | 'low';
    }) {
      const q = new URLSearchParams();
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));
      if (params?.search) q.set('search', params.search);
      if (params?.sort) q.set('sort', params.sort);
      if (params?.categoryId) q.set('categoryId', params.categoryId);
      if (params?.featured !== undefined) q.set('featured', String(params.featured));
      if (params?.available !== undefined) q.set('available', String(params.available));
      if (params?.customizable !== undefined) q.set('customizable', String(params.customizable));
      if (params?.priceMin !== undefined) q.set('priceMin', String(params.priceMin));
      if (params?.priceMax !== undefined) q.set('priceMax', String(params.priceMax));
      if (params?.stock) q.set('stock', params.stock);
      return request<Paginated<Product>>(`/products?${q.toString()}`);
    },
    get(id: string) {
      return request<{ product: Product }>(`/products/${id}`);
    },
    create(data: Partial<Product>) {
      return request<{ product: Product }>('/products', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update(id: string, data: Partial<Product>) {
      return request<{ product: Product }>(`/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    delete(id: string) {
      return request<{ message: string; deletedId: string }>(`/products/${id}`, {
        method: 'DELETE',
      });
    },
    duplicate(id: string) {
      return request<{ product: Product }>(`/products/${id}/duplicate`, {
        method: 'POST',
      });
    },
    toggleAvailability(id: string) {
      return request<{ product: { id: string; available: boolean } }>(
        `/products/${id}/availability`,
        { method: 'PATCH' },
      );
    },
    toggleFeatured(id: string) {
      return request<{ product: { id: string; featured: boolean } }>(
        `/products/${id}/featured`,
        { method: 'PATCH' },
      );
    },
    adjustStock(id: string, delta?: number, set?: number) {
      return request<{ product: { id: string; stock: number } }>(
        `/products/${id}/stock`,
        { method: 'PATCH', body: JSON.stringify({ delta, set }) },
      );
    },
    bulkAction(ids: string[], action: string, value?: string) {
      return request<{ message: string; affected: number }>('/products/bulk-action', {
        method: 'POST',
        body: JSON.stringify({ ids, action, value }),
      });
    },
    bulkAdjustPrices(ids: string[], percent: number) {
      return request<{ message: string; affected: number }>('/products/bulk-adjust-prices', {
        method: 'POST',
        body: JSON.stringify({ ids, percent }),
      });
    },
  },

  // Enquiries
  enquiries: {
    list(params?: { page?: number; limit?: number; search?: string; sort?: string; status?: string }) {
      const q = new URLSearchParams();
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));
      if (params?.search) q.set('search', params.search);
      if (params?.sort) q.set('sort', params.sort);
      if (params?.status) q.set('status', params.status);
      return request<Paginated<Enquiry>>(`/enquiries?${q.toString()}`);
    },
    summary() {
      return request<{ items: Array<{ status: string; count: number; quotedAmount: number }> }>(
        '/enquiries/summary',
      );
    },
    get(id: string) {
      return request<{ enquiry: Enquiry }>(`/enquiries/${id}`);
    },
    create(data: Partial<Enquiry>) {
      return request<{ enquiry: Enquiry }>('/enquiries', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update(id: string, data: Partial<Enquiry>) {
      return request<{ enquiry: Enquiry }>(`/enquiries/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    delete(id: string) {
      return request<{ message: string; deletedId: string }>(`/enquiries/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Orders
  orders: {
    list(params?: { page?: number; limit?: number; search?: string; sort?: string; status?: string; paymentStatus?: string }) {
      const q = new URLSearchParams();
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));
      if (params?.search) q.set('search', params.search);
      if (params?.sort) q.set('sort', params.sort);
      if (params?.status) q.set('status', params.status);
      if (params?.paymentStatus) q.set('paymentStatus', params.paymentStatus);
      return request<Paginated<Order>>(`/orders?${q.toString()}`);
    },
    summary() {
      return request<{
        byStatus: Array<{ status: string; count: number; total: number }>;
        monthly: Array<{ month: string; revenue: number; orders: number }>;
        activeCoupons: number;
      }>('/orders/summary');
    },
    get(id: string) {
      return request<{ order: Order }>(`/orders/${id}`);
    },
    create(data: Partial<Order>) {
      return request<{ order: Order }>('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update(id: string, data: Partial<Order>) {
      return request<{ order: Order }>(`/orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    delete(id: string) {
      return request<{ message: string; deletedId: string }>(`/orders/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Customers
  customers: {
    list(params?: { page?: number; limit?: number; search?: string; sort?: string; isBlocked?: boolean }) {
      const q = new URLSearchParams();
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));
      if (params?.search) q.set('search', params.search);
      if (params?.sort) q.set('sort', params.sort);
      if (params?.isBlocked !== undefined) q.set('isBlocked', String(params.isBlocked));
      return request<Paginated<Customer>>(`/customers?${q.toString()}`);
    },
    get(id: string) {
      return request<{ customer: Customer }>(`/customers/${id}`);
    },
    create(data: Partial<Customer>) {
      return request<{ customer: Customer }>('/customers', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update(id: string, data: Partial<Customer>) {
      return request<{ customer: Customer }>(`/customers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    toggleBlocked(id: string) {
      return request<{ customer: { id: string; isBlocked: boolean } }>(
        `/customers/${id}/block`,
        { method: 'PATCH' },
      );
    },
    delete(id: string) {
      return request<{ message: string; deletedId: string }>(`/customers/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Coupons
  coupons: {
    list(params?: { page?: number; limit?: number; search?: string; sort?: string }) {
      const q = new URLSearchParams();
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));
      if (params?.search) q.set('search', params.search);
      if (params?.sort) q.set('sort', params.sort);
      return request<Paginated<Coupon>>(`/coupons?${q.toString()}`);
    },
    get(id: string) {
      return request<{ coupon: Coupon }>(`/coupons/${id}`);
    },
    create(data: Partial<Coupon>) {
      return request<{ coupon: Coupon }>('/coupons', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update(id: string, data: Partial<Coupon>) {
      return request<{ coupon: Coupon }>(`/coupons/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    toggle(id: string) {
      return request<{ coupon: { id: string; isActive: boolean } }>(
        `/coupons/${id}/toggle`,
        { method: 'PATCH' },
      );
    },
    delete(id: string) {
      return request<{ message: string; deletedId: string }>(`/coupons/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Banners
  banners: {
    list(params?: { page?: number; limit?: number; search?: string; sort?: string; placement?: string; isActive?: boolean }) {
      const q = new URLSearchParams();
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));
      if (params?.search) q.set('search', params.search);
      if (params?.sort) q.set('sort', params.sort);
      if (params?.placement) q.set('placement', params.placement);
      if (params?.isActive !== undefined) q.set('isActive', String(params.isActive));
      return request<Paginated<Banner>>(`/banners?${q.toString()}`);
    },
    get(id: string) {
      return request<{ banner: Banner }>(`/banners/${id}`);
    },
    create(data: Partial<Banner>) {
      return request<{ banner: Banner }>('/banners', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update(id: string, data: Partial<Banner>) {
      return request<{ banner: Banner }>(`/banners/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    toggle(id: string) {
      return request<{ banner: { id: string; isActive: boolean } }>(
        `/banners/${id}/toggle`,
        { method: 'PATCH' },
      );
    },
    delete(id: string) {
      return request<{ message: string; deletedId: string }>(`/banners/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Settings
  settings: {
    get() {
      return request<{ settings: Settings }>('/settings');
    },
    update(data: Partial<Settings>) {
      return request<{ settings: Settings }>('/settings', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
  },

  // Uploads
  uploads: {
    uploadImages(files: File[]) {
      const form = new FormData();
      files.forEach((f) => form.append('images', f));
      return request<{
        files: Array<{ filename: string; url: string; size: number; mimeType: string }>;
      }>('/uploads/images', {
        method: 'POST',
        body: form,
        headers: {}, // Let browser set Content-Type with boundary
      });
    },
    uploadImage(file: File) {
      const form = new FormData();
      form.append('image', file);
      return request<{
        files: Array<{ filename: string; url: string; size: number; mimeType: string }>;
      }>('/uploads/image', {
        method: 'POST',
        body: form,
        headers: {},
      });
    },
    delete(url: string) {
      return request<{ message: string; url: string }>('/uploads/image', {
        method: 'DELETE',
        body: JSON.stringify({ url }),
      });
    },
  },

  // Dashboard
  admin: {
    dashboard() {
      return request<DashboardStats>('/admin/dashboard');
    },
    stockAlerts() {
      return request<{ items: Array<{ id: string; name: string; slug: string; image: string; stock: number; lowStockThreshold: number; category: string }> }>(
        '/admin/stock-alerts',
      );
    },
    health() {
      return request<{ status: string; database: string; counts: Record<string, number>; serverTime: string }>(
        '/admin/health',
      );
    },
  },
};

export type {
  Category,
  Product,
  Enquiry,
  Order,
  Customer,
  Coupon,
  Banner,
  Settings,
  DashboardStats,
  Paginated,
  User,
  AuthResponse,
};