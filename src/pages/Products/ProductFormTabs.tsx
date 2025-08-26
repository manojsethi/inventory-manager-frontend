import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import {
    productService
} from '../../services';
import BasicDetailsTab from './BasicDetailsTab';

const { Title } = Typography;

interface ProductFormTabsProps {
    // This component will be used for new product creation only
}

const ProductFormTabs: React.FC<ProductFormTabsProps> = () => {
    const navigate = useNavigate();

    // State management
    const [saving, setSaving] = useState(false);



    // Handle basic product save
    const handleBasicProductSave = async (formData: any) => {
        try {
            setSaving(true);

            // Create basic product data (without variants)
            const basicProductData = {
                name: formData.name,
                description: formData.description,
                productType: formData.productType,
                productTypeCategory: formData.productTypeCategory,
                productBrand: formData.productBrand,
                isActive: formData.isActive,
                variants: [] // Empty variants array for basic product
            };

            const product = await productService.create(basicProductData);
            message.success('Product created successfully');

            // Redirect to product detail page
            navigate(`/products/${product._id}`);
        } catch (error) {
            message.error('Failed to save product details');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <Title level={2} className="mb-0">Create New Product</Title>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/products')}
                >
                    Back to Products
                </Button>
            </div>

            <BasicDetailsTab
                saving={saving}
                onBasicProductSave={handleBasicProductSave}
            />
        </div>
    );
};



export default ProductFormTabs;
