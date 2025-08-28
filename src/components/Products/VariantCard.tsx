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
    verticalListSortingStrategy,
    useSortable,
    arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Card, Col, Form, Input, InputNumber, message, Row, Space, Upload, Collapse, Popconfirm } from 'antd';
import { DownOutlined, RightOutlined, EditOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import SortableGroupItem from './SortableGroupItem';
import { uploadService, ImageType } from '../../services/uploadService';
import ImageWithFallback from '../Common/ImageWithFallback';
import VariantSummary from './VariantSummary';

const { TextArea } = Input;

// Sortable Image Item Component
const SortableImageItem: React.FC<{
    url: string;
    index: number;
    onRemove: () => void;
}> = ({ url, index, onRemove }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: `image-${index}` });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative group"
        >
            <div
                {...attributes}
                {...listeners}
                className="cursor-move"
            >
                <ImageWithFallback
                    src={url}
                    size="large"
                    alt={`Image ${index + 1}`}
                    className="w-full h-20 object-cover rounded border border-gray-200"
                />
            </div>
            <Popconfirm
                title="Remove Image"
                description="Are you sure you want to remove this image?"
                onConfirm={() => onRemove()}
                okText="Yes, Remove"
                cancelText="Cancel"
                okType="danger"
                placement="topRight"
            >
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors z-10"
                    style={{ zIndex: 1000 }}
                >
                    ×
                </button>
            </Popconfirm>
        </div>
    );
};

interface VariantCardProps {
    variant: any;
    variantIndex: number;
    onSave: (variantData: any, variantIndex: number) => Promise<void>;
    onDelete: (variantId: string) => Promise<void>;
    onClone: (variantId: string) => void;
    isProcessing?: boolean;
    isUnsaved?: boolean;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
    onCheckDuplicate?: (variantData: any, variantIndex: number) => boolean;
}

