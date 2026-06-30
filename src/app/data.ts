export type Role = "admin" | "manager" | "cashier" | "sales" | "inventory";

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    password?: string;
    phone?: string;
    avatar?: string;
    branchId?: string | null;
}

export interface Product {
    id: string;
    name: string;
    sku: string;
    barcode: string;
    brand: string;
    category: string;
    costPrice: number;
    sellingPrice: number;
    quantity: number;
    reorderLevel: number;
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    notes: string;
    balance: number;
    totalPurchases: number;
    joinDate: string;
}

export interface Supplier {
    id: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    notes: string;
    totalOrders: number;
}

export interface SaleItem {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    total: number;
}

export interface Sale {
    id: string;
    type: "invoice" | "order" | "quotation";
    customerId: string;
    customerName: string;
    date: string;
    items: SaleItem[];
    subtotal: number;
    discountAmount: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    paymentMethod: "cash" | "visa" | "transfer" | "instapay";
    status: "paid" | "pending" | "draft" | "cancelled";
    notes: string;
}

export interface PurchaseItem {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitCost: number;
    total: number;
}

export interface Purchase {
    id: string;
    type: "order" | "invoice";
    supplierId: string;
    supplierName: string;
    date: string;
    items: PurchaseItem[];
    subtotal: number;
    taxAmount: number;
    total: number;
    status: "received" | "pending" | "partial" | "cancelled";
    notes: string;
}

export const USERS: User[] = [
    {
        id: "1",
        name: "أحمد الإداري",
        email: "admin@ctech.com",
        role: "admin",
        password: "123456",
        phone: "01012345678",
    },
    {
        id: "2",
        name: "سارة المديرة",
        email: "manager@ctech.com",
        role: "manager",
        password: "123456",
        phone: "01023456789",
    },
    {
        id: "3",
        name: "محمد الكاشير",
        email: "cashier@ctech.com",
        role: "cashier",
        password: "123456",
        phone: "01098765432",
    },
    {
        id: "4",
        name: "فاطمة المبيعات",
        email: "sales@ctech.com",
        role: "sales",
        password: "123456",
        phone: "01156789012",
    },
    {
        id: "5",
        name: "عمر المخزن",
        email: "inventory@ctech.com",
        role: "inventory",
        password: "123456",
        phone: "01234567890",
    },
];

export const ROLE_LABELS: Record<Role, string> = {
    admin: "مدير النظام",
    manager: "مدير",
    cashier: "كاشير",
    sales: "مندوب مبيعات",
    inventory: "موظف مخزن",
};

export const CATEGORIES = [
    "لابتوبات",
    "كمبيوتر مكتبي",
    "شاشات",
    "طابعات",
    "ملحقات",
    "شبكات",
    "تخزين",
    "كاميرات",
];
export const BRANDS = [
    "Dell",
    "HP",
    "Lenovo",
    "ASUS",
    "Acer",
    "Canon",
    "Epson",
    "TP-Link",
    "Logitech",
    "Samsung",
    "LG",
];

