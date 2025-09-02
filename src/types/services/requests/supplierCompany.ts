// Supplier company service request types

// Note: MarginTier is defined in responses to avoid duplication

import type { MarginTier } from '../responses/supplierCompany';

export interface CreateSupplierCompanyRequest {
    supplierId: string;
    companyId: string;
    marginTiers?: MarginTier[];
    isActive?: boolean;
    notes?: string;
}

export interface UpdateSupplierCompanyRequest extends Partial<CreateSupplierCompanyRequest> { }

export interface SupplierCompanyQueryParams {
    page?: number;
    limit?: number;
    supplierId?: string;
    companyId?: string;
    isActive?: boolean;
}
