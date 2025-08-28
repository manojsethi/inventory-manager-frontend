import { DeleteOutlined, MenuOutlined, StarOutlined } from '@ant-design/icons';
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
import { Button, Form, Input, Switch, Tooltip, Badge } from 'antd';
import React from 'react';
import { ATTRIBUTE_FIELD_TYPES, AttributeFieldType } from '../../constants/attributeConfigs';
import { renderAttributeField } from '../../utils/attributeFieldRenderer';

interface AttributeListProps {
    form: any;
    groupName: any;
    parentPath: (string | number)[];
    attributeFields: any[];
    addAttribute: (defaultValue?: any, insertIndex?: number) => void;
    removeAttribute: (index: number | number[]) => void;
    moveAttribute: (from: number, to: number) => void;
    forceUpdate: () => void;
}

interface SortableAttributeItemProps {
    attribute: any;
    attrIndex: number;
    groupName: any;
    parentPath: (string | number)[];
    form: any;
    removeAttribute: (index: number | number[]) => void;
    forceUpdate: () => void;
}

const SortableAttributeItem: React.FC<SortableAttributeItemProps> = ({
    attribute,
    attrIndex,
    groupName,
    parentPath,
    form,
    removeAttribute,
    forceUpdate
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: attribute?.id || `attr_${attrIndex}` });
    // Safety check for attribute object
    if (!attribute) {
        console.warn('SortableAttributeItem received null/undefined attribute');
        return null;
    }

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-start space-x-4 p-4 border rounded-lg ${attribute?.isDifferentiator
                ? 'border-blue-300 bg-blue-50 hover:bg-blue-100'
                : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
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
                    name={[attrIndex, 'label']}
                    noStyle
                >
                    <Input
                        placeholder="Enter label"
                        size="small"
                        style={{ height: '32px' }}
                        className="text-left"
                        suffix={
                            attribute?.isDifferentiator ? (
                                <Tooltip title="This is a key differentiator">
                                    <StarOutlined style={{ color: '#1890ff' }} />
                                </Tooltip>
                            ) : null
                        }
                    />
                </Form.Item>
            </div>
            <div className="flex-1">
                <div className="mb-2 text-left">
                    <span className="text-sm text-gray-600 font-semibold">Value</span>
                </div>
                <div className="form-item-wrapper text-left">
                    {attribute && renderAttributeField(
                        {
                            fieldType: attribute.fieldType,
                            displayName: attribute.label || ATTRIBUTE_FIELD_TYPES[attribute.fieldType as AttributeFieldType]
                        },
                        [attrIndex, 'value'],
                        [...parentPath, 'attributes']
                    )}
                </div>
            </div>
            <div className="flex-shrink-0 flex flex-col space-y-2">
                <div className="text-left">
                    <span className="text-sm text-gray-600 font-semibold flex items-center">
                        <StarOutlined className="mr-1" style={{ fontSize: '12px' }} />
                        Differentiator
                    </span>
                </div>
                <Form.Item
                    name={[attrIndex, 'isDifferentiator']}
                    valuePropName="checked"
                    noStyle
                    initialValue={attribute?.isDifferentiator || false}
                    className="flex justify-center"
                >
                    <Switch
                        size="small"
                        checkedChildren="Yes"
                        unCheckedChildren="No"
                        style={{ width: '50px', margin: '5px auto' }}
                    />
                </Form.Item>
                <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => {
                        removeAttribute(attrIndex);
                        forceUpdate(); // Force re-render to update the display
                    }}
                >
                    Remove
                </Button>
            </div>
        </div>
    );
};

const AttributeList: React.FC<AttributeListProps> = ({
    form,
    groupName,
    parentPath,
    attributeFields,
    addAttribute,
    removeAttribute,
    moveAttribute,
    forceUpdate
}) => {

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = attributeFields.findIndex((field) => field.key.toString() === active.id);
            const newIndex = attributeFields.findIndex((field) => field.key.toString() === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                // Use Form.List's move method
                moveAttribute(oldIndex, newIndex);
                forceUpdate();
            }
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={attributeFields.map((field) => field.key.toString())}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-3">
                    {attributeFields.map(({ key: attrKey, name: attrName, ...restAttrField }, attrIndex: number) => {
                        const attribute = form.getFieldValue([...parentPath, 'attributes', attrName]);
                        if (!attribute) {
                            console.warn(`Attribute not found for index ${attrName} in group ${groupName}`);
                            return null;
                        }

                        // Ensure isDifferentiator field exists
                        if (attribute.isDifferentiator === undefined) {
                            console.log('Initializing isDifferentiator for attribute:', attribute);
                            form.setFieldValue([...parentPath, 'attributes', attrName, 'isDifferentiator'], false);
                        }

                        return (
                            <SortableAttributeItem
                                key={attrKey}
                                attribute={attribute}
                                attrIndex={attrName}
                                groupName={groupName}
                                parentPath={parentPath}
                                form={form}
                                removeAttribute={removeAttribute}
                                forceUpdate={forceUpdate}
                            />
                        );
                    })}
                </div>
            </SortableContext>
        </DndContext>
    );
};

export default AttributeList;
