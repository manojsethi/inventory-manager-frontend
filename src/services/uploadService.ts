import { API_ENDPOINTS } from '../constants/apiEndpoints';
import type { ImageType, UploadedImage } from '../types/services';
import { axios } from '../utils';

class UploadService {
    async uploadSingle(file: File, imageType: ImageType): Promise<UploadedImage> {
        const formData = new FormData();
        formData.append('image', file);

        const response = await axios.post(`${API_ENDPOINTS.UPLOAD.SINGLE}?folder=images/${imageType}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data;
    }

    async uploadMultiple(files: File[], imageType: ImageType): Promise<UploadedImage[]> {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('images', file);
        });

        const response = await axios.post(`${API_ENDPOINTS.UPLOAD.MULTIPLE}?folder=images/${imageType}`, formData, {
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

    async generatePresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
        const response = await axios.post(API_ENDPOINTS.UPLOAD.PRESIGNED_URL, { key, expiresIn });
        return response.data.data.presignedUrl;
    }

    async generatePresignedUrls(keys: string[], expiresIn: number = 3600): Promise<{ key: string; url: string }[]> {
        const response = await axios.post(API_ENDPOINTS.UPLOAD.PRESIGNED_URLS, { keys, expiresIn });
        return response.data.data.presignedUrls;
    }

    getPublicUrl(key: string): string {
        // Get the DigitalOcean Spaces URL from environment variables
        const bucketUrl = process.env.REACT_APP_DIGITALOCEAN_BUCKET_URL;

        // Return empty string if env key is not found, null, undefined, or empty
        if (!bucketUrl) {
            return '';
        }

        return `${bucketUrl}/${key}`;
    }
}

export const uploadService = new UploadService();
export default uploadService; 