export const PRODUCTS: Product[] = [
    {
        id: "p1",
        name: "لابتوب Dell Inspiron 15",
        sku: "DL-INS-15",
        barcode: "6900000001234",
        brand: "Dell",
        category: "لابتوبات",
        costPrice: 14500,
        sellingPrice: 18999,
        quantity: 8,
        reorderLevel: 3,
    },
    {
        id: "p2",
        name: "لابتوب HP Pavilion 14",
        sku: "HP-PAV-14",
        barcode: "6900000002345",
        brand: "HP",
        category: "لابتوبات",
        costPrice: 12000,
        sellingPrice: 15999,
        quantity: 5,
        reorderLevel: 3,
    },
    {
        id: "p3",
        name: "لابتوب Lenovo IdeaPad 3",
        sku: "LN-IDE-3",
        barcode: "6900000003456",
        brand: "Lenovo",
        category: "لابتوبات",
        costPrice: 10500,
        sellingPrice: 13999,
        quantity: 10,
        reorderLevel: 3,
    },
    {
        id: "p4",
        name: "لابتوب ASUS VivoBook 15",
        sku: "AS-VIV-15",
        barcode: "6900000004567",
        brand: "ASUS",
        category: "لابتوبات",
        costPrice: 11000,
        sellingPrice: 14500,
        quantity: 2,
        reorderLevel: 3,
    },
    {
        id: "p5",
        name: "كمبيوتر مكتبي HP Elite",
        sku: "HP-ELT-DSK",
        barcode: "6900000005678",
        brand: "HP",
        category: "كمبيوتر مكتبي",
        costPrice: 16000,
        sellingPrice: 21000,
        quantity: 4,
        reorderLevel: 2,
    },
    {
        id: "p6",
        name: "شاشة Dell 24 بوصة",
        sku: "DL-MON-24",
        barcode: "6900000006789",
        brand: "Dell",
        category: "شاشات",
        costPrice: 4500,
        sellingPrice: 5999,
        quantity: 15,
        reorderLevel: 5,
    },
    {
        id: "p7",
        name: "شاشة LG 27 بوصة 4K",
        sku: "LG-MON-27K",
        barcode: "6900000007890",
        brand: "LG",
        category: "شاشات",
        costPrice: 7000,
        sellingPrice: 9500,
        quantity: 6,
        reorderLevel: 3,
    },
    {
        id: "p8",
        name: "طابعة HP LaserJet Pro",
        sku: "HP-LAS-PRO",
        barcode: "6900000008901",
        brand: "HP",
        category: "طابعات",
        costPrice: 3500,
        sellingPrice: 4799,
        quantity: 7,
        reorderLevel: 3,
    },
    {
        id: "p9",
        name: "طابعة Canon PIXMA",
        sku: "CN-PIX-G3",
        barcode: "6900000009012",
        brand: "Canon",
        category: "طابعات",
        costPrice: 2800,
        sellingPrice: 3799,
        quantity: 9,
        reorderLevel: 3,
    },
    {
        id: "p10",
        name: "كيبورد لاسلكي Logitech K380",
        sku: "LG-KB-K380",
        barcode: "6900000010123",
        brand: "Logitech",
        category: "ملحقات",
        costPrice: 350,
        sellingPrice: 599,
        quantity: 25,
        reorderLevel: 10,
    },
    {
        id: "p11",
        name: "ماوس لاسلكي Logitech M185",
        sku: "LG-MS-M185",
        barcode: "6900000011234",
        brand: "Logitech",
        category: "ملحقات",
        costPrice: 250,
        sellingPrice: 399,
        quantity: 30,
        reorderLevel: 10,
    },
    {
        id: "p12",
        name: "هيدفون سماعات HP",
        sku: "HP-HP-H100",
        barcode: "6900000012345",
        brand: "HP",
        category: "ملحقات",
        costPrice: 180,
        sellingPrice: 299,
        quantity: 20,
        reorderLevel: 8,
    },
    {
        id: "p13",
        name: "راوتر TP-Link Archer C6",
        sku: "TP-RT-AC6",
        barcode: "6900000013456",
        brand: "TP-Link",
        category: "شبكات",
        costPrice: 1200,
        sellingPrice: 1799,
        quantity: 12,
        reorderLevel: 5,
    },
    {
        id: "p14",
        name: "سويتش TP-Link 8 بورت",
        sku: "TP-SW-8P",
        barcode: "6900000014567",
        brand: "TP-Link",
        category: "شبكات",
        costPrice: 600,
        sellingPrice: 899,
        quantity: 1,
        reorderLevel: 5,
    },
    {
        id: "p15",
        name: "هارد ديسك خارجي 1TB Seagate",
        sku: "SG-HDD-1T",
        barcode: "6900000015678",
        brand: "Samsung",
        category: "تخزين",
        costPrice: 1500,
        sellingPrice: 1999,
        quantity: 18,
        reorderLevel: 5,
    },
    {
        id: "p16",
        name: "فلاش USB Samsung 64GB",
        sku: "SM-USB-64",
        barcode: "6900000016789",
        brand: "Samsung",
        category: "تخزين",
        costPrice: 150,
        sellingPrice: 249,
        quantity: 45,
        reorderLevel: 15,
    },
    {
        id: "p17",
        name: "SSD Samsung 500GB",
        sku: "SM-SSD-500",
        barcode: "6900000017890",
        brand: "Samsung",
        category: "تخزين",
        costPrice: 2200,
        sellingPrice: 2999,
        quantity: 10,
        reorderLevel: 5,
    },
    {
        id: "p18",
        name: "كابل HDMI 2م",
        sku: "HDMI-2M",
        barcode: "6900000018901",
        brand: "ASUS",
        category: "ملحقات",
        costPrice: 80,
        sellingPrice: 149,
        quantity: 3,
        reorderLevel: 15,
    },
    {
        id: "p19",
        name: "حقيبة لابتوب HP 15.6",
        sku: "HP-BAG-15",
        barcode: "6900000019012",
        brand: "HP",
        category: "ملحقات",
        costPrice: 200,
        sellingPrice: 349,
        quantity: 22,
        reorderLevel: 8,
    },
    {
        id: "p20",
        name: "لابتوب Dell XPS 13",
        sku: "DL-XPS-13",
        barcode: "6900000020123",
        brand: "Dell",
        category: "لابتوبات",
        costPrice: 28000,
        sellingPrice: 34999,
        quantity: 3,
        reorderLevel: 2,
    },
];

