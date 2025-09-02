// Company category service request types

export interface CreateCompanyCategoryRequest {
    companyId: string;
    categoryId: string;
    notes?: string;
}

export interface UpdateCompanyCategoryRequest extends Partial<CreateCompanyCategoryRequest> { }

export interface CompanyCategoryQueryParams {
    page?: number;
    limit?: number;
    companyId?: string;
    categoryId?: string;
}
