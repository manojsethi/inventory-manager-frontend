// Category service request types

export interface CreateCategoryRequest {
    name: string;
    description?: string;
    logo?: string;
    isActive?: boolean;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
    isActive?: boolean;
}
