// Supplier company service response types

export interface MarginTier {
    minAmount: number;
    maxAmount?: number;
    marginPercentage: number;
    description?: string;
}

export interface SupplierCompany {
    _id: string;
    supplierId: {
        _id: string;
        name: string;
        contactPerson: string;
        email: string;
        phone: string;
    };
    companyId: {
        _id: string;
        name: string;
        logo?: string;
        isActive: boolean;
    };
    marginTiers: MarginTier[];
    isActive: boolean;
    notes?: string;
    totalOrders: number;
    totalValue: number;
    averageMargin: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface SupplierCompanyStats {
    totalRelationships: number;
    activeRelationships: number;
    totalOrders: number;
    totalValue: number;
    averageMargin: number;
}
