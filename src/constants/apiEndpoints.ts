// API Base URL
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// All API endpoints organized under a common object
export const API_ENDPOINTS = {
    // Authentication endpoints
    AUTH: {
        LOGIN: '/api/auth/login',
        LOGOUT: '/api/auth/logout',
        REFRESH: '/api/auth/refresh',
        ME: '/api/auth/me',
    },

    // Dashboard endpoints
    DASHBOARD: {
        STATS: '/api/dashboard/stats',
        SUMMARY: '/api/dashboard/summary',
    },

    // Products endpoints
    PRODUCTS: {
        BASE: '/api/products',
        CATEGORIES: '/api/products/categories',
        LOW_STOCK: '/api/products/low-stock',
        BULK_UPDATE: '/api/products/bulk-update',
        SEARCH: '/api/products/search',
    },

    // Product Types endpoints
    PRODUCT_TYPES: {
        BASE: '/api/product-types',
    },

    // Product Brands endpoints
    PRODUCT_BRANDS: {
        BASE: '/api/product-brands',
    },

    // Attributes endpoints
    ATTRIBUTES: {
        BASE: '/api/attribute-definitions',
        FIELD_TYPES: '/api/attribute-definitions/field-types',
        CATEGORIES: '/api/attribute-definitions/categories',
        BY_CATEGORY: '/api/attribute-definitions/category',
        FILTERABLE_BY_CATEGORY: '/api/attribute-definitions/category',
        SEARCHABLE_BY_CATEGORY: '/api/attribute-definitions/category',
        VALIDATE: '/api/attribute-definitions/validate',
    },

    // Customers endpoints
    CUSTOMERS: {
        BASE: '/api/customers',
        SEARCH: '/api/customers/search',
    },

    // Suppliers endpoints
    SUPPLIERS: {
        BASE: '/api/suppliers',
        SEARCH: '/api/suppliers/search',
    },

    // Categories endpoints
    CATEGORIES: {
        BASE: '/api/categories',
        SEARCH: '/api/categories/search',
    },

    // Companies endpoints
    COMPANIES: {
        BASE: '/api/companies',
        SEARCH: '/api/companies/search',
    },

    // Supplier Categories endpoints
    SUPPLIER_CATEGORIES: {
        BASE: '/api/supplier-categories',
        STATS: '/api/supplier-categories/stats',
        SUPPLIER: '/api/supplier-categories/supplier',
        CATEGORY: '/api/supplier-categories/category',
    },

    // Company Categories endpoints
    COMPANY_CATEGORIES: {
        BASE: '/api/company-categories',
        STATS: '/api/company-categories/stats',
        COMPANY: '/api/company-categories/company',
        CATEGORY: '/api/company-categories/category',
    },

    // Supplier Companies endpoints
    SUPPLIER_COMPANIES: {
        BASE: '/api/supplier-companies',
        SUPPLIER: '/api/supplier-companies/supplier',
        COMPANY: '/api/supplier-companies/company',
    },

    // Sales endpoints
    SALES: {
        BASE: '/api/sale-bills',
        NEXT_NUMBER: '/api/sale-bills/next-number',
        QUICK_SALE: '/api/sales/quick-sale',
        REPORTS: '/api/sales/reports',
    },

    // Purchase Bills endpoints
    PURCHASE_BILLS: {
        BASE: '/api/purchase-bills',
        NEXT_NUMBER: '/api/purchase-bills/next-number',
        SUPPLIER: '/api/purchase-bills/supplier',
        PENDING: '/api/purchase-bills/pending',
    },

    // Reports endpoints
    REPORTS: {
        BASE: '/api/reports',
        // Dashboard & Combined Reports
        DASHBOARD: '/api/reports/dashboard',
        PROFIT_LOSS: '/api/reports/profit-loss',
        INVENTORY_TURNOVER: '/api/reports/inventory-turnover',
        MONTHLY_BUSINESS: '/api/reports/monthly-business',
        // Sales Reports
        SALES: {
            DAILY_SUMMARY: '/api/reports/sales/daily-summary',
            MONTHLY_REPORT: '/api/reports/sales/monthly-report',
            RETURN_REPORT: '/api/reports/sales/return-report',
            PERFORMANCE_BY_DATE: '/api/reports/sales/performance-by-date',
            TOP_CUSTOMERS: '/api/reports/sales/top-customers',
            PRODUCT_CATEGORY: '/api/reports/sales/product-category',
            GROWTH_REPORT: '/api/reports/sales/growth-report',
            AVERAGE_BILL_VALUE: '/api/reports/sales/average-bill-value',
        },
        // Purchase Reports
        PURCHASES: {
            DAILY_SUMMARY: '/api/reports/purchases/daily-summary',
            MONTHLY_SUMMARY: '/api/reports/purchases/monthly-summary',
            SUPPLIER_WISE: '/api/reports/purchases/supplier-wise',
            TOP_SUPPLIERS: '/api/reports/purchases/top-suppliers',
            COST_ANALYSIS: '/api/reports/purchases/cost-analysis',
            GROWTH_REPORT: '/api/reports/purchases/growth-report',
        },
    },

    // Users endpoints
    USERS: {
        BASE: '/api/users',
        PROFILE: '/api/users/profile',
    },

    // File upload endpoints
    UPLOAD: {
        BASE: '/api/upload',
        SINGLE: '/api/upload/single',
        MULTIPLE: '/api/upload/multiple',
        DELETE: '/api/upload/:key',
        DELETE_MULTIPLE: '/api/upload/delete-multiple',
        PRESIGNED_URL: '/api/upload/presigned-url',
        PRESIGNED_URLS: '/api/upload/presigned-urls',
    },
} as const;

// Legacy exports for backward compatibility (can be removed later)
export const AUTH_ENDPOINTS = API_ENDPOINTS.AUTH;
export const DASHBOARD_ENDPOINTS = API_ENDPOINTS.DASHBOARD;
export const PRODUCTS_ENDPOINTS = API_ENDPOINTS.PRODUCTS;
export const CUSTOMERS_ENDPOINTS = API_ENDPOINTS.CUSTOMERS;
export const SUPPLIERS_ENDPOINTS = API_ENDPOINTS.SUPPLIERS;
export const CATEGORIES_ENDPOINTS = API_ENDPOINTS.CATEGORIES;
export const COMPANIES_ENDPOINTS = API_ENDPOINTS.COMPANIES;
export const SUPPLIER_CATEGORIES_ENDPOINTS = API_ENDPOINTS.SUPPLIER_CATEGORIES;
export const COMPANY_CATEGORIES_ENDPOINTS = API_ENDPOINTS.COMPANY_CATEGORIES;
export const SUPPLIER_COMPANIES_ENDPOINTS = API_ENDPOINTS.SUPPLIER_COMPANIES;
export const SALES_ENDPOINTS = API_ENDPOINTS.SALES;
export const REPORTS_ENDPOINTS = API_ENDPOINTS.REPORTS;
export const USERS_ENDPOINTS = API_ENDPOINTS.USERS;
export const UPLOAD_ENDPOINTS = API_ENDPOINTS.UPLOAD; 