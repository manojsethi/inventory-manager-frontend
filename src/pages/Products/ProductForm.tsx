import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Card,
    Button,
    Typography,
    message,
    Form,
    Input,
    Select,
    Switch,
    Row,
    Col,
    InputNumber,
    Upload
} from 'antd';
import {
    ArrowLeftOutlined,
    SaveOutlined,
    UploadOutlined,
    DeleteOutlined
} from '@ant-design/icons';

import {
    productService,
    productTypeService,
    productBrandService,
    uploadService,
    type Product,
    type ProductType,
    type ProductTypeCategory,
    type ProductBrand
} from '../../services';

import ImageWithFallback from '../../components/Common/ImageWithFallback';
import {
    DifferentiatorSummary
} from '../../components/Products';
import VariantCard from './VariantCard';

import VariantFormModal from '../../components/Products/VariantFormModal';

const { Title } = Typography;
const { TextArea } = Input;



const ProductForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditing = Boolean(id);

    // Form instances
    const [form] = Form.useForm();


    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null);

    // State management
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [, setProduct] = useState<Product | null>(null);

    // Dropdown data
    const [productTypes, setProductTypes] = useState<ProductType[]>([]);
    const [productTypeCategories, setProductTypeCategories] = useState<ProductTypeCategory[]>([]);
    const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);


    // Form state
    const [selectedProductType, setSelectedProductType] = useState<string>('');
    const [, setSelectedProductTypeCategory] = useState<string>('');
    const [variants, setVariants] = useState<any[]>([]);
    const [variantImages, setVariantImages] = useState<{ [key: number]: string[] }>({});
    const [variantAttributes, setVariantAttributes] = useState<{ [key: number]: Record<string, any> }>({});
    const [processingVariant, setProcessingVariant] = useState<number | null>(null);

    // Check if there are any unsaved variants (variants without SKU)
    const hasUnsavedVariant = variants.some(variant => !variant.sku);
    const [defaultVariantImages, setDefaultVariantImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    const [enableVariants, setEnableVariants] = useState(false);

    // Differentiator state - only for storing UI selections, processed during save
    const calculateDifferentiators = (variantsData: any[]) => {
        const attributeValueMap: { [attributeId: string]: Set<string> } = {};

        // Collect all attribute values across variants
        variantsData.forEach(variant => {
            if (variant.attributeGroups) {
                variant.attributeGroups.forEach((group: any) => {
                    group.attributes.forEach((attr: any) => {
                        if (!attributeValueMap[attr.id]) {
                            attributeValueMap[attr.id] = new Set();
                        }
                        if (attr.value) {
                            attributeValueMap[attr.id].add(String(attr.value));
                        }
                    });
                });
            }
        });

        // Attributes with multiple different values are differentiators
        const differentiatorAttributeIds = Object.keys(attributeValueMap).filter(
            attrId => attributeValueMap[attrId].size > 1
        );

        return {
            attributes: differentiatorAttributeIds,
            values: differentiatorAttributeIds.reduce((acc, attrId) => {
                acc[attrId] = Array.from(attributeValueMap[attrId]);
                return acc;
            }, {} as { [key: string]: string[] })
        };
    };



    // Attribute grouping state management
    const [attributeGroups, setAttributeGroups] = useState<{
        id: string;
        name: string;
        attributes: Array<{ id: string; fieldType: string; label: string; value?: any; isDifferentiator?: boolean }>;
    }[]>([]);


    // Dropdown selection state (to ensure they reset properly)


    // Fetch dropdown data
    const fetchDropdownData = useCallback(async () => {
        try {
            const [types, brands] = await Promise.all([
                productTypeService.getAll(),
                productBrandService.getAll()
            ]);

            setProductTypes(types);
            setProductBrands(brands);
            // attributeDefinitions are now loaded from PREDEFINED_ATTRIBUTES
        } catch (error: any) {
            if (error.message?.includes('401')) {
                message.error('Authentication required. Please log in again.');
            } else {
                message.error('Failed to load dropdown data');
            }
        }
    }, []);

    // Fetch product for editing
    const fetchProduct = useCallback(async () => {
        if (!id) return;

        try {
            setLoading(true);
            const fetchedProduct = await productService.getById(id);
            setProduct(fetchedProduct);

            // Set form values
            const formValues: any = {
                name: fetchedProduct.name,
                description: fetchedProduct.description,
                productType: fetchedProduct.productType._id,
                productTypeCategory: fetchedProduct.productTypeCategory._id,
                productBrand: fetchedProduct.productBrand._id,
                isActive: fetchedProduct.isActive
            };

            // If there's only one variant, load its data into Basic Information
            if (fetchedProduct.variants && fetchedProduct.variants.length === 1) {
                const singleVariant = fetchedProduct.variants[0];
                formValues.price = singleVariant.price;
                formValues.costPrice = singleVariant.costPrice;
                formValues.attributes = singleVariant.attributes || {};

                // No individual attributes - all attributes are in groups

                // Set attribute groups for the single variant
                if (singleVariant.attributeGroups) {
                    // Convert attribute groups to new format if needed
                    const convertedGroups = singleVariant.attributeGroups.map((group: any) => ({
                        ...group,
                        attributes: Array.isArray(group.attributes)
                            ? group.attributes.map((attr: any) => {
                                if (typeof attr === 'string') {
                                    // If it's a string, convert to object and get value from form
                                    const attributeValue = singleVariant.attributes?.[attr] || '';
                                    // Generate dynamic ID for string attributes
                                    const timestamp = Date.now();
                                    const dynamicId = `text_${timestamp}`;

                                    return {
                                        id: dynamicId,
                                        fieldType: 'TEXT',
                                        label: attr,
                                        value: typeof attributeValue === 'object' ? attributeValue.value : attributeValue
                                    };
                                } else {
                                    // If it's already an object, ensure it has a value and dynamic ID
                                    const timestamp = Date.now();
                                    const dynamicId = attr.id ? attr.id : `${attr.fieldType?.toLowerCase() || 'text'}_${timestamp}`;

                                    return {
                                        ...attr,
                                        id: dynamicId,
                                        value: attr.value || ''
                                    };
                                }
                            })
                            : []
                    }));
                    setAttributeGroups(convertedGroups);
                    // Also populate form values for grouped attributes
                    convertedGroups.forEach(group => {
                        group.attributes.forEach((attr: any) => {
                            if (attr.id && attr.value !== undefined) {
                                formValues.attributes = formValues.attributes || {};
                                formValues.attributes[attr.id] = attr.value;
                            }
                        });
                    });
                }
            }

            console.log('Setting form values:', formValues);
            console.log('Form values.attributes:', formValues.attributes);
            form.setFieldsValue(formValues);

            // Force form to update after a small delay to ensure all components are mounted
            setTimeout(() => {
                const currentFormValues = form.getFieldsValue();
                console.log('Form values after setting:', currentFormValues);
                console.log('Attributes in form:', currentFormValues.attributes);
            }, 500);

            // Load categories for the selected product type when editing
            if (fetchedProduct.productType._id) {
                try {
                    const categories = await productTypeService.getAllCategories(fetchedProduct.productType._id);
                    setProductTypeCategories(categories);
                } catch (error) {
                    message.error('Failed to load categories');
                }
            }

            // Set variants
            setVariants(fetchedProduct.variants || []);

            // Set variant images and attributes
            const images: { [key: number]: string[] } = {};
            const attrs: { [key: number]: Record<string, any> } = {};
            variants.forEach((variant, index) => {
                images[index] = variant.images || [];
                attrs[index] = variant.attributes || {};
            });
            setVariantImages(images);
            setVariantAttributes(attrs);

            // Note: Differentiator data will be embedded in attribute groups and calculated during save

            // Set selected values
            setSelectedProductType(fetchedProduct.productType._id);
            setSelectedProductTypeCategory(fetchedProduct.productTypeCategory._id);

        } catch (error: any) {
            if (error.message?.includes('401')) {
                message.error('Authentication required. Please log in again.');
            } else {
                message.error('Failed to load product');
            }
        } finally {
            setLoading(false);
        }
    }, [id, form]);

    // Load data on mount
    useEffect(() => {
        fetchDropdownData();
        if (isEditing) {
            fetchProduct();
        }
    }, [fetchDropdownData, isEditing, fetchProduct]);

    // Handle product type change
    const handleProductTypeChange = async (productTypeId: string) => {
        setSelectedProductType(productTypeId);
        setSelectedProductTypeCategory('');
        form.setFieldsValue({ productTypeCategory: undefined });

        if (productTypeId) {
            try {
                const categories = await productTypeService.getAllCategories(productTypeId);
                setProductTypeCategories(categories);
            } catch (error) {
                message.error('Failed to load categories');
            }
        } else {
            setProductTypeCategories([]);
        }
    };

    // Handle product type category change
    const handleProductTypeCategoryChange = (categoryId: string) => {
        setSelectedProductTypeCategory(categoryId);
    };

    // Handle variant image upload
    const handleVariantImageUpload = async (file: File, variantIndex: number) => {
        try {
            setUploading(true);

            const response = await uploadService.uploadSingle(file);
            const imageUrl = response.url;

            setVariantImages(prev => ({
                ...prev,
                [variantIndex]: [...(prev[variantIndex] || []), imageUrl]
            }));

            message.success('Image uploaded successfully');
        } catch (error) {
            message.error('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    // Handle multiple variant image upload
    const handleMultipleVariantImageUpload = async (files: File[], variantIndex: number) => {
        try {
            setUploading(true);

            const responses = await uploadService.uploadMultiple(files);
            const imageUrls = responses.map((response: any) => response.url);

            setVariantImages(prev => ({
                ...prev,
                [variantIndex]: [...(prev[variantIndex] || []), ...imageUrls]
            }));

            message.success(`${files.length} images uploaded successfully`);
        } catch (error) {
            message.error('Failed to upload images');
        } finally {
            setUploading(false);
        }
    };

    // Handle remove variant image
    const handleRemoveVariantImage = (variantIndex: number, imageIndex: number) => {
        setVariantImages(prev => ({
            ...prev,
            [variantIndex]: prev[variantIndex]?.filter((_, index) => index !== imageIndex) || []
        }));
    };

    // Handle default variant image upload
    const handleDefaultVariantImageUpload = async (file: File) => {
        try {
            setUploading(true);

            const response = await uploadService.uploadSingle(file);
            const imageUrl = response.url;

            setDefaultVariantImages(prev => [...prev, imageUrl]);

            message.success('Image uploaded successfully');
        } catch (error) {
            message.error('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    // Handle multiple default variant image upload
    const handleDefaultVariantMultipleImageUpload = async (files: File[]) => {
        try {
            setUploading(true);

            const responses = await uploadService.uploadMultiple(files);
            const imageUrls = responses.map((response: any) => response.url);

            setDefaultVariantImages(prev => [...prev, ...imageUrls]);

            message.success(`${files.length} images uploaded successfully`);
        } catch (error) {
            message.error('Failed to upload images');
        } finally {
            setUploading(false);
        }
    };

    // Handle remove default variant image
    const handleRemoveDefaultVariantImage = (imageIndex: number) => {
        setDefaultVariantImages(prev => prev.filter((_, index) => index !== imageIndex));
    };

    // Handle add variant (simplified - data comes from modal)
    const handleAddVariant = () => {
        // This function is now called after the modal's onSave callback
        // The variant data is already processed and stored via setVariantAttributeGroups
        // Just initialize the variant index for images and differentiators
        const newVariantIndex = variants.length;

        setVariantImages(prev => ({ ...prev, [newVariantIndex]: [] }));

        // Note: Differentiator data is stored in attribute metadata, processed during save

        message.success('Variant added successfully');
    };

    // Handle update variant
    const handleUpdateVariant = (index: number, updatedVariant: any) => {
        setVariants(prev => prev.map((variant, i) =>
            i === index ? updatedVariant : variant
        ));
        message.success('Variant updated successfully');
    };

    // Modal handlers
    const handleOpenAddVariantModal = () => {
        setEditingVariantIndex(null);
        setModalVisible(true);
    };

    const handleOpenEditVariantModal = (index: number) => {
        setEditingVariantIndex(index);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setEditingVariantIndex(null);
    };

    // Handle variant save
    const handleVariantSave = async (variantData: any, variantIndex: number) => {
        if (!id) {
            message.error('Please save basic product details first');
            return;
        }

        // Check if another variant is being processed
        if (processingVariant !== null && processingVariant !== variantIndex) {
            message.warning('Please complete the current variant operation first');
            return;
        }

        try {
            setProcessingVariant(variantIndex);

            // Images are now handled inside VariantCard, so variantData already includes images
            const variantDataWithImages = variantData;

            if (variantIndex >= 0 && variants[variantIndex]?.sku) {
                // Update existing variant using SKU
                await productService.updateVariant(id, variants[variantIndex].sku, variantDataWithImages);
                message.success('Variant updated successfully');
            } else {
                // Add new variant
                const updatedProduct = await productService.addVariant(id, variantDataWithImages);
                setVariants(updatedProduct.variants || []);
                message.success('Variant added successfully');
            }
        } catch (error) {
            message.error('Failed to save variant');
        } finally {
            setProcessingVariant(null);
        }
    };

    // Handle variant delete
    const handleVariantDelete = async (variantSku: string) => {
        if (!id) return;

        // Check if another variant is being processed
        if (processingVariant !== null) {
            message.warning('Please complete the current variant operation first');
            return;
        }

        try {
            const variantIndex = variants.findIndex(v => v.sku === variantSku);
            setProcessingVariant(variantIndex);

            await productService.deleteVariant(id, variantSku);
            setVariants(variants.filter(v => v.sku !== variantSku));
            message.success('Variant deleted successfully');
        } catch (error) {
            message.error('Failed to delete variant');
        } finally {
            setProcessingVariant(null);
        }
    };

    // Handle variant clone
    const handleVariantClone = (variantSku: string) => {
        // Check if there's already an unsaved variant
        if (hasUnsavedVariant) {
            message.warning('Please save the current variant before adding a new one');
            return;
        }

        // Check if another variant is being processed
        if (processingVariant !== null) {
            message.warning('Please complete the current variant operation first');
            return;
        }

        const variantToClone = variants.find(v => v.sku === variantSku);
        if (!variantToClone) {
            message.error('Variant not found');
            return;
        }

        // Create a deep copy of the variant
        const clonedVariant = {
            ...variantToClone,
            sku: undefined, // Remove the SKU so it's treated as a new variant
            id: `temp_${Date.now()}`,
            name: `${variantToClone.name} (Copy)`,
            images: [...(variantToClone.images || [])],
            attributeGroups: variantToClone.attributeGroups ?
                JSON.parse(JSON.stringify(variantToClone.attributeGroups)) : []
        };

        setVariants([...variants, clonedVariant]);
        message.success('Variant cloned successfully');
    };

    // Handle remove variant
    const handleRemoveVariant = (index: number) => {
        setVariants(prev => prev.filter((_, i) => i !== index));

        // Update variant images
        const newVariantImages: { [key: number]: string[] } = {};
        Object.keys(variantImages).forEach(key => {
            const keyIndex = parseInt(key);
            if (keyIndex < index) {
                newVariantImages[keyIndex] = variantImages[keyIndex];
            } else if (keyIndex > index) {
                newVariantImages[keyIndex - 1] = variantImages[keyIndex];
            }
        });
        setVariantImages(newVariantImages);

        // Update variant attributes
        const newVariantAttributes: { [key: number]: Record<string, any> } = {};
        Object.keys(variantAttributes).forEach(key => {
            const keyIndex = parseInt(key);
            if (keyIndex < index) {
                newVariantAttributes[keyIndex] = variantAttributes[keyIndex];
            } else if (keyIndex > index) {
                newVariantAttributes[keyIndex - 1] = variantAttributes[keyIndex];
            }
        });
        setVariantAttributes(newVariantAttributes);

        message.success('Variant removed successfully');
    };























    // Create default variant from base product data
    const createDefaultVariant = (baseData: any) => {
        return {
            name: baseData.name || 'Default Variant',
            price: baseData.price || 0,
            costPrice: baseData.costPrice || 0,
            description: baseData.description || '',
            images: baseData.images || [],
            attributes: baseData.attributes || {},
            attributeGroups: baseData.attributeGroups || []
        };
    };










    // Handle form submission
    const handleSubmit = async (values: any) => {
        try {
            console.log('All form values:', values);
            console.log('Attributes form values:', values.attributes);

            setSaving(true);

            let finalVariants = variants;

            // If variants are disabled, create a default variant from base product data
            if (!enableVariants) {
                const defaultVariant = createDefaultVariant({
                    name: values.name,
                    price: values.price || 0,
                    costPrice: values.costPrice || 0,
                    description: values.description,
                    attributes: values.attributes || {},
                    attributeGroups: (values.attributeGroups || []).map((group: any) => ({
                        id: group.id,
                        name: group.name,
                        attributes: group.attributes.map((attr: any) => attr.id)
                    })),
                    images: defaultVariantImages
                });
                finalVariants = [defaultVariant];
            } else if (variants.length === 0) {
                message.error('At least one variant is required when variants are enabled');
                return;
            }

            // Collect attribute values from form for each variant
            const variantsWithAttributes = finalVariants.map((variant, index) => {
                let variantAttrs: { [key: string]: any } = {};
                let variantGroups: { id: string; name: string; attributes: any[]; }[] = [];

                if (enableVariants) {
                    // For enabled variants, all attributes are in groups only
                    if (variant.attributeGroups) {
                        variantGroups = variant.attributeGroups.map((group: any) => ({
                            id: group.id,
                            name: group.name,
                            attributes: group.attributes.map((attr: any) => ({
                                id: attr.id,
                                type: attr.type,
                                label: attr.label,
                                value: attr.value
                            }))
                        }));
                    }

                    // No individual attributes - all must be in groups
                    variantAttrs = {};
                } else {
                    // For disabled variants, all attributes are in groups only
                    variantGroups = (values.attributeGroups || []).map((group: any) => {
                        return {
                            id: group.id,
                            name: group.name,
                            attributes: group.attributes.map((attr: any) => {
                                return {
                                    id: attr.id,
                                    type: attr.type,
                                    label: attr.label,
                                    value: attr.value
                                };
                            })
                        }
                    });

                    // No individual attributes - all must be in groups
                    variantAttrs = {};
                }

                return {
                    ...variant,
                    attributes: variantAttrs,
                    attributeGroups: variantGroups,
                    images: variantImages[index] || []
                };
            });

            const productData = {
                name: values.name,
                description: values.description,
                productType: values.productType,
                productTypeCategory: values.productTypeCategory,
                productBrand: values.productBrand,
                isActive: values.isActive,
                // Calculate differentiators from variant data
                differentiators: calculateDifferentiators(variantsWithAttributes),
                variants: variantsWithAttributes
            };
            if (isEditing && id) {
                await productService.update(id, productData);
                message.success('Product updated successfully');
            } else {
                await productService.create(productData);
                message.success('Product created successfully');
            }

            // navigate('/products');
        } catch (error: any) {
            if (error.message?.includes('401')) {
                message.error('Authentication required. Please log in again.');
            } else {
                message.error(isEditing ? 'Failed to update product' : 'Failed to create product');
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <Title level={2} className="!mb-0">
                        {isEditing ? 'Edit Product' : 'Add New Product'}
                    </Title>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/products')}
                    >
                        Back to Products
                    </Button>
                </div>
            </div>

            {/* Form */}
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    isActive: true,
                }}
            >
                {/* Basic Information */}
                <Card title="Basic Information" className="mb-6">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label={<span className="font-semibold">Product Name</span>}
                                rules={[{ required: true, message: 'Please enter product name' }]}
                            >
                                <Input placeholder="Enter product name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="productBrand"
                                label={<span className="font-semibold">Product Brand</span>}
                                rules={[{ required: true, message: 'Please select product brand' }]}
                            >
                                <Select placeholder="Select product brand">
                                    {productBrands.map(brand => (
                                        <Select.Option key={brand._id} value={brand._id}>
                                            <div className="flex items-center">
                                                <ImageWithFallback
                                                    src={brand.logo}
                                                    alt={brand.name}
                                                    size="small"
                                                    variant="logo"
                                                    width={20}
                                                    height={20}
                                                />
                                                <span className="ml-2">{brand.name}</span>
                                            </div>
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="productType"
                                label={<span className="font-semibold">Product Type</span>}
                                rules={[{ required: true, message: 'Please select product type' }]}
                            >
                                <Select
                                    placeholder="Select product type"
                                    onChange={handleProductTypeChange}
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
                                    onChange={handleProductTypeCategoryChange}
                                    disabled={!selectedProductType}
                                >
                                    {productTypeCategories.map(category => (
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
                        <TextArea rows={4} placeholder="Enter product description" />
                    </Form.Item>



                    {/* Variant Management Switch */}
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label={
                                    <div className="flex items-center space-x-2">
                                        <span className="font-semibold">Enable Variants</span>
                                    </div>
                                }
                                extra="When disabled, a default variant will be created automatically from the base product data"
                            >
                                <Switch
                                    checked={enableVariants}
                                    onChange={setEnableVariants}
                                    checkedChildren="Manual Variants"
                                    unCheckedChildren="Auto Variant"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="isActive"
                                label={<span className="font-semibold">Status</span>}
                                valuePropName="checked"
                            >
                                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Base Product Price Fields (only shown when variants are disabled) */}
                    {!enableVariants && (
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="price"
                                    label={<span className="font-semibold">Retail Price</span>}
                                    rules={[{ required: true, message: 'Please enter price' }]}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        placeholder="Enter price"
                                        min={0}
                                        precision={2}
                                        prefix="₹"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="costPrice"
                                    label={<span className="font-semibold">Cost Price</span>}
                                    rules={[{ required: true, message: 'Please enter cost price' }]}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        placeholder="Enter cost price"
                                        min={0}
                                        precision={2}
                                        prefix="₹"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    )}

                    {/* Default Variant Images (only shown when variants are disabled) */}
                    {!enableVariants && (
                        <div className="border border-gray-200 rounded-lg py-4">
                            <Form.Item label={<span className="font-semibold">Product Images</span>}>
                                <Upload
                                    multiple={true}
                                    beforeUpload={(file, fileList) => {
                                        if (fileList.length === 1) {
                                            handleDefaultVariantImageUpload(file);
                                        } else {
                                            handleDefaultVariantMultipleImageUpload(Array.from(fileList));
                                        }
                                        return false;
                                    }}
                                    fileList={[]}
                                >
                                    <Button icon={<UploadOutlined />} loading={uploading}>
                                        Upload Images
                                    </Button>
                                </Upload>

                                {/* Display uploaded images for default variant */}
                                {defaultVariantImages && defaultVariantImages.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {defaultVariantImages.map((imageUrl: string, imageIndex: number) => (
                                            <div key={imageIndex} className="relative">
                                                <ImageWithFallback
                                                    src={imageUrl}
                                                    alt={`Product image ${imageIndex + 1}`}
                                                    size="small"
                                                    variant="product"
                                                    width={80}
                                                    height={80}
                                                />
                                                <Button
                                                    type="text"
                                                    size="small"
                                                    icon={<DeleteOutlined />}
                                                    className="absolute top-0 right-0 bg-red-500 text-white hover:bg-red-600"
                                                    onClick={() => handleRemoveDefaultVariantImage(imageIndex)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Form.Item>
                        </div>
                    )}


                </Card>



                {/* Variants Section - Only shown when variants are enabled */}
                {enableVariants ? (
                    <Card title="Product Variants" className="mb-6">
                        {/* Show existing variants first */}
                        {variants.map((variant, index) => (
                            <VariantCard
                                key={variant.sku || variant.id}
                                variant={variant}
                                variantIndex={index}
                                onSave={handleVariantSave}
                                onDelete={handleVariantDelete}
                                onClone={handleVariantClone}
                                onVariantChange={(variantIndex, updatedVariant) => {
                                    const updatedVariants = [...variants];
                                    updatedVariants[variantIndex] = updatedVariant;
                                    setVariants(updatedVariants);
                                }}
                                isProcessing={processingVariant === index}
                                isUnsaved={!variant.sku}
                            />
                        ))}

                        {/* Add new variant button */}
                        <div className="my-8 border-t border-gray-200 pt-6">
                            <div className="text-center">
                                <Button
                                    type="dashed"
                                    size="large"
                                    onClick={handleOpenAddVariantModal}
                                    className="w-full"
                                >
                                    Add New Variant
                                </Button>
                            </div>
                        </div>
                    </Card>
                ) : null}

                <DifferentiatorSummary
                    variants={variants}
                />

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t mt-6">
                    <Button onClick={() => navigate('/products')}>
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={() => form.submit()}
                        loading={saving}
                        disabled={enableVariants && variants.length === 0}
                    >
                        {isEditing ? 'Update Product' : 'Create Product'}
                    </Button>
                </div>
            </Form>

            {/* Variant Form Modal */}
            <VariantFormModal
                visible={modalVisible}
                onClose={handleCloseModal}
                variant={editingVariantIndex !== null ? variants[editingVariantIndex] : undefined}
                variantIndex={editingVariantIndex !== null ? editingVariantIndex : variants.length}
                onSave={(variantData, isEdit) => {
                    if (isEdit && editingVariantIndex !== null) {
                        handleUpdateVariant(editingVariantIndex, variantData);
                    } else {
                        // Add new variant
                        setVariants(prev => [...prev, variantData]);
                        handleAddVariant();
                    }
                }}
                onImageUpload={(files) => {
                    const variantIndex = editingVariantIndex !== null ? editingVariantIndex : variants.length;
                    if (files.length === 1) {
                        return handleVariantImageUpload(files[0], variantIndex);
                    } else {
                        return handleMultipleVariantImageUpload(files, variantIndex);
                    }
                }}
                onImageRemove={(imageIndex) => {
                    const variantIndex = editingVariantIndex !== null ? editingVariantIndex : variants.length;
                    handleRemoveVariantImage(variantIndex, imageIndex);
                }}
            />
        </div>
    );
};

export default ProductForm;
