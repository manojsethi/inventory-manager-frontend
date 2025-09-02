// Dashboard service response types

export interface DashboardStats {
    totalSales: number;
    totalRevenue: number;
    totalProfit: number;
    totalCustomers: number;
    lowStockItems: number;
    topSellingItems: Array<{
        productName: string;
        unitsSold: number;
        revenue: number;
    }>;
    recentSales: Array<{
        saleNumber: string;
        customerName: string;
        totalAmount: number;
        date: string;
    }>;
}

export interface DashboardSummary {
    summary: {
        totalSales: number;
        totalRevenue: number;
        totalProfit: number;
        topSellingItems: Array<{
            productName: string;
            unitsSold: number;
            revenue: number;
        }>;
    };
}
