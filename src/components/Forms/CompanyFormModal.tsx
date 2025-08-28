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
import { companyService, type Company, type CreateCompanyRequest, type UpdateCompanyRequest } from '../../services';
import { uploadService, ImageType } from '../../services/uploadService';
import { ImageWithFallback } from '../Common';

const { Text } = Typography;

interface CompanyFormModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    companyId?: string;
    company?: Company;
}

const CompanyFormModal: React.FC<CompanyFormModalProps> = ({
    visible,
    onCancel,
    onSuccess,
    companyId,
    company
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [logoUrl, setLogoUrl] = useState<string>('');
    const [uploading, setUploading] = useState(false);

    const isEditMode = !!companyId || !!company;

    useEffect(() => {
        if (visible) {
            if (isEditMode && company) {
                setLogoUrl(company.logo || '');
                form.setFieldsValue({
                    name: company.name,
                    logo: company.logo,
                    isActive: company.isActive,
                });
            } else {
                form.resetFields();
                setLogoUrl('');
            }
        }
    }, [visible, company, form, isEditMode]);

    const handleSubmit = async (values: any) => {
        try {
            setLoading(true);

            const companyData: CreateCompanyRequest | UpdateCompanyRequest = {
                name: values.name,
                logo: logoUrl || values.logo,
                isActive: values.isActive,
            };

            if (isEditMode && companyId) {
                await companyService.update(companyId, companyData as UpdateCompanyRequest);
                message.success('Company updated successfully');
            } else {
                await companyService.create(companyData as CreateCompanyRequest);
                message.success('Company created successfully');
            }

            onSuccess();
            onCancel();
        } catch (err) {
            message.error(err instanceof Error ? err.message : 'Failed to save company');
        } finally {
            setLoading(false);
        }
    };

    const handleLogoUpload = async (file: File) => {
        try {
            setUploading(true);
            const uploadedImage = await uploadService.uploadSingle(file, ImageType.COMPANY);
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
            title={isEditMode ? 'Edit Company' : 'Create New Company'}
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
                    isActive: true,
                }}
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                        <Form.Item
                            name="name"
                            label="Company Name"
                            rules={[
                                { required: true, message: 'Please enter company name' },
                                { min: 2, message: 'Company name must be at least 2 characters' },
                            ]}
                        >
                            <Input placeholder="Enter company name" />
                        </Form.Item>

                        <Form.Item
                            name="isActive"
                            label="Status"
                            valuePropName="checked"
                        >
                            <Switch
                                checkedChildren="Active"
                                unCheckedChildren="Inactive"
                            />
                        </Form.Item>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        <Form.Item
                            name="logo"
                            label="Company Logo"
                        >
                            <div className="space-y-4">
                                {logoUrl && (
                                    <div className="flex items-center space-x-4 mb-4">
                                        <ImageWithFallback
                                            src={logoUrl}
                                            alt="Company Logo"
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
                                    Upload an image (recommended: 150x150px, max 2MB)
                                </Text>
                            </div>
                        </Form.Item>
                    </div>
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
                        {isEditMode ? 'Update Company' : 'Create Company'}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CompanyFormModal; 