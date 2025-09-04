import React from 'react';
import {
    Modal,
    Form,
    Input,
    Button,
    Upload,
    message,
} from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ProductType } from '../../types';
import { uploadService } from '../../services/uploadService';
import { ImageType } from '../../types';
import ImageWithFallback from '../Common/ImageWithFallback';

const { TextArea } = Input;

interface ProductTypeModalProps {
    open: boolean;
    editingProductType: ProductType | null;
    loading: boolean;
    onCancel: () => void;
    onSubmit: (values: any) => Promise<void>;
}

const ProductTypeModal: React.FC<ProductTypeModalProps> = ({
    open,
    editingProductType,
    loading,
    onCancel,
    onSubmit,
}) => {
    const [form] = Form.useForm();
    const [logoUrl, setLogoUrl] = React.useState<string>('');
    const [uploading, setUploading] = React.useState(false);

    // Set form values when editingProductType changes
    React.useEffect(() => {
        if (editingProductType) {
            setLogoUrl(editingProductType.logo || '');
            form.setFieldsValue({
                name: editingProductType.name,
                description: editingProductType.description,
                logo: editingProductType.logo,
                skuPrefix: editingProductType.skuPrefix,
            });
        } else {
            setLogoUrl('');
            form.resetFields();
        }
    }, [editingProductType, form]);

    const handleLogoUpload = async (file: File) => {
        try {
            setUploading(true);
            const uploadedImage = await uploadService.uploadSingle(file, ImageType.PRODUCT_TYPE);
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
        const productTypeData = {
            ...values,
            logo: logoUrl || values.logo,
        };
        await onSubmit(productTypeData);
    };

    const handleCancel = () => {
        setLogoUrl('');
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title={editingProductType ? 'Edit Product Type' : 'Add New Product Type'}
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
                    label="Product Type Name"
                    rules={[
                        { required: true, message: 'Please enter product type name' },
                        { min: 2, message: 'Name must be at least 2 characters' },
                        { max: 100, message: 'Name cannot exceed 100 characters' }
                    ]}
                >
                    <Input placeholder="Enter product type name" />
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
                    <Input placeholder="Enter SKU prefix (e.g., PRD, ELEC, etc.)" />
                </Form.Item>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                    <Button onClick={handleCancel} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                    >
                        {editingProductType ? 'Update Product Type' : 'Create Product Type'}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default ProductTypeModal;
