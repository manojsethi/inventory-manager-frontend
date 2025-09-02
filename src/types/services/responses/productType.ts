// Product type service response types

export interface ProductType {
    _id: string;
    name: string;
    description?: string;
    logo?: string;
    skuPrefix: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ProductTypeCategory {
    _id: string;
    name: string;
    description?: string;
    logo?: string;
    skuPrefix: string;
    isActive: boolean;
    productType: string; // ProductType ID
    latestNumber: number;
    createdAt?: string;
    updatedAt?: string;
}
