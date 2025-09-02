import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Form, Input, Select, Switch, Row, Col, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { productTypeService, productBrandService } from '../../services';
import type { ProductType, ProductTypeCategory, ProductBrand } from '../../types';

const { TextArea } = Input;

interface BasicDetailsTabProps {
    saving: boolean;
    onBasicProductSave: (formData: any) => void;
    initialValues?: any;
}

const BasicDetailsTab: React.FC<BasicDetailsTabProps> = ({
    saving,
    onBasicProductSave,
    initialValues
}) => {
    const [form] = Form.useForm();

    // Internal state for dropdown data
    const [loading, setLoading] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [productTypes, setProductTypes] = useState<ProductType[]>([]);
    const [productTypeCategories, setProductTypeCategories] = useState<ProductTypeCategory[]>([]);
    const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);
    const [selectedProductType, setSelectedProductType] = useState<string>('');

    const loadDropdownData = useCallback(async () => {
        // Prevent multiple API calls if data is already loaded
        if (dataLoaded) return;

        try {
            setLoading(true);
            const [types, brands] = await Promise.all([
                productTypeService.getAll(),
                productBrandService.getAll()
            ]);
            setProductTypes(types);
            setProductBrands(brands);
            setDataLoaded(true);
        } catch (error) {
            message.error('Failed to load dropdown data');
        } finally {
            setLoading(false);
        }
    }, [dataLoaded]);

    // Load categories for a product type (without clearing the form)
    const loadCategoriesForProductType = useCallback(async (productTypeId: string) => {
        if (productTypeId) {
            try {
                const categories = await productTypeService.getAllCategories(productTypeId);
                setProductTypeCategories(categories);
            } catch (error) {
                message.error('Failed to load product categories');
            }
        } else {
            setProductTypeCategories([]);
        }
    }, []);

    // Handle product type change (for user interactions)
    const handleProductTypeChange = useCallback(async (value: string) => {
        setSelectedProductType(value);
        form.setFieldsValue({ productTypeCategory: undefined });
        await loadCategoriesForProductType(value);
    }, [form, loadCategoriesForProductType]);

    // Load dropdown data on component mount
    useEffect(() => {
        loadDropdownData();
    }, [loadDropdownData]);

    // Set initial values when component mounts or initialValues change
    useEffect(() => {
        const setInitialValues = async () => {
            if (initialValues && dataLoaded) {
                // Set the selected product type first to enable category loading
                if (initialValues.productType) {
                    setSelectedProductType(initialValues.productType);
                    // Load categories for the initial product type (without clearing form)
                    await loadCategoriesForProductType(initialValues.productType);
                }

                // Set all form values after categories are loaded
                form.setFieldsValue(initialValues);
            }
        };

        setInitialValues();
    }, [initialValues, form, dataLoaded, loadCategoriesForProductType]);

    const handleSave = async () => {
        try {
            const formData = await form.validateFields();
            onBasicProductSave(formData);
        } catch (error) {
            // Form validation error - Ant Design will show the errors
        }
    };

    return (
        <div className="space-y-6">
            <Form
                form={form}
                layout="vertical"
                initialValues={initialValues || { isActive: true }}
            >
                <Card title="Basic Product Information" className="mb-6 text-left">
                    <Row gutter={16} align="top">
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label={<span className="font-semibold">Product Name</span>}
                                rules={[{ required: true, message: 'Please enter product name' }]}
                            >
                                <Input placeholder="Enter product name" className="text-left" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="productBrand"
                                label={<span className="font-semibold">Product Brand</span>}
                                rules={[{ required: true, message: 'Please select product brand' }]}
                            >
                                <Select
                                    placeholder="Select product brand"
                                    loading={loading}
                                    className="text-left"
                                >
                                    {productBrands.map(brand => (
                                        <Select.Option key={brand._id} value={brand._id}>
                                            {brand.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16} align="top">
                        <Col span={12}>
                            <Form.Item
                                name="productType"
                                label={<span className="font-semibold">Product Type</span>}
                                rules={[{ required: true, message: 'Please select product type' }]}
                            >
                                <Select
                                    placeholder="Select product type"
                                    onChange={handleProductTypeChange}
                                    loading={loading}
                                    className="text-left"
                                >
                                    {productTypes.map(type => (
                                        <Select.Option key={type._id} value={type._id}>
                                            {type.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="productTypeCategory"
                                label={<span className="font-semibold">Product Category</span>}
                                rules={[{ required: true, message: 'Please select product category' }]}
                            >
                                <Select
                                    placeholder="Select product category"
                                    loading={loading}
                                    disabled={!selectedProductType}
                                    className="text-left"
                                >
                                    {productTypeCategories
                                        .filter(category => !selectedProductType || category.productType === selectedProductType)
                                        .map(category => (
                                            <Select.Option key={category._id} value={category._id}>
                                                {category.name}
                                            </Select.Option>
                                        ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        name="description"
                        label={<span className="font-semibold">Description</span>}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Enter product description"
                            className="text-left"
                        />
                    </Form.Item>
                    <Form.Item
                        name="isActive"
                        label={<span className="font-semibold">Status</span>}
                        valuePropName="checked"
                    >
                        <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                    </Form.Item>
                    <div className="flex justify-end">
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={handleSave}
                            loading={saving}
                        >
                            Save Basic Details
                        </Button>
                    </div>
                </Card>
            </Form>
        </div>
    );
};

export default BasicDetailsTab;
