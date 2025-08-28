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
        BASE: '/api/sales',
        QUICK_SALE: '/api/sales/quick-sale',
        REPORTS: '/api/sales/reports',
    },

    // Reports endpoints
    REPORTS: {
        BASE: '/api/reports',
        SALES_SUMMARY: '/api/reports/sales-summary',
        INVENTORY: '/api/reports/inventory',
        PROFIT_LOSS: '/api/reports/profit-loss',
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