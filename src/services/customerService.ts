import { API_ENDPOINTS } from '../constants/apiEndpoints';
import type { PaginatedResponse } from '../types/common';
import type { CreateCustomerRequest, Customer, UpdateCustomerRequest } from '../types/customer';
import type { CustomerQueryParams } from '../types/services';
import { axios } from '../utils';


class CustomerService {
    async getAll(params?: CustomerQueryParams): Promise<PaginatedResponse<Customer>> {
        const response = await axios.get(API_ENDPOINTS.CUSTOMERS.BASE, { params });
        return response.data.data;
    }

    async getById(id: string): Promise<Customer> {
        const response = await axios.get(`${API_ENDPOINTS.CUSTOMERS.BASE}/${id}`);
        return response.data.data;
    }

    async create(data: CreateCustomerRequest): Promise<Customer> {
        const response = await axios.post(API_ENDPOINTS.CUSTOMERS.BASE, data);
        return response.data.data;
    }

    async update(id: string, data: UpdateCustomerRequest): Promise<Customer> {
        const response = await axios.put(`${API_ENDPOINTS.CUSTOMERS.BASE}/${id}`, data);
        return response.data.data;
    }

    async delete(id: string): Promise<void> {
        await axios.delete(`${API_ENDPOINTS.CUSTOMERS.BASE}/${id}`);
    }

    async search(query: string, params?: CustomerQueryParams): Promise<PaginatedResponse<Customer>> {
        const searchParams = { ...params, search: query };
        const response = await axios.get(API_ENDPOINTS.CUSTOMERS.SEARCH, { params: searchParams });
        return response.data.data;
    }

    async bulkUpdate(ids: string[], data: Partial<Customer>): Promise<Customer[]> {
        const response = await axios.patch(`${API_ENDPOINTS.CUSTOMERS.BASE}/bulk-update`, { ids, data });
        return response.data.data;
    }

    async bulkDelete(ids: string[]): Promise<void> {
        await axios.delete(`${API_ENDPOINTS.CUSTOMERS.BASE}/bulk-delete`, { data: { ids } });
    }
}

export const customerService = new CustomerService();
export default customerService; 