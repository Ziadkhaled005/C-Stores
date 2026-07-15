export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export interface ApiUser {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    avatarUrl?: string | null;
    branchId?: string | null;
    isActive?: boolean;
    roles?: string[];
}

export interface LoginResponse {
    token: string;
    refreshToken: string;
    expiresAt: string;
    user: ApiUser;
}

export interface ApiResponse<T> {
    succeeded: boolean;
    data: T;
    errors: string[];
    message: string;
}

function getStoredToken() {
    return typeof window !== "undefined"
        ? localStorage.getItem("cstore_access_token")
        : null;
}

function getAuthHeaders(extra?: HeadersInit): HeadersInit {
    const token = getStoredToken();
    const headers = new Headers(extra);
    headers.set("Accept", "application/json");
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
}

async function apiRequest<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: getAuthHeaders(options.headers),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
        const message =
            payload?.message || payload?.errors?.join(", ") || "Request failed";
        throw new Error(message);
    }

    if (payload && typeof payload === "object" && "data" in payload) {
        return (payload as ApiResponse<T>).data as T;
    }

    return payload as T;
}

export async function loginUser(email: string, password: string) {
    return apiRequest<LoginResponse>("/api/Auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export async function getMe() {
    return apiRequest<ApiUser>("/api/Auth/me");
}

export async function getProducts(params?: {
    branchId?: string;
    search?: string;
    category?: string;
    brand?: string;
}) {
    const query = new URLSearchParams();
    if (params?.branchId) query.set("branchId", params.branchId);
    if (params?.search) query.set("search", params.search);
    if (params?.category) query.set("category", params.category);
    if (params?.brand) query.set("brand", params.brand);
    return apiRequest<any[]>(
        "/api/Products" + (query.toString() ? `?${query.toString()}` : ""),
    );
}

export async function getBranches() {
    return apiRequest<any[]>("/api/Branches");
}

export async function getCustomers(search?: string) {
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    return apiRequest<any[]>(
        "/api/Customers" + (query.toString() ? `?${query.toString()}` : ""),
    );
}

export async function getSuppliers(search?: string) {
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    return apiRequest<any[]>(
        "/api/Suppliers" + (query.toString() ? `?${query.toString()}` : ""),
    );
}

export async function getSales(params?: {
    type?: string;
    status?: string;
    customerId?: string;
    branchId?: string;
    search?: string;
}) {
    const query = new URLSearchParams();
    if (params?.type) query.set("type", params.type);
    if (params?.status) query.set("status", params.status);
    if (params?.customerId) query.set("customerId", params.customerId);
    if (params?.branchId) query.set("branchId", params.branchId);
    if (params?.search) query.set("search", params.search);
    return apiRequest<any[]>(
        "/api/Sales" + (query.toString() ? `?${query.toString()}` : ""),
    );
}

export async function getDashboardStats(branchId?: string) {
    const query = new URLSearchParams();
    if (branchId) query.set("branchId", branchId);
    return apiRequest<any>(
        "/api/Dashboard/stats" +
            (query.toString() ? `?${query.toString()}` : ""),
    );
}

export async function getPurchases(params?: {
    type?: string;
    status?: string;
    supplierId?: string;
    branchId?: string;
    search?: string;
}) {
    const query = new URLSearchParams();
    if (params?.type) query.set("type", params.type);
    if (params?.status) query.set("status", params.status);
    if (params?.supplierId) query.set("supplierId", params.supplierId);
    if (params?.branchId) query.set("branchId", params.branchId);
    if (params?.search) query.set("search", params.search);
    return apiRequest<any[]>(
        "/api/Purchases" + (query.toString() ? `?${query.toString()}` : ""),
    );
}

export async function createPurchase(payload: any) {
    return apiRequest<any>("/api/Purchases", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export async function updatePurchaseStatus(id: string, status: string) {
    return apiRequest<any>(`/api/Purchases/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export async function createCustomer(payload: any) {
    return apiRequest<any>("/api/Customers", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export async function updateCustomer(id: string, payload: any) {
    return apiRequest<any>(`/api/Customers/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export async function deleteCustomer(id: string) {
    return apiRequest<any>(`/api/Customers/${id}`, { method: "DELETE" });
}

export async function createSupplier(payload: any) {
    return apiRequest<any>("/api/Suppliers", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export async function updateSupplier(id: string, payload: any) {
    return apiRequest<any>(`/api/Suppliers/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export async function deleteSupplier(id: string) {
    return apiRequest<any>(`/api/Suppliers/${id}`, { method: "DELETE" });
}

export async function getExpenses(params?: {
    branchId?: string;
    status?: string;
    archived?: boolean;
    search?: string;
}) {
    const query = new URLSearchParams();
    if (params?.branchId) query.set("branchId", params.branchId);
    if (params?.status) query.set("status", params.status);
    if (params?.archived !== undefined) query.set("archived", String(params.archived));
    if (params?.search) query.set("search", params.search);
    return apiRequest<any[]>(
        "/api/Expenses" + (query.toString() ? `?${query.toString()}` : ""),
    );
}

export async function getExpenseCategories() {
    return apiRequest<any[]>("/api/ExpenseCategories");
}

export async function createExpense(payload: any) {
    return apiRequest<any>("/api/Expenses", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export async function approveExpense(id: string, notes?: string) {
    return apiRequest<any>(`/api/Expenses/${id}/approve`, {
        method: "PUT",
        body: JSON.stringify({ notes }),
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export async function rejectExpense(id: string, reason: string) {
    return apiRequest<any>(`/api/Expenses/${id}/reject`, {
        method: "PUT",
        body: JSON.stringify({ reason }),
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export async function archiveExpense(id: string, reason: string) {
    return apiRequest<any>(`/api/Expenses/${id}/archive`, {
        method: "PUT",
        body: JSON.stringify({ reason }),
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export async function getArchivedExpenses() {
    return apiRequest<any[]>("/api/Expenses/archived");
}

export async function restoreExpense(id: string) {
    return apiRequest<any>(`/api/Expenses/${id}/restore`, { method: "PUT" });
}

export async function getCashflow(date?: string, branchId?: string) {
    const query = new URLSearchParams();
    if (date) query.set("date", date);
    if (branchId) query.set("branchId", branchId);
    return apiRequest<any>(
        "/api/Cashflow" + (query.toString() ? `?${query.toString()}` : ""),
    );
}

export async function getStockTransfers(params?: { status?: string; branchId?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.branchId) query.set("branchId", params.branchId);
    return apiRequest<any[]>(
        "/api/StockTransfers" + (query.toString() ? `?${query.toString()}` : ""),
    );
}

export async function createStockTransfer(payload: any) {
    return apiRequest<any>("/api/StockTransfers", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export async function approveStockTransfer(id: string) {
    return apiRequest<any>(`/api/StockTransfers/${id}/approve`, { method: "PUT" });
}

export async function completeStockTransfer(id: string) {
    return apiRequest<any>(`/api/StockTransfers/${id}/complete`, { method: "PUT" });
}

export async function getUsers(search?: string) {
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    return apiRequest<any[]>(
        "/api/Users" + (query.toString() ? `?${query.toString()}` : ""),
    );
}

export async function createUser(payload: any) {
    return apiRequest<any>("/api/Users", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export async function updateUser(id: string, payload: any) {
    return apiRequest<any>(`/api/Users/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export async function deleteUser(id: string) {
    return apiRequest<any>(`/api/Users/${id}`, { method: "DELETE" });
}

export async function getSettingsCompany() {
    return apiRequest<any>("/api/Settings/company");
}

export async function getSettingsTax() {
    return apiRequest<any>("/api/Settings/tax");
}

export async function getRoles() {
    return apiRequest<any[]>("/api/Roles");
}

export async function createRole(payload: any) {
    return apiRequest<any>("/api/Roles", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export async function updateRolePermissions(id: string, permissions: any) {
    return apiRequest<any>(`/api/Roles/${id}/permissions`, {
        method: "PUT",
        body: JSON.stringify(permissions),
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export async function toggleRoleActive(id: string, isActive: boolean) {
    return apiRequest<any>(`/api/Roles/${id}/toggle-active`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export async function getAuditLogs(params?: {
    userId?: string;
    module?: string;
    branchId?: string;
    dateFrom?: string;
    dateTo?: string;
}) {
    const query = new URLSearchParams();
    if (params?.userId) query.set("userId", params.userId);
    if (params?.module) query.set("module", params.module);
    if (params?.branchId) query.set("branchId", params.branchId);
    if (params?.dateFrom) query.set("dateFrom", params.dateFrom);
    if (params?.dateTo) query.set("dateTo", params.dateTo);
    return apiRequest<any[]>(
        "/api/AuditLog" + (query.toString() ? `?${query.toString()}` : ""),
    );
}

export async function createSale(payload: any) {
    return apiRequest<any>("/api/Sales", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export async function checkoutPOS(payload: any) {
    return apiRequest<any>("/api/POS/checkout", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
            "Content-Type": "application/json",
        },
    });
}
