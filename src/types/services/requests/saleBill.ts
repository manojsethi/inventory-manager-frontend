// Sale bill service request types

export interface SaleBillQueryParams {
    page?: number;
    limit?: number;
    customer?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
}
