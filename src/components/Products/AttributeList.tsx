import { DeleteOutlined, MenuOutlined } from '@ant-design/icons';
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Form, Input } from 'antd';
import React from 'react';
import { ATTRIBUTE_FIELD_TYPES, AttributeFieldType } from '../../constants/attributeConfigs';
import { renderAttributeField } from '../../utils/attributeFieldRenderer';

interface AttributeListProps {
    form: any;
    groupName: any;
    forceUpdate: () => void;
}

interface SortableAttributeItemProps {
    attribute: any;
    attrIndex: number;
    groupName: any;
    form: any;
    forceUpdate: () => void;
}

const SortableAttributeItem: React.FC<SortableAttributeItemProps> = ({
    attribute,
    attrIndex,
    groupName,
    form,
    forceUpdate
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: attribute.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50"
        >
            {/* Drag Handle */}
            <div className="flex-shrink-0 pt-6">
                <Button
                    type="text"
                    size="small"
                    icon={<MenuOutlined />}
                    className="cursor-move text-gray-400 hover:text-gray-600"
                    {...attributes}
                    {...listeners}
                />
            </div>
            <div className="flex-shrink-0 w-40">
                <div className="mb-2 text-left">
                    <span className="text-sm text-gray-600 font-semibold">Label</span>
                </div>
                <Form.Item
                    name={[groupName, 'attributes', attrIndex, 'label']}
                    noStyle
                >
                    <Input
                        placeholder="Enter label"
                        size="small"
                        style={{ height: '32px' }}
                        className="text-left"
                    />
                </Form.Item>
            </div>
            <div className="flex-1">
                <div className="mb-2 text-left">
                    <span className="text-sm text-gray-600 font-semibold">Value</span>
                </div>
                <div className="form-item-wrapper text-left">
                    {renderAttributeField(
                        {
                            fieldType: attribute.fieldType,
                            displayName: attribute.label || ATTRIBUTE_FIELD_TYPES[attribute.fieldType as AttributeFieldType]
                        },
                        [groupName, 'attributes', attrIndex, 'value']
                    )}
                </div>
            </div>
            <div className="flex-shrink-0 pt-6">
                <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => {
                        const currentAttributes = form.getFieldValue(['attributeGroups', groupName, 'attributes']) || [];
                        const updatedAttributes = currentAttributes.filter((_: any, index: number) => index !== attrIndex);
                        form.setFieldValue(['attributeGroups', groupName, 'attributes'], updatedAttributes);
                        forceUpdate(); // Force re-render to update the display
                    }}
                >
                    Remove
                </Button>
            </div>
        </div>
    );
};

const AttributeList: React.FC<AttributeListProps> = ({ form, groupName, forceUpdate }) => {
    const attributes = form.getFieldValue(['attributeGroups', groupName, 'attributes']) || [];

    // Initialize form with existing attributes if they exist
    React.useEffect(() => {
        const currentFormAttributes = form.getFieldValue(['attributeGroups', groupName, 'attributes']);
        if (attributes.length > 0 && (!currentFormAttributes || currentFormAttributes.length === 0)) {
            form.setFieldValue(['attributeGroups', groupName, 'attributes'], attributes);
        }
    }, [form, groupName, attributes]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = attributes.findIndex((attr: any) => attr.id === active.id);
            const newIndex = attributes.findIndex((attr: any) => attr.id === over.id);

            // Reorder the attributes array
            const newAttributes = arrayMove(attributes, oldIndex, newIndex);

            // Update the form with the new order
            form.setFieldValue(['attributeGroups', groupName, 'attributes'], newAttributes);

            // Force re-render to update the display
            forceUpdate();
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={attributes.map((attr: any) => attr.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-3">
                    {attributes.map((attribute: any, attrIndex: number) => (
                        <SortableAttributeItem
                            key={attribute.id}
                            attribute={attribute}
                            attrIndex={attrIndex}
                            groupName={groupName}
                            form={form}
                            forceUpdate={forceUpdate}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
};

export default AttributeList;
