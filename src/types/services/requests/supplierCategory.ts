// Supplier category service request types

export interface CreateSupplierCategoryRequest {
    supplierId: string;
    categoryId: string;
    notes?: string;
}

export interface UpdateSupplierCategoryRequest extends Partial<CreateSupplierCategoryRequest> { }

export interface SupplierCategoryQueryParams {
    page?: number;
    limit?: number;
    supplierId?: string;
    categoryId?: string;
}
