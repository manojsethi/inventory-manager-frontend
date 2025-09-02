// Product type service request types

export interface CreateProductTypeRequest {
    name: string;
    description?: string;
    logo?: string;
    skuPrefix: string;
}

export interface UpdateProductTypeRequest extends Partial<CreateProductTypeRequest> { }

export interface CreateProductTypeCategoryRequest {
    name: string;
    description?: string;
    logo?: string;
    skuPrefix: string;
    isActive?: boolean;
}

export interface UpdateProductTypeCategoryRequest extends Partial<CreateProductTypeCategoryRequest> { }