export const CUSTOMERS: Customer[] = [
    {
        id: "c1",
        name: "أحمد محمد علي",
        phone: "01012345678",
        email: "ahmed@email.com",
        address: "١٢ شارع التحرير، القاهرة",
        notes: "عميل مميز",
        balance: 0,
        totalPurchases: 45999,
        joinDate: "2024-03-15",
    },
    {
        id: "c2",
        name: "سارة أحمد خليل",
        phone: "01023456789",
        email: "sara@email.com",
        address: "٥ شارع الجمهورية، الجيزة",
        notes: "",
        balance: 2500,
        totalPurchases: 28500,
        joinDate: "2024-05-20",
    },
    {
        id: "c3",
        name: "محمد عبد الرحمن",
        phone: "01098765432",
        email: "mohamed@email.com",
        address: "٨ شارع النصر، المنصورة",
        notes: "يفضل التواصل عبر واتساب",
        balance: 0,
        totalPurchases: 67000,
        joinDate: "2023-11-10",
    },
    {
        id: "c4",
        name: "فاطمة حسن إبراهيم",
        phone: "01156789012",
        email: "fatma@email.com",
        address: "٣ شارع السلام، الإسكندرية",
        notes: "",
        balance: 0,
        totalPurchases: 15999,
        joinDate: "2025-01-05",
    },
    {
        id: "c5",
        name: "عمر خالد منصور",
        phone: "01234567890",
        email: "omar@email.com",
        address: "١٥ شارع قصر النيل، القاهرة",
        notes: "مدير شركة",
        balance: 0,
        totalPurchases: 120000,
        joinDate: "2023-06-22",
    },
    {
        id: "c6",
        name: "نور الدين شريف",
        phone: "01187654321",
        email: "nour@email.com",
        address: "٢٢ شارع أحمد عرابي، المهندسين",
        notes: "",
        balance: 1000,
        totalPurchases: 32000,
        joinDate: "2024-08-15",
    },
    {
        id: "c7",
        name: "ريم مصطفى كمال",
        phone: "01065432187",
        email: "reem@email.com",
        address: "٧ شارع الحرية، طنطا",
        notes: "",
        balance: 0,
        totalPurchases: 8999,
        joinDate: "2025-02-20",
    },
    {
        id: "c8",
        name: "كريم عادل سليم",
        phone: "01143218765",
        email: "karim@email.com",
        address: "١ شارع النيل، أسوان",
        notes: "مقاول",
        balance: 5000,
        totalPurchases: 89000,
        joinDate: "2023-09-01",
    },
];

export const SUPPLIERS: Supplier[] = [
    {
        id: "s1",
        name: "شركة نور لتوزيع التكنولوجيا",
        phone: "0222345678",
        email: "nour@nourtech.com",
        address: "٤٥ شارع الصناعة، القاهرة",
        notes: "مورد رئيسي Dell و HP",
        totalOrders: 45,
    },
    {
        id: "s2",
        name: "مستودعات الأمير للحاسبات",
        phone: "0233456789",
        email: "info@amir-tech.com",
        address: "١٢ شارع التجارة، الجيزة",
        notes: "مورد Lenovo و ASUS",
        totalOrders: 32,
    },
    {
        id: "s3",
        name: "شركة الخليج للإلكترونيات",
        phone: "0244567890",
        email: "sales@gulf-tech.com",
        address: "٨ المنطقة الصناعية، 6 أكتوبر",
        notes: "ملحقات وأجهزة شبكات",
        totalOrders: 28,
    },
    {
        id: "s4",
        name: "الشركة العربية للطباعة",
        phone: "0255678901",
        email: "info@arabprint.com",
        address: "٣ شارع التحرير، الإسكندرية",
        notes: "طابعات Canon و HP",
        totalOrders: 15,
    },
];

