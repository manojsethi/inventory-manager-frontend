import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Input,
    Button,
    Typography,
    message,
    Switch,
    Upload,
} from 'antd';
import {
    SaveOutlined,
    UploadOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import { categoryService } from '../../services';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../../types';
import { uploadService } from '../../services/uploadService';
import { ImageType } from '../../types';
import { ImageWithFallback } from '../Common';

const { TextArea } = Input;
const { Text } = Typography;

interface CategoryFormModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    categoryId?: string;
    category?: Category;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
    visible,
    onCancel,
    onSuccess,
    categoryId,
    category
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [logoUrl, setLogoUrl] = useState<string>('');
    const [uploading, setUploading] = useState(false);

    const isEditMode = !!categoryId || !!category;

    useEffect(() => {
        if (visible) {
            if (isEditMode && category) {
                setLogoUrl(category.logo || '');
                form.setFieldsValue({
                    name: category.name,
                    description: category.description || undefined,
                    logo: category.logo,
                    isActive: category.isActive
                });
            } else {
                form.resetFields();
                setLogoUrl('');
            }
        }
    }, [visible, category, form, isEditMode]);

    const handleSubmit = async (values: any) => {
        try {
            setLoading(true);

            const categoryData: CreateCategoryRequest = {
                name: values.name,
                description: values.description,
                logo: logoUrl || values.logo,
                isActive: values.isActive
            };

            if (isEditMode && categoryId) {
                const updateData: UpdateCategoryRequest = {
                    ...categoryData,
                    isActive: values.isActive
                };
                await categoryService.update(categoryId, updateData);
                message.success('Category updated successfully');
            } else {
                await categoryService.create(categoryData);
                message.success('Category created successfully');
            }

            onSuccess();
            onCancel();
        } catch (err) {
            message.error(err instanceof Error ? err.message : 'Failed to save category');
        } finally {
            setLoading(false);
        }
    };

    const handleLogoUpload = async (file: File) => {
        try {
            setUploading(true);
            const uploadedImage = await uploadService.uploadSingle(file, ImageType.PRODUCT_TYPE_CATEGORY);
            setLogoUrl(uploadedImage.url);
            form.setFieldsValue({ logo: uploadedImage.url });
            message.success('Logo uploaded successfully');
        } catch (err) {
            message.error(err instanceof Error ? err.message : 'Logo upload failed');
        } finally {
            setUploading(false);
        }
    };

    const removeLogo = () => {
        setLogoUrl('');
        form.setFieldsValue({ logo: '' });
    };

    const uploadProps = {
        name: 'logo',
        multiple: false,
        accept: 'image/*',
        beforeUpload: async (file: File) => {
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error('You can only upload image files!');
                return false;
            }
            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
                message.error('Image must be smaller than 5MB!');
                return false;
            }

            await handleLogoUpload(file);
            return false;
        },
        showUploadList: false,
    };

    return (
        <Modal
            title={isEditMode ? 'Edit Category' : 'Create New Category'}
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={600}
            destroyOnHidden
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    isActive: true
                }}
                requiredMark={false}
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Basic Information */}
                    <div className="space-y-4">
                        <Form.Item
                            label="Category Name"
                            name="name"
                            rules={[
                                { required: true, message: 'Please enter category name' },
                                { min: 2, message: 'Name must be at least 2 characters' },
                                { max: 100, message: 'Name cannot exceed 100 characters' }
                            ]}
                        >
                            <Input placeholder="Enter category name" />
                        </Form.Item>
                    </div>

                    {/* Right Column - Logo Upload */}
                    <div className="space-y-4">
                        <Form.Item
                            label="Category Logo"
                            name="logo"
                        >
                            <div className="space-y-4">
                                {logoUrl && (
                                    <div className="flex items-center space-x-4 mb-4">
                                        <ImageWithFallback
                                            src={logoUrl}
                                            alt="Category Logo"
                                            size="medium"
                                            variant="logo"
                                        />
                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={removeLogo}
                                            size="small"
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                )}
                                <Upload {...uploadProps}>
                                    <Button
                                        icon={<UploadOutlined />}
                                        loading={uploading}
                                        size="small"
                                    >
                                        {uploading ? 'Uploading...' : 'Upload Logo'}
                                    </Button>
                                </Upload>
                                <br />
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    Upload a square image (recommended: 150x150px, max 2MB)
                                </Text>
                            </div>
                        </Form.Item>
                    </div>
                </div>
                {/* Description - Full Width */}
                <div>
                    <Form.Item
                        label="Description"
                        name="description"
                    >
                        <TextArea
                            rows={4}
                            placeholder="Enter category description (optional)"
                            maxLength={500}
                            showCount
                        />
                    </Form.Item>
                </div>
                <div className="space-y-4">
                    <Form.Item
                        label="Status"
                        name="isActive"
                        valuePropName="checked"
                    >
                        <Switch
                            checkedChildren="Active"
                            unCheckedChildren="Inactive"
                        />
                    </Form.Item>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                    <Button onClick={onCancel} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        icon={<SaveOutlined />}
                    >
                        {isEditMode ? 'Update Category' : 'Create Category'}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CategoryFormModal; 