// Export all services
export { default as authService, type AuthState, type LoginCredentials, type LoginResponse, type User } from './authService';
export {
    default as categoryService, type Category, type CreateCategoryRequest, type UpdateCategoryRequest
} from './categoryService';
export {
    default as companyCategoryService, type CompanyCategory, type CompanyCategoryQueryParams, type CompanyCategoryStats, type CreateCompanyCategoryRequest, type UpdateCompanyCategoryRequest
} from './companyCategoryService';
export {
    default as companyService, type Company, type CompanyQueryParams, type CreateCompanyRequest, type UpdateCompanyRequest
} from './companyService';
export {
    default as customerService
} from './customerService';
export { default as dashboardService, type DashboardStats, type DashboardSummary } from './dashboardService';
export {
    default as productBrandService, type CreateProductBrandRequest, type ProductBrand, type UpdateProductBrandRequest
} from './productBrandService';
export {
    default as productService, type CreateProductRequest, type Product, type ProductQueryParams, type UpdateProductRequest
} from './productService';
export {
    default as productTypeService, type CreateProductTypeCategoryRequest, type CreateProductTypeRequest,
    type ProductType, type ProductTypeCategory, type UpdateProductTypeCategoryRequest, type UpdateProductTypeRequest
} from './productTypeService';
export {
    default as purchaseBillService, type CreatePurchaseBillRequest, type PurchaseBill, type PurchaseBillItem, type PurchaseBillQueryParams, type UpdatePurchaseBillRequest
} from './purchaseBillService';
export {
    default as supplierCategoryService, type CreateSupplierCategoryRequest, type SupplierCategory, type SupplierCategoryQueryParams, type SupplierCategoryStats, type UpdateSupplierCategoryRequest
} from './supplierCategoryService';
export {
    default as supplierCompanyService, type CreateSupplierCompanyRequest, type MarginTier, type SupplierCompany, type SupplierCompanyQueryParams, type SupplierCompanyStats, type UpdateSupplierCompanyRequest
} from './supplierCompanyService';
export {
    default as supplierService, type CreateSupplierRequest, type Supplier, type SupplierQueryParams, type UpdateSupplierRequest
} from './supplierService';
export { default as syncService, type SyncResponse } from './syncService';
export {
    default as uploadService, type UploadedImage, type UploadResponse
} from './uploadService';

