import React, { useState, useEffect, useCallback } from 'react';
import { Select, message, Spin, Image } from 'antd';
import { productService } from '../../services';
import type { Product } from '../../types';

const { Option } = Select;

interface Variant {
    _id: string;
    sku: string;
    name: string;
    currentPrice?: number;
    currentCost?: number;
    images?: string[];
    isActive: boolean;
}

interface VariantSelectorProps {
    value?: string;
    onChange?: (variantId: string, variant: Variant) => void;
    product: Product | null;
    placeholder?: string;
    disabled?: boolean;
    style?: React.CSSProperties;
}

const VariantSelector: React.FC<VariantSelectorProps> = ({
    value,
    onChange,
    product,
    placeholder = "Select variant...",
    disabled = false,
    style
}) => {
    const [variants, setVariants] = useState<Variant[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchVariants = useCallback(async () => {
        if (!product) {
            setVariants([]);
            return;
        }

        try {
            setLoading(true);
            const variantsData = await productService.getVariantsById(product._id);
            setVariants(variantsData);
        } catch (error) {
            console.error('Error fetching variants:', error);
            message.error('Failed to fetch product variants');
            setVariants([]);
        } finally {
            setLoading(false);
        }
    }, [product]);

    useEffect(() => {
        fetchVariants();
    }, [fetchVariants]);

    const handleVariantChange = (variantId: string) => {
        const selectedVariant = variants.find(v => v._id === variantId);
        if (selectedVariant && onChange) {
            onChange(variantId, selectedVariant);
        }
    };

    const getVariantOptionContent = (variant: Variant) => {
        const firstImage = variant.images && variant.images.length > 0 ? variant.images[0] : null;

        return (
            <div className="flex items-center gap-2 w-full">
                {firstImage && (
                    <Image
                        src={firstImage}
                        alt={variant.name}
                        width={32}
                        height={32}
                        className="object-cover rounded flex-shrink-0"
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                    />
                )}
                <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-800 leading-tight mb-0.5">
                        {variant.name}
                    </div>
                    <div className="text-xs text-gray-500 font-mono leading-tight">
                        {variant.sku}
                    </div>
                </div>
            </div>
        );
    };

    if (!product) {
        return (
            <Select
                placeholder="Select a product first"
                disabled={true}
                style={style}
            />
        );
    }

    return (
        <Select
            value={value}
            onChange={handleVariantChange}
            placeholder={placeholder}
            disabled={disabled}
            style={style}
            loading={loading}
            notFoundContent={loading ? <Spin size="small" /> : "No variants found"}
            styles={{
                popup: {
                    root: {
                        maxHeight: '300px',
                        overflow: 'auto'
                    }
                }
            }}
            popupMatchSelectWidth={false}
            optionLabelProp="label"
        >
            {variants.map((variant) => (
                <Option key={variant._id} value={variant._id} label={variant.name}>
                    {getVariantOptionContent(variant)}
                </Option>
            ))}
        </Select>
    );
};

export default VariantSelector;
