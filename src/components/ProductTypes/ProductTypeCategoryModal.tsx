import React from 'react';
import {
    Modal,
    Form,
    Input,
    Button,
    Upload,
    Switch,
    message,
} from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ProductTypeCategory } from '../../types';
import { uploadService } from '../../services/uploadService';
import { ImageType } from '../../types';
import ImageWithFallback from '../Common/ImageWithFallback';

const { TextArea } = Input;

interface ProductTypeCategoryModalProps {
    open: boolean;
    editingCategory: ProductTypeCategory | null;
    loading: boolean;
    onCancel: () => void;
    onSubmit: (values: any) => Promise<void>;
}

const ProductTypeCategoryModal: React.FC<ProductTypeCategoryModalProps> = ({
    open,
    editingCategory,
    loading,
    onCancel,
    onSubmit,
}) => {
    const [form] = Form.useForm();
    const [logoUrl, setLogoUrl] = React.useState<string>('');
    const [uploading, setUploading] = React.useState(false);

    // Set form values when editingCategory changes
    React.useEffect(() => {
        if (editingCategory) {
            setLogoUrl(editingCategory.logo || '');
            form.setFieldsValue({
                name: editingCategory.name,
                description: editingCategory.description,
                logo: editingCategory.logo,
                skuPrefix: editingCategory.skuPrefix,
                isActive: editingCategory.isActive,
            });
        } else {
            setLogoUrl('');
            form.resetFields();
        }
    }, [editingCategory, form]);

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

    const handleSubmit = async (values: any) => {
        const categoryData = {
            ...values,
            logo: logoUrl || values.logo,
        };
        await onSubmit(categoryData);
        form.resetFields();
    };

    const handleCancel = () => {
        setLogoUrl('');
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title={editingCategory ? 'Edit Category' : 'Add New Category'}
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={600}
            destroyOnHidden
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Form.Item
                    name="name"
                    label="Category Name"
                    rules={[
                        { required: true, message: 'Please enter category name' },
                        { min: 2, message: 'Name must be at least 2 characters' },
                        { max: 100, message: 'Name cannot exceed 100 characters' }
                    ]}
                >
                    <Input placeholder="Enter category name" />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Description"
                    rules={[
                        { max: 500, message: 'Description cannot exceed 500 characters' }
                    ]}
                >
                    <TextArea
                        rows={3}
                        placeholder="Enter description (optional)"
                    />
                </Form.Item>

                <Form.Item
                    name="logo"
                    label="Logo"
                >
                    <div className="space-y-4">
                        {logoUrl && (
                            <div className="flex items-center space-x-4">
                                <ImageWithFallback
                                    src={logoUrl}
                                    alt="Logo"
                                    size="medium"
                                    variant="logo"
                                    width={80}
                                    height={80}
                                />
                                <Button
                                    type="text"
                                    icon={<DeleteOutlined />}
                                    danger
                                    onClick={removeLogo}
                                    title="Remove Logo"
                                >
                                    Remove
                                </Button>
                            </div>
                        )}
                        <Upload
                            name="logo"
                            multiple={false}
                            accept="image/*"
                            beforeUpload={async (file: File) => {
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
                            }}
                            showUploadList={false}
                        >
                            <Button
                                icon={<UploadOutlined />}
                                loading={uploading}
                            >
                                {uploading ? 'Uploading...' : 'Upload Logo'}
                            </Button>
                        </Upload>
                        <div className="text-sm text-gray-500">
                            Upload a square image (recommended: 150x150px, max 5MB)
                        </div>
                    </div>
                </Form.Item>

                <Form.Item
                    name="skuPrefix"
                    label="SKU Prefix"
                    rules={[
                        { required: true, message: 'Please enter SKU prefix' },
                        { min: 1, message: 'SKU prefix must be at least 1 character' },
                        { max: 20, message: 'SKU prefix cannot exceed 20 characters' }
                    ]}
                >
                    <Input placeholder="Enter SKU prefix (e.g., CAT, SUB, etc.)" />
                </Form.Item>

                <Form.Item
                    name="isActive"
                    label="Status"
                    valuePropName="checked"
                    initialValue={true}
                >
                    <Switch
                        checkedChildren="Active"
                        unCheckedChildren="Inactive"
                    />
                </Form.Item>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                    <Button onClick={() => form.resetFields()} disabled={loading}>
                        Reset
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                    >
                        {editingCategory ? 'Update Category' : 'Create Category'}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default ProductTypeCategoryModal;
