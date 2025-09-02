// Company service response types

export interface Company {
    _id: string;
    name: string;
    logo: string;
    isActive: boolean;
    totalProducts: number;
    totalCategories: number;
    totalSuppliers: number;
    totalSales: number;
    totalRevenue: number;
    createdAt?: string;
    updatedAt?: string;
}