export const SALES: Sale[] = [
    {
        id: "INV-2026-018",
        type: "invoice",
        customerId: "c5",
        customerName: "عمر خالد منصور",
        date: "2026-06-18",
        items: [
            {
                productId: "p1",
                productName: "لابتوب Dell Inspiron 15",
                sku: "DL-INS-15",
                quantity: 2,
                unitPrice: 18999,
                discount: 0,
                total: 37998,
            },
            {
                productId: "p6",
                productName: "شاشة Dell 24 بوصة",
                sku: "DL-MON-24",
                quantity: 2,
                unitPrice: 5999,
                discount: 0,
                total: 11998,
            },
        ],
        subtotal: 49996,
        discountAmount: 0,
        taxRate: 14,
        taxAmount: 6999.44,
        total: 56995.44,
        paymentMethod: "visa",
        status: "paid",
        notes: "",
    },
    {
        id: "INV-2026-017",
        type: "invoice",
        customerId: "c1",
        customerName: "أحمد محمد علي",
        date: "2026-06-18",
        items: [
            {
                productId: "p3",
                productName: "لابتوب Lenovo IdeaPad 3",
                sku: "LN-IDE-3",
                quantity: 1,
                unitPrice: 13999,
                discount: 500,
                total: 13499,
            },
        ],
        subtotal: 13499,
        discountAmount: 0,
        taxRate: 14,
        taxAmount: 1889.86,
        total: 15388.86,
        paymentMethod: "cash",
        status: "paid",
        notes: "العميل طلب تركيب برامج مجانية",
    },
    {
        id: "INV-2026-016",
        type: "invoice",
        customerId: "c3",
        customerName: "محمد عبد الرحمن",
        date: "2026-06-17",
        items: [
            {
                productId: "p20",
                productName: "لابتوب Dell XPS 13",
                sku: "DL-XPS-13",
                quantity: 1,
                unitPrice: 34999,
                discount: 1000,
                total: 33999,
            },
            {
                productId: "p10",
                productName: "كيبورد لاسلكي Logitech K380",
                sku: "LG-KB-K380",
                quantity: 1,
                unitPrice: 599,
                discount: 0,
                total: 599,
            },
        ],
        subtotal: 34598,
        discountAmount: 0,
        taxRate: 14,
        taxAmount: 4843.72,
        total: 39441.72,
        paymentMethod: "instapay",
        status: "paid",
        notes: "",
    },
    {
        id: "INV-2026-015",
        type: "invoice",
        customerId: "c2",
        customerName: "سارة أحمد خليل",
        date: "2026-06-17",
        items: [
            {
                productId: "p8",
                productName: "طابعة HP LaserJet Pro",
                sku: "HP-LAS-PRO",
                quantity: 1,
                unitPrice: 4799,
                discount: 0,
                total: 4799,
            },
            {
                productId: "p16",
                productName: "فلاش USB Samsung 64GB",
                sku: "SM-USB-64",
                quantity: 2,
                unitPrice: 249,
                discount: 0,
                total: 498,
            },
        ],
        subtotal: 5297,
        discountAmount: 0,
        taxRate: 14,
        taxAmount: 741.58,
        total: 6038.58,
        paymentMethod: "cash",
        status: "paid",
        notes: "",
    },
    {
        id: "ORD-2026-004",
        type: "order",
        customerId: "c8",
        customerName: "كريم عادل سليم",
        date: "2026-06-16",
        items: [
            {
                productId: "p5",
                productName: "كمبيوتر مكتبي HP Elite",
                sku: "HP-ELT-DSK",
                quantity: 5,
                unitPrice: 21000,
                discount: 2000,
                total: 103000,
            },
            {
                productId: "p6",
                productName: "شاشة Dell 24 بوصة",
                sku: "DL-MON-24",
                quantity: 5,
                unitPrice: 5999,
                discount: 0,
                total: 29995,
            },
        ],
        subtotal: 132995,
        discountAmount: 0,
        taxRate: 14,
        taxAmount: 18619.3,
        total: 151614.3,
        paymentMethod: "transfer",
        status: "pending",
        notes: "طلب مشروع تجهيز مكتب",
    },
    {
        id: "QT-2026-003",
        type: "quotation",
        customerId: "c6",
        customerName: "نور الدين شريف",
        date: "2026-06-15",
        items: [
            {
                productId: "p2",
                productName: "لابتوب HP Pavilion 14",
                sku: "HP-PAV-14",
                quantity: 3,
                unitPrice: 15999,
                discount: 0,
                total: 47997,
            },
        ],
        subtotal: 47997,
        discountAmount: 0,
        taxRate: 14,
        taxAmount: 6719.58,
        total: 54716.58,
        paymentMethod: "cash",
        status: "draft",
        notes: "عرض سعر - انتظار موافقة العميل",
    },
    {
        id: "INV-2026-014",
        type: "invoice",
        customerId: "c4",
        customerName: "فاطمة حسن إبراهيم",
        date: "2026-06-14",
        items: [
            {
                productId: "p9",
                productName: "طابعة Canon PIXMA",
                sku: "CN-PIX-G3",
                quantity: 1,
                unitPrice: 3799,
                discount: 200,
                total: 3599,
            },
        ],
        subtotal: 3599,
        discountAmount: 0,
        taxRate: 14,
        taxAmount: 503.86,
        total: 4102.86,
        paymentMethod: "cash",
        status: "paid",
        notes: "",
    },
    {
        id: "INV-2026-013",
        type: "invoice",
        customerId: "c7",
        customerName: "ريم مصطفى كمال",
        date: "2026-06-13",
        items: [
            {
                productId: "p4",
                productName: "لابتوب ASUS VivoBook 15",
                sku: "AS-VIV-15",
                quantity: 1,
                unitPrice: 14500,
                discount: 0,
                total: 14500,
            },
        ],
        subtotal: 14500,
        discountAmount: 0,
        taxRate: 14,
        taxAmount: 2030,
        total: 16530,
        paymentMethod: "visa",
        status: "paid",
        notes: "",
    },
];

