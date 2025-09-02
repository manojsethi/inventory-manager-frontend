// Product service response types

export interface ProductVariant {
    sku: string;
    name: string;
    description?: string;
    currentPrice: number;
    currentCost: number;
    stockQuantity: number;
    isActive: boolean;
    barcode?: string;
    images?: string[];
    attributes?: Record<string, any>;
    attributeGroups?: {
        id: string;
        name: string;
        attributes: string[];
    }[];
    differentiators?: string[];
}

export interface Product {
    _id: string;
    name: string;
    description?: string;
    productType: {
        _id: string;
        name: string;
        skuPrefix: string;
    };
    productTypeCategory: {
        _id: string;
        name: string;
        skuPrefix: string;
    };
    productBrand: {
        _id: string;
        name: string;
        logo?: string;
    };
    variants: ProductVariant[];
    defaultVariantIndex: number;
    differentiators?: {
        attributes: string[];
        values: Record<string, string[]>;
    };
    isActive: boolean;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}
