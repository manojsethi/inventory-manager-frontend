import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { axios } from '../utils';

// Types for Sales Reports
export interface DailySalesSummary {
    date: string;
    totalSales: number;
    totalBills: number;
    totalQuantity: number;
    averageBillValue: number;
}

export interface MonthlySalesReport {
    month: string;
    totalSales: number;
    totalBills: number;
    totalQuantity: number;
    averageBillValue: number;
    dailyBreakdown: DailySalesSummary[];
}

export interface SalesReturnReport {
    totalReturns: number;
    totalReturnAmount: number;
    returnRate: number;
    topReturnReasons: {
        reason: string;
        count: number;
        amount: number;
    }[];
    returnTrends: {
        month: string;
        returnCount: number;
        returnAmount: number;
    }[];
}

export interface SalesPerformanceByDate {
    date: string;
    totalSales: number;
    totalBills: number;
    totalQuantity: number;
    profit: number;
    profitMargin: number;
}

export interface TopCustomer {
    customerId: string;
    customerName: string;
    totalBills: number;
    totalAmount: number;
    averageBillValue: number;
    lastPurchaseDate: string;
}

export interface ProductCategoryReport {
    categoryId: string;
    categoryName: string;
    totalSales: number;
    totalQuantity: number;
    totalBills: number;
    averagePrice: number;
}

export interface SalesGrowthReport {
    month: string;
    currentSales: number;
    previousSales: number;
    growthAmount: number;
    growthPercentage: number;
}

export interface AverageBillValueReport {
    period: string;
    averageBillValue: number;
    totalBills: number;
    totalSales: number;
}

class SalesReportService {
    // Daily Sales Summary
    async getDailySalesSummary(startDate: string, endDate: string): Promise<DailySalesSummary[]> {
        const response = await axios.get(API_ENDPOINTS.REPORTS.SALES.DAILY_SUMMARY, {
            params: { startDate, endDate }
        });
        return response.data.data;
    }

    // Monthly Sales Report
    async getMonthlySalesReport(year?: number): Promise<MonthlySalesReport[]> {
        const response = await axios.get(API_ENDPOINTS.REPORTS.SALES.MONTHLY_REPORT, {
            params: year ? { year } : {}
        });
        return response.data.data;
    }

    // Sales Return Report
    async getSalesReturnReport(startDate: string, endDate: string): Promise<SalesReturnReport> {
        const response = await axios.get(API_ENDPOINTS.REPORTS.SALES.RETURN_REPORT, {
            params: { startDate, endDate }
        });
        return response.data.data;
    }

    // Sales Performance by Date
    async getSalesPerformanceByDate(startDate: string, endDate: string): Promise<SalesPerformanceByDate[]> {
        const response = await axios.get(API_ENDPOINTS.REPORTS.SALES.PERFORMANCE_BY_DATE, {
            params: { startDate, endDate }
        });
        return response.data.data;
    }

    // Top Customers Report
    async getTopCustomers(limit?: number, startDate?: string, endDate?: string): Promise<TopCustomer[]> {
        const response = await axios.get(API_ENDPOINTS.REPORTS.SALES.TOP_CUSTOMERS, {
            params: { limit, startDate, endDate }
        });
        return response.data.data;
    }

    // Product Category Report
    async getProductCategoryReport(startDate: string, endDate: string): Promise<ProductCategoryReport[]> {
        const response = await axios.get(API_ENDPOINTS.REPORTS.SALES.PRODUCT_CATEGORY, {
            params: { startDate, endDate }
        });
        return response.data.data;
    }

    // Sales Growth Report
    async getSalesGrowthReport(year?: number): Promise<SalesGrowthReport[]> {
        const response = await axios.get(API_ENDPOINTS.REPORTS.SALES.GROWTH_REPORT, {
            params: year ? { year } : {}
        });
        return response.data.data;
    }

    // Average Bill Value Report
    async getAverageBillValueReport(startDate: string, endDate: string): Promise<AverageBillValueReport> {
        const response = await axios.get(API_ENDPOINTS.REPORTS.SALES.AVERAGE_BILL_VALUE, {
            params: { startDate, endDate }
        });
        return response.data.data;
    }
}

export const salesReportService = new SalesReportService();
