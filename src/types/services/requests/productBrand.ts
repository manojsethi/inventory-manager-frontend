// Product brand service request types

export interface CreateProductBrandRequest {
    name: string;
    logo: string;
    isActive?: boolean;
}

export interface UpdateProductBrandRequest extends Partial<CreateProductBrandRequest> { }
