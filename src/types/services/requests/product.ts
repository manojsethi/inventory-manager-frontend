// Product service request types

export interface CreateProductRequest {
    name: string;
    description?: string;
    productType: string;
    productTypeCategory: string;
    productBrand: string;
    variants: {
        name: string;
        description?: string;
        currentPrice: number;
        currentCost: number;
        stockQuantity: number;
        barcode?: string;
        images?: string[];
        attributes?: Record<string, any>;
        attributeGroups?: {
            id: string;
            name: string;
            attributes: string[];
        }[];
        differentiators?: string[];
        isActive?: boolean;
    }[];
    defaultVariantIndex?: number;
    differentiators?: {
        attributes: string[];
        values: Record<string, string[]>;
    };
    isActive?: boolean;
    notes?: string;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
    variants?: {
        name: string;
        description?: string;
        currentPrice: number;
        currentCost: number;
        stockQuantity: number;
        barcode?: string;
        images?: string[];
        attributes?: Record<string, any>;
        attributeGroups?: {
            id: string;
            name: string;
            attributes: string[];
        }[];
        differentiators?: string[];
        sku?: string;
        isActive?: boolean;
    }[];
}

export interface ProductQueryParams {
    name?: string;
    productType?: string;
    productTypeCategory?: string;
    productBrand?: string;
    isActive?: boolean;
    differentiators?: Record<string, any>;
}
