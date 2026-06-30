import { create } from "zustand";
import { User, Role } from "./data";
import { BRANCHES, Branch } from "./branchData";
import { getBranches, getMe, loginUser, type ApiUser } from "./api";

const mapApiUserToUser = (user: ApiUser): User => ({
    id: user.id,
    name: user.fullName || user.email,
    email: user.email,
    role: (user.roles?.[0] as Role) ?? "admin",
    phone: user.phone ?? "",
    avatar: user.avatarUrl ?? "",
    branchId: user.branchId ?? null,
});

const mapApiBranchToBranch = (branch: any): Branch => ({
    id: branch.id,
    name: branch.name,
    code: branch.name?.slice(0, 3).toUpperCase() ?? "BR",
    address: branch.address ?? "",
    phone: branch.phone ?? "",
    manager: branch.manager ?? "",
    isActive: branch.isActive ?? true,
    isMain: branch.isMain ?? false,
});

interface AuthStore {
    user: User | null;
    isAuthenticated: boolean;
    initializeAuth: () => Promise<void>;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    isAuthenticated: false,
    initializeAuth: async () => {
        const token = localStorage.getItem("cstore_access_token");
        if (!token) return;

        try {
            const apiUser = await getMe();
            set({ user: mapApiUserToUser(apiUser), isAuthenticated: true });
        } catch {
            localStorage.removeItem("cstore_access_token");
            localStorage.removeItem("cstore_refresh_token");
            set({ user: null, isAuthenticated: false });
        }
    },
    login: async (email, password) => {
        try {
            const response = await loginUser(email, password);
            localStorage.setItem("cstore_access_token", response.token);
            localStorage.setItem("cstore_refresh_token", response.refreshToken);
            set({
                user: mapApiUserToUser(response.user),
                isAuthenticated: true,
            });
            return true;
        } catch {
            return false;
        }
    },
    logout: () => {
        localStorage.removeItem("cstore_access_token");
        localStorage.removeItem("cstore_refresh_token");
        set({ user: null, isAuthenticated: false });
    },
}));

// Branch store
interface BranchStore {
    branches: Branch[];
    currentBranch: Branch;
    setCurrentBranch: (branch: Branch) => void;
    loadBranches: () => Promise<void>;
}

export const useBranchStore = create<BranchStore>((set, get) => ({
    branches: BRANCHES,
    currentBranch: BRANCHES[0],
    setCurrentBranch: (branch) => set({ currentBranch: branch }),
    loadBranches: async () => {
        try {
            const apiBranches = await getBranches();
            const mappedBranches = apiBranches.map(mapApiBranchToBranch);
            if (mappedBranches.length === 0) return;

            const current = get().currentBranch;
            const nextCurrent =
                mappedBranches.find((b) => b.id === current.id) ??
                mappedBranches.find((b) => b.isMain) ??
                mappedBranches[0];

            set({ branches: mappedBranches, currentBranch: nextCurrent });
        } catch {
            set({ branches: BRANCHES, currentBranch: BRANCHES[0] });
        }
    },
}));

// POS Cart
export interface CartItem {
    productId: string;
    productName: string;
    sku: string;
    unitPrice: number;
    quantity: number;
    discount: number;
    total: number;
}

interface POSStore {
    cart: CartItem[];
    customerId: string;
    customerName: string;
    notes: string;
    paymentMethod: "cash" | "visa" | "transfer" | "instapay";
    discountAmount: number;
    taxRate: number;
    addToCart: (item: Omit<CartItem, "total">) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    updateDiscount: (productId: string, discount: number) => void;
    clearCart: () => void;
    setCustomer: (id: string, name: string) => void;
    setNotes: (notes: string) => void;
    setPaymentMethod: (
        method: "cash" | "visa" | "transfer" | "instapay",
    ) => void;
    setDiscountAmount: (amount: number) => void;
    setTaxRate: (rate: number) => void;
}

export const usePOSStore = create<POSStore>((set) => ({
    cart: [],
    customerId: "",
    customerName: "",
    notes: "",
    paymentMethod: "cash",
    discountAmount: 0,
    taxRate: 14,
    addToCart: (item) =>
        set((state) => {
            const existing = state.cart.find(
                (c) => c.productId === item.productId,
            );
            if (existing) {
                return {
                    cart: state.cart.map((c) =>
                        c.productId === item.productId
                            ? {
                                  ...c,
                                  quantity: c.quantity + 1,
                                  total:
                                      (c.quantity + 1) *
                                      c.unitPrice *
                                      (1 - c.discount / 100),
                              }
                            : c,
                    ),
                };
            }
            return {
                cart: [
                    ...state.cart,
                    {
                        ...item,
                        total:
                            item.quantity *
                            item.unitPrice *
                            (1 - item.discount / 100),
                    },
                ],
            };
        }),
    removeFromCart: (productId) =>
        set((state) => ({
            cart: state.cart.filter((c) => c.productId !== productId),
        })),
    updateQuantity: (productId, quantity) =>
        set((state) => ({
            cart: state.cart
                .map((c) =>
                    c.productId === productId
                        ? {
                              ...c,
                              quantity,
                              total:
                                  quantity *
                                  c.unitPrice *
                                  (1 - c.discount / 100),
                          }
                        : c,
                )
                .filter((c) => c.quantity > 0),
        })),
    updateDiscount: (productId, discount) =>
        set((state) => ({
            cart: state.cart.map((c) =>
                c.productId === productId
                    ? {
                          ...c,
                          discount,
                          total:
                              c.quantity * c.unitPrice * (1 - discount / 100),
                      }
                    : c,
            ),
        })),
    clearCart: () =>
        set({
            cart: [],
            customerId: "",
            customerName: "",
            notes: "",
            discountAmount: 0,
        }),
    setCustomer: (id, name) => set({ customerId: id, customerName: name }),
    setNotes: (notes) => set({ notes }),
    setPaymentMethod: (method) => set({ paymentMethod: method }),
    setDiscountAmount: (amount) => set({ discountAmount: amount }),
    setTaxRate: (rate) => set({ taxRate: rate }),
}));
