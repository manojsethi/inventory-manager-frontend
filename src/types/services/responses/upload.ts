// Upload service response types

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
