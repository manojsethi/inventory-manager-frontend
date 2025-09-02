// Sync service response types

export interface SyncResponse {
    success: boolean;
    message: string;
    data?: {
        updatedCounts: {
            products: number;
            categories: number;
            suppliers: number;
            companies: number;
        };
        timestamp: string;
    };
}
