// Common types shared across multiple services

// PaginatedResponse is defined in the main common types to avoid duplication

export interface QueryParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface BaseEntity {
    _id: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface ImageAsset {
    logo?: string;
    images?: string[];
}

export interface ActiveStatus {
    isActive: boolean;
}
