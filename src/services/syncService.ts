import axios from '../utils/axios';

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

class SyncService {
    /**
     * Sync all counts with the backend
     * @returns Promise<SyncResponse>
     */
    async syncCounts(): Promise<SyncResponse> {
        try {
            const response = await axios.post('/api/utility/recalculate-counts');
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to sync counts');
        }
    }

    /**
     * Sync specific entity counts
     * @param entity - The entity to sync (products, categories, suppliers, companies)
     * @returns Promise<SyncResponse>
     */
    async syncEntityCounts(entity: 'products' | 'categories' | 'suppliers' | 'companies'): Promise<SyncResponse> {
        try {
            const response = await axios.post(`/api/utility/recalculate-counts/${entity}`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || `Failed to sync ${entity} counts`);
        }
    }

    /**
     * Get sync status
     * @returns Promise<{ lastSync: string; status: string }>
     */
    async getSyncStatus(): Promise<{ lastSync: string; status: string }> {
        try {
            const response = await axios.get('/api/utility/sync-status');
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to get sync status');
        }
    }
}

export const syncService = new SyncService();
export default syncService; 