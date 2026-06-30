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