const VariantCard: React.FC<VariantCardProps> = ({
    variant,
    variantIndex,
    onSave,
    onDelete,
    onClone,
    isProcessing = false,
    isUnsaved = false,
    isCollapsed = true,
    onToggleCollapse,
    onCheckDuplicate
}) => {
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [form] = Form.useForm();
    const [, forceUpdate] = useState({});
    const [expandedGroup, setExpandedGroup] = useState<any>(null);
    const [images, setImages] = useState<string[]>(variant.images || []);
    const [isDuplicate, setIsDuplicate] = useState(false);

    // Initialize form with variant data (excluding images)
    React.useEffect(() => {
        if (variant) {
            form.setFieldsValue({
                name: variant.name || '',
                price: variant.price || 0,
                costPrice: variant.costPrice || 0,
                description: variant.description || '',
                attributeGroups: variant.attributeGroups || []
            });
            setImages(variant.images || []);
        }
    }, [variant, form]);

    // Check for duplicates when form values change
    React.useEffect(() => {
        if (onCheckDuplicate && !isCollapsed) {
            const checkDuplicate = () => {
                const formValues = form.getFieldsValue();
                const completeVariantData = {
                    ...formValues,
                    images: images
                };
                const duplicate = onCheckDuplicate(completeVariantData, variantIndex);
                setIsDuplicate(duplicate);
            };

            // Debounce the check to avoid too many calls
            const timeoutId = setTimeout(checkDuplicate, 500);
            return () => clearTimeout(timeoutId);
        }
    }, [form.getFieldsValue(), images, isCollapsed, onCheckDuplicate, variantIndex]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );



    const handleSave = async () => {
        try {
            setSaving(true);
            const formValues = await form.validateFields();

            // Combine form values with images from state
            const completeVariantData = {
                ...formValues,
                images: images
            };

            await onSave(completeVariantData, variantIndex);
        } catch (error) {
            message.error('Failed to save variant');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (variant._id) {
            // Delete saved variant from backend
            try {
                await onDelete(variant._id);
                message.success('Variant deleted successfully');
            } catch (error) {
                message.error('Failed to delete variant');
            }
        } else {
            // Remove unsaved variant from client-side state
            try {
                await onDelete(variant.id);
                // message.success('Unsaved variant removed');
            } catch (error) {
                message.error('Failed to remove variant');
            }
        }
    };

    const handleClone = () => {
        onClone(variant._id || variant.id);
    };

    // Handle image upload for this variant
    const handleImageUpload = async (files: File | File[]) => {
        try {
            setUploading(true);

            const fileArray = Array.isArray(files) ? files : [files];

            // Check if adding these images would exceed the 5-image limit
            if (images.length + fileArray.length > 5) {
                message.error('Maximum 5 images allowed per variant');
                return false;
            }

            const uploadedImages = await uploadService.uploadMultiple(fileArray, ImageType.PRODUCT_VARIANTS);
            const imageUrls = uploadedImages.map(img => img.url);

            // Ensure we don't have duplicate URLs
            const uniqueImageUrls = imageUrls.filter((url, index, self) => self.indexOf(url) === index);

            // Update state with new images
            setImages(prevImages => [...prevImages, ...uniqueImageUrls]);

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
        setImages(prevImages => prevImages.filter((_, index) => index !== imageIndex));
    };

    // Handle image drag end for reordering
    const handleImageDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = parseInt(active.id.replace('image-', ''));
            const newIndex = parseInt(over.id.replace('image-', ''));

            console.log('Drag end:', { active: active.id, over: over.id, oldIndex, newIndex });

            setImages(prevImages => {
                const newImages = arrayMove(prevImages, oldIndex, newIndex);
                console.log('New images order:', newImages);
                return newImages;
            });
            forceUpdate({});
        }
    };



    return (
        <Card
            title={
                <div className="flex justify-between items-center w-full">
                    <div className="flex items-center space-x-2">
                        <Button
                            type="text"
                            size="small"
                            onClick={onToggleCollapse}
                            className="text-gray-500 hover:text-gray-700"
                            icon={isCollapsed ? <RightOutlined /> : <DownOutlined />}
                        />
                        <span>Variant {variantIndex + 1}</span>
                        {isProcessing && <span className="text-blue-500">(Processing...)</span>}
                        {isUnsaved && <span className="text-orange-500">(Unsaved)</span>}
                    </div>
                </div>
            }
            styles={{
                body: {
                    padding: isCollapsed ? '0' : ''
                }
            }}
            className={`text-left ${isProcessing ? 'opacity-75' : ''} ${isUnsaved ? 'border-orange-300' : ''}`}
            extra={
                <Space>
                    <Button
                        type="primary"
                        icon={isCollapsed ? <EditOutlined /> : <SaveOutlined />}
                        onClick={isCollapsed ? onToggleCollapse : handleSave}
                        loading={saving}
                        disabled={isProcessing}
                    >
                        {isCollapsed ? 'Edit' : 'Save'}
                    </Button>
                    {variant._id && (
                        <Button
                            icon={<CopyOutlined />}
                            onClick={handleClone}
                            disabled={isProcessing}
                        >
                            Clone
                        </Button>
                    )}
                    <Popconfirm
                        title="Delete Variant"
                        description={variant._id
                            ? "Are you sure you want to delete this variant? This action cannot be undone."
                            : "Are you sure you want to remove this unsaved variant?"
                        }
                        onConfirm={handleDelete}
                        okText="Yes, Delete"
                        cancelText="Cancel"
                        okType="danger"
                    >
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            disabled={isProcessing}
                        >
                            {variant._id ? 'Delete' : 'Remove'}
                        </Button>
                    </Popconfirm>
                </Space>
            }
        >
            {/* Summary when collapsed */}
            {isCollapsed && (
                <VariantSummary variant={variant} images={images} />
            )}

            {/* Full content when expanded */}
            {!isCollapsed && (
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
                    <div className="border border-gray-200 rounded-lg mb-4">
                        <div className="mb-4">
                            <span className="font-semibold">Images</span>
                        </div>
                        <div className="space-y-4">
                            {/* Images Display with Upload Button */}
                            <div>
                                <div className="mb-2 text-sm text-gray-600">Drag to reorder images:</div>
                                <div className="flex flex-wrap gap-2 items-start">
                                    {/* Upload Button */}
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
                                        fileList={[]}
                                        listType="picture-card"
                                        maxCount={5}
                                        multiple
                                    >
                                        <div>
                                            <UploadOutlined />
                                            <div style={{ marginTop: 8 }}>Upload</div>
                                        </div>
                                    </Upload>

                                    {/* Sortable Images Display */}
                                    {images.length > 0 && (
                                        <DndContext
                                            sensors={sensors}
                                            collisionDetection={closestCenter}
                                            onDragEnd={handleImageDragEnd}
                                        >
                                            <SortableContext
                                                items={images.map((_, index) => `image-${index}`)}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                <div className="flex flex-wrap gap-4">
                                                    {images.map((url, index) => (
                                                        <SortableImageItem
                                                            key={`image-${index}`}
                                                            url={url}
                                                            index={index}
                                                            onRemove={() => handleImageRemove(index)}
                                                        />
                                                    ))}
                                                </div>
                                            </SortableContext>
                                        </DndContext>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Attributes Section */}
                    <div className="border border-gray-200 rounded-lg mb-4">
                        <div className="mb-4">
                            <span className="font-semibold">Attributes</span>
                        </div>
                        <Form.List name="attributeGroups">
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
            )}
        </Card>
    );
};

export default VariantCard;
