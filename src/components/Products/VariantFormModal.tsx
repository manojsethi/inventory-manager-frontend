import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Input, InputNumber, Row, Upload, Modal } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import ImageWithFallback from '../Common/ImageWithFallback';



const { TextArea } = Input;

interface VariantFormModalProps {
    // Core modal props
    visible: boolean;
    onClose: () => void;

    // Data
    variant?: any; // For editing (null/undefined for adding)
    variantIndex?: number; // Only needed for differentiator logic

    // Simplified callbacks
    onSave: (variantData: any, isEdit: boolean) => void;
    onImageUpload?: (files: File[]) => void;
    onImageRemove?: (imageIndex: number) => void;

    // Differentiator logic (business requirement)
    isAttributeDifferentiator?: (variantIndex: number, attributeId: string) => boolean;
    onDifferentiatorToggle?: (variantIndex: number, attributeId: string, isDifferentiator: boolean) => void;
}

const VariantFormModal: React.FC<VariantFormModalProps> = ({
    visible,
    onClose,
    variant,
    variantIndex,
    onSave,
    onImageUpload,
    onImageRemove,
    isAttributeDifferentiator,
    onDifferentiatorToggle
}) => {
    // Internal state management
    const [form] = Form.useForm();
    const [uploading, setUploading] = useState(false);
    const [attributeGroups, setAttributeGroups] = useState<any[]>([]);

    const isEdit = !!variant;


    // Load form data when editing
    useEffect(() => {
        if (isEdit && variant && visible) {
            console.log('🔧 VariantFormModal: Loading variant for editing:', variant);
            console.log('🔧 Current variant attributes:', variant.attributes);
            console.log('🔧 Current variant attributeGroups:', variant.attributeGroups);

            // Set basic form values
            const formValues = {
                name: variant.name,
                description: variant.description,
                price: variant.price,
                costPrice: variant.costPrice,
                variantAttributes: variant.attributes || {}
            };

            console.log('🔧 Setting form values:', formValues);
            form.setFieldsValue(formValues);

            // Load existing attribute groups
            if (variant.attributeGroups && variant.attributeGroups.length > 0) {
                console.log('🔧 Loading existing attribute groups:', variant.attributeGroups);
                setAttributeGroups(variant.attributeGroups);
            } else {
                console.log('🔧 No existing attribute groups found');
                setAttributeGroups([]);
            }

            // Check form values after setting
            setTimeout(() => {
                const currentFormValues = form.getFieldsValue();
                console.log('🔧 Form values after setting:', currentFormValues);
            }, 100);
        } else if (!isEdit && visible) {
            console.log('🔧 VariantFormModal: Clearing for add mode');
            // Clear form for add mode
            form.resetFields();
            setAttributeGroups([]);
        }
    }, [isEdit, variant, visible, form]);

    const handleSubmit = async () => {
        try {
            debugger;
            const values = await form.validateFields();
            console.log('Form values:', values);

            // Debug: Check all form fields
            const allFormFields = form.getFieldsValue(true);
            console.log('🔍 All form fields:', allFormFields);

            // Debug: Check specific paths
            console.log('🔍 Direct variantAttributes check:', form.getFieldValue('variantAttributes'));
            console.log('🔍 Direct variantAttributes array check:', form.getFieldValue(['variantAttributes']));

            // All attributes are in groups - collect form values for each group
            const updatedAttributeGroups = attributeGroups.map(group => ({
                ...group,
                attributes: group.attributes.map((attr: { id: string; type: string; label: string; value?: any }) => {
                    const fieldPath = ['variantAttributes', attr.id];
                    const fieldValue = form.getFieldValue(fieldPath);
                    console.log(`🔍 Collecting attribute ${attr.id} from group ${group.name}:`, fieldPath, '→', fieldValue);
                    return {
                        ...attr,
                        value: fieldValue !== undefined ? fieldValue : attr.value
                    };
                })
            }));

            console.log('🔍 Updated attribute groups:', updatedAttributeGroups);
            console.log('🔍 Total groups:', updatedAttributeGroups.length);

            // Create the variant data
            const variantData = {
                ...(variant || {}),
                name: values.name,
                description: values.description,
                price: values.price,
                costPrice: values.costPrice,
                attributes: {}, // No individual attributes - all are in groups
                attributeGroups: updatedAttributeGroups // All attributes are in groups
            };

            console.log('🔧 Final variant data:', variantData);

            // Call the unified save callback
            onSave(variantData, isEdit);

            // Close modal and reset form
            onClose();
            form.resetFields();
        } catch (error) {
            console.error('Form validation failed:', error);
        }
    };

    const handleCancel = () => {
        onClose();
        form.resetFields();
    };

    const handleImageUpload = async (files: File[]) => {
        if (onImageUpload) {
            setUploading(true);
            try {
                await onImageUpload(files);
            } finally {
                setUploading(false);
            }
        }
    };

    return (
        <Modal
            title={isEdit ? `Edit Variant: ${variant?.name}` : "Add New Variant"}
            open={visible}
            onCancel={handleCancel}
            width={800}
            footer={[
                <Button key="cancel" onClick={handleCancel}>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" onClick={handleSubmit} loading={uploading}>
                    {isEdit ? 'Update Variant' : 'Add Variant'}
                </Button>
            ]}
        >
            <Form form={form} layout="vertical">
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            name="name"
                            label={<span className="font-semibold">Variant Name</span>}
                            rules={[{ required: true, message: 'Please enter variant name' }]}
                        >
                            <Input placeholder="Enter variant name" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
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
                    <Col span={8}>
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

                <Form.Item
                    name="description"
                    label={<span className="font-semibold">Description</span>}
                >
                    <TextArea
                        rows={3}
                        placeholder="Enter variant description"
                        maxLength={500}
                        showCount
                    />
                </Form.Item>

                <Form.Item label={<span className="font-semibold">Images</span>}>
                    <Upload
                        multiple={true}
                        beforeUpload={(file, fileList) => {
                            handleImageUpload(Array.from(fileList));
                            return false;
                        }}
                        fileList={[]}
                    >
                        <Button icon={<UploadOutlined />} loading={uploading}>
                            Upload Images
                        </Button>
                    </Upload>

                    {/* Display uploaded images */}
                    {variant && variant.images && variant.images.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {variant.images.map((imageUrl: string, imageIndex: number) => (
                                <div key={imageIndex} className="relative">
                                    <ImageWithFallback
                                        src={imageUrl}
                                        alt={`Variant image ${imageIndex + 1}`}
                                        size="small"
                                        variant="product"
                                        width={80}
                                        height={80}
                                    />
                                    {onImageRemove && (
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={<DeleteOutlined />}
                                            className="absolute top-0 right-0 bg-red-500 text-white hover:bg-red-600"
                                            onClick={() => onImageRemove(imageIndex)}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </Form.Item>


            </Form>
        </Modal>
    );
};

export default VariantFormModal;
