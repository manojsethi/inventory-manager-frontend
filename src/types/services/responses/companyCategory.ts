// Company category service response types

export interface CompanyCategory {
    _id: string;
    companyId: {
        _id: string;
        name: string;
        logo?: string;
        isActive: boolean;
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

export interface CompanyCategoryStats {
    totalRelationships: number;
    activeCompanies: number;
    activeCategories: number;
    averageRelationshipsPerCompany: number;
    averageRelationshipsPerCategory: number;
}
