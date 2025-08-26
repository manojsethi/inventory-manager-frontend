import React from 'react';
import { Image, ImageProps } from 'antd';

interface ImageWithFallbackProps extends Omit<ImageProps, 'fallback'> {
    src?: string;
    alt: string;
    width?: number | string;
    height?: number | string;
    size?: 'small' | 'medium' | 'large' | 'custom';
    variant?: 'logo' | 'product' | 'avatar' | 'banner';
    showPreview?: boolean;
    className?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
    src,
    alt,
    width,
    height,
    size = 'medium',
    variant = 'logo',
    showPreview = false,
    className = '',
    style,
    ...restProps
}) => {
    // Size presets
    const sizePresets = {
        small: { width: 40, height: 40 },
        medium: { width: 80, height: 80 },
        large: { width: 120, height: 120 },
        custom: { width, height }
    };

    // Variant-specific fallbacks
    const fallbackImages = {
        logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yMCAyMEg2MFY2MEgyMFYyMFoiIGZpbGw9IiNEM0QzRDMiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIyOCIgeT0iMjgiPgo8cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJDMiAxNy41MiA2LjQ4IDIyIDEyIDIyQzE3LjUyIDIyIDIyIDE3LjUyIDIyIDEyQzIyIDYuNDggMTcuNTIgMiAxMiAyWk0xMiAyMEM3LjU4IDIwIDQgMTYuNDIgNCAxMkM0IDcuNTggNy41OCA0IDEyIDRDMTYuNDIgNCAyMCA3LjU4IDIwIDEyQzIwIDE2LjQyIDE2LjQyIDIwIDEyIDIwWiIgZmlsbD0iIzk5OTk5OSIvPgo8cGF0aCBkPSJNMTIgNkM4LjY5IDYgNiA4LjY5IDYgMTJDNiAxNS4zMSA4LjY5IDE4IDEyIDE4QzE1LjMxIDE4IDE4IDE1LjMxIDE4IDEyQzE4IDguNjkgMTUuMzEgNiAxMiA2WiIgZmlsbD0iIzk5OTk5OSIvPgo8L3N2Zz4KPC9zdmc+',
        product: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjVGNUY1Ii8+CjxyZWN0IHg9IjE1IiB5PSIxNSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRDNEM0QzIi8+CjxwYXRoIGQ9Ik0yMCAyMEg2MFYyNUgyMFYyMFoiIGZpbGw9IiM5OTk5OTkiLz4KPHBhdGggZD0iTTIwIDMwSDYwVjM1SDIwVjMwWiIgZmlsbD0iIzk5OTk5OSIvPgo8cGF0aCBkPSJNMjAgNDBINjBWNDVIMjBWNDBaIiBmaWxsPSIjOTk5OTk5Ii8+Cjwvc3ZnPgo=',
        avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiNGNUY1RjUiLz4KPGNpcmNsZSBjeD0iNDAiIGN5PSIzMCIgcj0iMTIiIGZpbGw9IiNEM0QzRDMiLz4KPHBhdGggZD0iTTE2IDU2QzE2IDQ2LjA1OSAyNC4wNTkgMzggMzQgMzhINDRDNTMuOTQxIDM4IDYyIDQ2LjA1OSA2MiA1NlY2MEgxNlY1NloiIGZpbGw9IiNEM0QzRDMiLz4KPC9zdmc+',
        banner: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjVGNUY1Ii8+CjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRDNEM0QzIi8+CjxwYXRoIGQ9Ik0xNSAxNUg2NVYyNUgxNVYxNVoiIGZpbGw9IiM5OTk5OTkiLz4KPHBhdGggZD0iTTE1IDMwSDY1VjQwSDE1VjMwWiIgZmlsbD0iIzk5OTk5OSIvPgo8cGF0aCBkPSJNMTUgNDVINjVWNTVIMTVWNDVaIiBmaWxsPSIjOTk5OTk5Ii8+Cjwvc3ZnPgo='
    };

    // Variant-specific styling
    const variantStyles = {
        logo: {
            borderRadius: '8px',
            objectFit: 'contain' as const,
            border: '1px solid #d9d9d9',
            backgroundColor: '#fafafa'
        },
        product: {
            borderRadius: '8px',
            objectFit: 'contain' as const,
            border: '2px solid #f0f0f0',
            backgroundColor: '#fafafa'
        },
        avatar: {
            borderRadius: '50%',
            objectFit: 'cover' as const,
            border: '2px solid #f0f0f0',
            backgroundColor: '#fafafa'
        },
        banner: {
            borderRadius: '4px',
            objectFit: 'cover' as const,
            border: '1px solid #e8e8e8',
            backgroundColor: '#fafafa'
        }
    };

    // Get dimensions
    const dimensions = size === 'custom'
        ? { width, height }
        : sizePresets[size];

    // Get styling
    const baseStyle = variantStyles[variant];
    const combinedStyle = {
        ...baseStyle,
        ...style
    };

    return (
        <Image
            src={src}
            alt={alt}
            fallback={fallbackImages[variant]}
            preview={showPreview}
            className={className}
            style={combinedStyle}
            {...dimensions}
            {...restProps}
        />
    );
};

export default ImageWithFallback; 