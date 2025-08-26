import {
    CopyOutlined,
    DeleteOutlined,
    PlusOutlined,
    SaveOutlined,
    UploadOutlined
} from '@ant-design/icons';
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { Button, Card, Col, Form, Input, InputNumber, message, Row, Space, Upload } from 'antd';
import React, { useState } from 'react';
import SortableGroupItem from './SortableGroupItem';
import { uploadService } from '../../services';

const { TextArea } = Input;

interface VariantCardProps {
    variant: any;
    variantIndex: number;
    onSave: (variantData: any, variantIndex: number) => Promise<void>;
    onDelete: (variantId: string) => Promise<void>;
    onClone: (variantId: string) => void;
    onVariantChange: (variantIndex: number, updatedVariant: any) => void;
    isProcessing?: boolean;
    isUnsaved?: boolean;
}

const VariantCard: React.FC<VariantCardProps> = ({
    variant,
    variantIndex,
    onSave,
    onDelete,
    onClone,
    onVariantChange,
    isProcessing = false,
    isUnsaved = false
}) => {
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [form] = Form.useForm();
    const [, forceUpdate] = useState({});
    const [selectedAttributeTypes, setSelectedAttributeTypes] = useState<Record<string, string>>({});
    const [expandedGroup, setExpandedGroup] = useState<any>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );



    const handleSave = async () => {
        try {
            setSaving(true);
            const values = await form.validateFields();
            await onSave(values, variantIndex);
        } catch (error) {
            message.error('Failed to save variant');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (variant.sku) {
            try {
                await onDelete(variant.sku);
                message.success('Variant deleted successfully');
            } catch (error) {
                message.error('Failed to delete variant');
            }
        }
    };

    const handleClone = () => {
        onClone(variant.sku || variant.id);
    };

    // Handle image upload for this variant
    const handleImageUpload = async (files: File | File[]) => {
        try {
            setUploading(true);

            const currentImages = variant.images || [];
            const fileArray = Array.isArray(files) ? files : [files];

            // Check if adding these images would exceed the 5-image limit
            if (currentImages.length + fileArray.length > 5) {
                message.error('Maximum 5 images allowed per variant');
                return false;
            }

            const uploadedImages = await uploadService.uploadMultiple(fileArray);
            const imageUrls = uploadedImages.map(img => img.url);

            // Ensure we don't have duplicate URLs
            const uniqueImageUrls = imageUrls.filter((url, index, self) => self.indexOf(url) === index);

            // Update the variant with new images
            const updatedVariant = {
                ...variant,
                images: [...currentImages, ...uniqueImageUrls]
            };
            onVariantChange(variantIndex, updatedVariant);

            return false; // Prevent default upload behavior
        } catch (error) {
            message.error('Failed to upload images');
            return false;
        } finally {
            setUploading(false);
        }
    };

    // Handle image removal for this variant
    const handleImageRemove = (imageIndex: number) => {
        const currentImages = variant.images || [];
        const updatedImages = currentImages.filter((_: string, index: number) => index !== imageIndex);

        const updatedVariant = {
            ...variant,
            images: updatedImages
        };
        onVariantChange(variantIndex, updatedVariant);
    };

    return (
        <Card
            title={`Variant ${variantIndex + 1}${isProcessing ? ' (Processing...)' : ''}${isUnsaved ? ' (Unsaved)' : ''}`}
            className={`text-left ${isProcessing ? 'opacity-75' : ''} ${isUnsaved ? 'border-orange-300' : ''}`}
            extra={
                <Space>
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={handleSave}
                        loading={saving}
                        disabled={isProcessing}
                    >
                        Save
                    </Button>
                    {variant.sku && (
                        <Button
                            icon={<CopyOutlined />}
                            onClick={handleClone}
                            disabled={isProcessing}
                        >
                            Clone
                        </Button>
                    )}
                    {variant.sku && (
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={handleDelete}
                            disabled={isProcessing}
                        >
                            Delete
                        </Button>
                    )}
                </Space>
            }
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={variant}
            >
                <Row gutter={16} align="top">
                    <Col span={24}>
                        <Form.Item
                            name="name"
                            label={<span className="font-semibold">Variant Name</span>}
                            rules={[{ required: true, message: 'Please enter variant name' }]}
                        >
                            <Input placeholder="Enter variant name" className="text-left" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16} align="top">
                    <Col span={12}>
                        <Form.Item
                            name="price"
                            label={<span className="font-semibold">Retail Price (₹)</span>}
                            rules={[{ required: true, message: 'Please enter price' }]}
                        >
                            <InputNumber
                                placeholder="Enter price"
                                className="text-left w-full"
                                min={0}
                                prefix="₹"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="costPrice"
                            label={<span className="font-semibold">Cost Price (₹)</span>}
                        >
                            <InputNumber
                                placeholder="Enter cost price"
                                className="text-left w-full"
                                min={0}
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
                        className="text-left"
                    />
                </Form.Item>

                {/* Images Section */}
                <div className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="mb-4">
                        <span className="font-semibold">Images</span>
                    </div>
                    <div className="space-y-4">
                        <Upload
                            beforeUpload={(file, fileList) => {
                                // Only process if this is the first file (to avoid multiple calls)
                                if (fileList.length > 5) {
                                    message.warning('Only the first 5 images will be uploaded');
                                }
                                // Only call handleImageUpload once with the entire fileList
                                if (file === fileList[0]) {
                                    handleImageUpload(fileList);
                                }
                                return false; // Prevent default upload behavior
                            }}
                            fileList={variant.images?.map((url: string, index: number) => ({
                                uid: `-${index}`,
                                name: `image-${index + 1}`,
                                status: 'done',
                                url: url
                            })) || []}
                            onRemove={(file) => {
                                const index = parseInt(file.uid.replace('-', ''));
                                handleImageRemove(index);
                                return true;
                            }}
                            listType="picture-card"
                            maxCount={5}
                            multiple
                        >
                            <div>
                                <UploadOutlined />
                                <div style={{ marginTop: 8 }}>Upload</div>
                            </div>
                        </Upload>
                    </div>
                </div>

                {/* Attributes Section */}
                <div className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="mb-4">
                        <span className="font-semibold">Attributes</span>
                    </div>
                    <Form.List name="attributeGroups" initialValue={variant.attributeGroups || []}>
                        {(groupFields, { add: addGroup, remove: removeGroup, move: moveGroup }) => {
                            const groups = form.getFieldValue('attributeGroups') || [];

                            const handleGroupDragEnd = (event: any) => {
                                const { active, over } = event;

                                if (active.id !== over.id) {
                                    const oldIndex = groupFields.findIndex((field) => field.key.toString() === active.id);
                                    const newIndex = groupFields.findIndex((field) => field.key.toString() === over.id);

                                    if (oldIndex !== -1 && newIndex !== -1) {
                                        // Use Form.List's move method
                                        moveGroup(oldIndex, newIndex);
                                        forceUpdate({});
                                    }
                                }
                            };

                            return (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleGroupDragEnd}
                                >
                                    <SortableContext
                                        items={groupFields.map((field) => field.key.toString())}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div>
                                            <div className="space-y-4">
                                                {groupFields.map(({ key: groupKey, name: groupName, ...restGroupField }) => (
                                                    <SortableGroupItem
                                                        key={groupKey}
                                                        form={form}
                                                        groupKey={groupKey}
                                                        groupName={groupName}
                                                        restGroupField={restGroupField}
                                                        removeGroup={removeGroup}
                                                        forceUpdate={() => forceUpdate({})}
                                                        isExpanded={expandedGroup === groupName}
                                                        onToggleExpand={(groupName) => {
                                                            setExpandedGroup(expandedGroup === groupName ? null : groupName);
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex justify-end mt-4">
                                                <Button
                                                    type="dashed"
                                                    icon={<PlusOutlined />}
                                                    onClick={() => {
                                                        const newGroup = {
                                                            id: `group_${Date.now()}`,
                                                            name: `Group ${groupFields.length + 1}`,
                                                            attributes: []
                                                        };
                                                        addGroup(newGroup);
                                                        // Expand the newly added group
                                                        setExpandedGroup(groupFields.length);
                                                    }}
                                                >
                                                    Add Group
                                                </Button>
                                            </div>
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            );
                        }}
                    </Form.List>
                </div>
            </Form>
        </Card>
    );
};

export default VariantCard;