export const PURCHASES: Purchase[] = [
    {
        id: "PO-2026-012",
        type: "order",
        supplierId: "s1",
        supplierName: "شركة نور لتوزيع التكنولوجيا",
        date: "2026-06-15",
        items: [
            {
                productId: "p1",
                productName: "لابتوب Dell Inspiron 15",
                sku: "DL-INS-15",
                quantity: 10,
                unitCost: 14500,
                total: 145000,
            },
            {
                productId: "p6",
                productName: "شاشة Dell 24 بوصة",
                sku: "DL-MON-24",
                quantity: 10,
                unitCost: 4500,
                total: 45000,
            },
        ],
        subtotal: 190000,
        taxAmount: 26600,
        total: 216600,
        status: "received",
        notes: "دفعة يونيو",
    },
    {
        id: "PO-2026-011",
        type: "order",
        supplierId: "s2",
        supplierName: "مستودعات الأمير للحاسبات",
        date: "2026-06-10",
        items: [
            {
                productId: "p3",
                productName: "لابتوب Lenovo IdeaPad 3",
                sku: "LN-IDE-3",
                quantity: 15,
                unitCost: 10500,
                total: 157500,
            },
            {
                productId: "p4",
                productName: "لابتوب ASUS VivoBook 15",
                sku: "AS-VIV-15",
                quantity: 5,
                unitCost: 11000,
                total: 55000,
            },
        ],
        subtotal: 212500,
        taxAmount: 29750,
        total: 242250,
        status: "pending",
        notes: "طلب شهر يونيو",
    },
    {
        id: "PI-2026-010",
        type: "invoice",
        supplierId: "s3",
        supplierName: "شركة الخليج للإلكترونيات",
        date: "2026-06-05",
        items: [
            {
                productId: "p10",
                productName: "كيبورد لاسلكي Logitech K380",
                sku: "LG-KB-K380",
                quantity: 30,
                unitCost: 350,
                total: 10500,
            },
            {
                productId: "p11",
                productName: "ماوس لاسلكي Logitech M185",
                sku: "LG-MS-M185",
                quantity: 30,
                unitCost: 250,
                total: 7500,
            },
            {
                productId: "p13",
                productName: "راوتر TP-Link Archer C6",
                sku: "TP-RT-AC6",
                quantity: 10,
                unitCost: 1200,
                total: 12000,
            },
        ],
        subtotal: 30000,
        taxAmount: 4200,
        total: 34200,
        status: "received",
        notes: "ملحقات وشبكات",
    },
];

export const PAYMENT_LABELS: Record<string, string> = {
    cash: "نقدي",
    visa: "فيزا / بطاقة",
    transfer: "تحويل بنكي",
    instapay: "إنستاباي",
};

export const STATUS_LABELS: Record<string, string> = {
    paid: "مدفوع",
    pending: "معلق",
    draft: "مسودة",
    cancelled: "ملغي",
    received: "مستلم",
    partial: "جزئي",
};

export const REVENUE_DATA = [
    { month: "يناير", revenue: 185000, profit: 42000, orders: 24 },
    { month: "فبراير", revenue: 210000, profit: 48000, orders: 28 },
    { month: "مارس", revenue: 195000, profit: 44000, orders: 26 },
    { month: "أبريل", revenue: 240000, profit: 55000, orders: 32 },
    { month: "مايو", revenue: 280000, profit: 64000, orders: 38 },
    { month: "يونيو", revenue: 320000, profit: 73000, orders: 42 },
];

export const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("ar-EG", {
        style: "currency",
        currency: "EGP",
        maximumFractionDigits: 0,
    }).format(amount);
