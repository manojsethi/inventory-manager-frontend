import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Typography, message, Tabs, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { productService } from '../../services';
import BasicDetailsTab from '../../components/Products/BasicDetailsTab';
import VariantsTab from '../../components/Products/VariantsTab';

const { Title } = Typography;
const { TabPane } = Tabs;

interface ProductDetailProps {
    // This component will be used for viewing and editing existing products
}

const ProductDetail: React.FC<ProductDetailProps> = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState<any>(null);
    const [variants, setVariants] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('1'); // 1 = Basic Details, 2 = Variants

    const loadProduct = useCallback(async () => {
        try {
            setLoading(true);
            const productData = await productService.getById(id!);
            setProduct(productData);

            // Load variants separately using the new API
            const variantsData = await productService.getProductVariants(id!);
            setVariants(variantsData || []);
        } catch (error) {
            message.error('Failed to load product');
            navigate('/products');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    // Load product data
    useEffect(() => {
        if (id) {
            loadProduct();
        }
    }, [id, loadProduct]);

    // Handle basic product save
    const handleBasicProductSave = async (formData: any) => {
        try {
            const updatedProduct = await productService.update(id!, formData);
            setProduct(updatedProduct);
            message.success('Product updated successfully');
        } catch (error) {
            message.error('Failed to update product');
        }
    };

    // Handle variants change
    const handleVariantsChange = (newVariants: any[]) => {
        setVariants(newVariants);
    };

    // Add new variant (frontend only)
    const handleAddNewVariant = () => {
        const newVariant = {
            id: `temp_${Date.now()}`,
            name: '',
            price: 0,
            costPrice: 0,
            images: [],
            attributeGroups: []
        };
        setVariants(prev => [...prev, newVariant]);
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <Spin size="large" />
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <Title level={3}>Product not found</Title>
                    <Button onClick={() => navigate('/products')}>Back to Products</Button>
                </div>
            </div>
        );
    }

    // Transform product data for form compatibility
    const getFormInitialValues = () => {
        if (!product) return null;

        return {
            name: product.name,
            description: product.description,
            productType: product.productType?._id,
            productTypeCategory: product.productTypeCategory?._id,
            productBrand: product.productBrand?._id,
            isActive: product.isActive
        };
    };

    // Basic Details Tab Content - Memoized to prevent unnecessary re-renders
    const BasicDetailsTabContent = () => (
        <BasicDetailsTab
            saving={false}
            onBasicProductSave={handleBasicProductSave}
            initialValues={getFormInitialValues()}
            key={product?._id} // Add key to force re-render when product changes
        />
    );

    // Variants Tab Content
    const VariantsTabContent = () => (
        <VariantsTab
            productSaved={true}
            productId={product._id}
            variants={variants}
            onVariantsChange={handleVariantsChange}
            onAddNewVariant={handleAddNewVariant}
        />
    );

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <Title level={2} className="mb-0">{product.name}</Title>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/products')}
                >
                    Back to Products
                </Button>
            </div>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                    {
                        key: '1',
                        label: 'Basic Details',
                        children: <BasicDetailsTabContent />
                    },
                    {
                        key: '2',
                        label: 'Variants',
                        children: <VariantsTabContent />
                    }
                ]}
            />
        </div>
    );
};

export default ProductDetail;
