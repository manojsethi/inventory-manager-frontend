// Company service request types

export interface CreateCompanyRequest {
    name: string;
    logo: string;
    isActive?: boolean;
}

export interface UpdateCompanyRequest extends Partial<CreateCompanyRequest> {
    isActive?: boolean;
}

export interface CompanyQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
}
