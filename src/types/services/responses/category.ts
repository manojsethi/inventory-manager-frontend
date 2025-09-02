// Category service response types

export interface Category {
    _id: string;
    name: string;
    description?: string;
    logo?: string;
    isActive: boolean;
    productCount?: number;
    createdAt?: string;
    updatedAt?: string;
}
