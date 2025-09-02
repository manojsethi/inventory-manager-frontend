export interface Customer {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
    notes?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateCustomerRequest {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
    notes?: string;
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {
    isActive?: boolean;
}


