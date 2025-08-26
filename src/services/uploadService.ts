import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { axios } from '../utils';

// Types
export interface UploadedImage {
    url: string;
    key: string;
    filename: string;
    size: number;
    mimetype: string;
}

export interface UploadResponse {
    success: boolean;
    data: UploadedImage | UploadedImage[];
    message: string;
}

class UploadService {
    async uploadSingle(file: File): Promise<UploadedImage> {
        const formData = new FormData();
        formData.append('image', file);

        const response = await axios.post(API_ENDPOINTS.UPLOAD.SINGLE, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data.data;
    }

    async uploadMultiple(files: File[]): Promise<UploadedImage[]> {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('images', file);
        });

        const response = await axios.post(API_ENDPOINTS.UPLOAD.MULTIPLE, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data.data;
    }

    async deleteImage(key: string): Promise<void> {
        const url = API_ENDPOINTS.UPLOAD.DELETE.replace(':key', key);
        await axios.delete(url);
    }

    async deleteMultipleImages(keys: string[]): Promise<void> {
        await axios.post(API_ENDPOINTS.UPLOAD.DELETE_MULTIPLE, { keys });
    }
}

export const uploadService = new UploadService();
export default uploadService; 