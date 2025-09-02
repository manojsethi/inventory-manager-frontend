import { API_ENDPOINTS } from '../constants/apiEndpoints';
import type { DashboardStats, DashboardSummary } from '../types/services';
import { axios } from '../utils';

class DashboardService {
    async getStats(period: string = 'last7days'): Promise<DashboardStats> {
        const response = await axios.get(`${API_ENDPOINTS.DASHBOARD.STATS}?period=${period}`);
        return response.data.data;
    }

    async getSummary(period: string = 'last7days'): Promise<DashboardSummary> {
        const response = await axios.get(`${API_ENDPOINTS.DASHBOARD.SUMMARY}?period=${period}`);
        return response.data.data;
    }

    async getDashboardData(period: string = 'last7days'): Promise<{
        stats: DashboardStats;
        customers: any[];
        products: any[];
        sales: any[];
    }> {
        const [summaryResponse, customersResponse, productsResponse, salesResponse] = await Promise.all([
            axios.get(`${API_ENDPOINTS.DASHBOARD.SUMMARY}?period=${period}`),
            axios.get(`${API_ENDPOINTS.CUSTOMERS.BASE}?limit=5`),
            axios.get(`${API_ENDPOINTS.PRODUCTS.BASE}?limit=10`),
            axios.get(`${API_ENDPOINTS.SALES.BASE}?limit=5`),
        ]);

        const summary = summaryResponse.data.data.summary;
        const customers = customersResponse.data.data.customers;
        const products = productsResponse.data.data.products;
        const sales = salesResponse.data.data.sales;

        const lowStockItems = products.filter((product: any) => product.isLowStock).length;

        const stats: DashboardStats = {
            totalSales: summary.totalSales,
            totalRevenue: summary.totalRevenue,
            totalProfit: summary.totalProfit,
            totalCustomers: customers.length,
            lowStockItems,
            topSellingItems: summary.topSellingItems.slice(0, 5),
            recentSales: sales.map((sale: any) => ({
                saleNumber: sale.saleNumber,
                customerName: sale.customerName || 'Walk-in Customer',
                totalAmount: sale.totalAmount,
                date: new Date(sale.saleDate).toLocaleDateString(),
            })),
        };

        return {
            stats,
            customers,
            products,
            sales,
        };
    }
}

export const dashboardService = new DashboardService();
export default dashboardService; 