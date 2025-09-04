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
import type { ProductBrand } from '../../types';
import { uploadService } from '../../services/uploadService';
import { ImageType } from '../../types';
import ImageWithFallback from '../Common/ImageWithFallback';

interface ProductBrandModalProps {
    open: boolean;
    editingProductBrand: ProductBrand | null;
    loading: boolean;
    onCancel: () => void;
    onSubmit: (values: any) => Promise<void>;
}

const ProductBrandModal: React.FC<ProductBrandModalProps> = ({
    open,
    editingProductBrand,
    loading,
    onCancel,
    onSubmit,
}) => {
    const [form] = Form.useForm();
    const [logoUrl, setLogoUrl] = React.useState<string>('');
    const [uploading, setUploading] = React.useState(false);

    // Set form values when editingProductBrand changes
    React.useEffect(() => {
        if (editingProductBrand) {
            setLogoUrl(editingProductBrand.logo || '');
            form.setFieldsValue({
                name: editingProductBrand.name,
                logo: editingProductBrand.logo,
                isActive: editingProductBrand.isActive,
            });
        } else {
            setLogoUrl('');
            form.resetFields();
        }
    }, [editingProductBrand, form]);

    const handleLogoUpload = async (file: File) => {
        try {
            setUploading(true);
            const uploadedImage = await uploadService.uploadSingle(file, ImageType.PRODUCT_BRAND);
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
        const productBrandData = {
            ...values,
            logo: logoUrl || values.logo,
        };
        await onSubmit(productBrandData);
    };

    const handleCancel = () => {
        setLogoUrl('');
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title={editingProductBrand ? 'Edit Product Brand' : 'Add New Product Brand'}
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
                    label="Brand Name"
                    rules={[
                        { required: true, message: 'Please enter brand name' },
                        { min: 2, message: 'Name must be at least 2 characters' },
                        { max: 100, message: 'Name cannot exceed 100 characters' }
                    ]}
                >
                    <Input placeholder="Enter brand name" />
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
                    <Button onClick={handleCancel} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                    >
                        {editingProductBrand ? 'Update Product Brand' : 'Create Product Brand'}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default ProductBrandModal;
