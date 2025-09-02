// Supplier category service response types

export interface SupplierCategory {
    _id: string;
    supplierId: {
        _id: string;
        name: string;
        contactPerson: string;
        email: string;
        phone: string;
    };
    categoryId: {
        _id: string;
        name: string;
        description?: string;
        logo?: string;
    };
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface SupplierCategoryStats {
    totalRelationships: number;
    activeSuppliers: number;
    activeCategories: number;
    averageRelationshipsPerSupplier: number;
    averageRelationshipsPerCategory: number;
}
