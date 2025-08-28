import React from 'react';
import { Form, Input, Select, Button, Popconfirm } from 'antd';
import { DeleteOutlined, MenuOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AttributeFieldType, ATTRIBUTE_FIELD_TYPES } from '../../constants/attributeConfigs';
import AttributeList from './AttributeList';

interface SortableGroupItemProps {
    form: any;
    groupKey: any;
    groupName: any;
    restGroupField: any;
    removeGroup: (groupName: any) => void;
    forceUpdate: () => void;
    isExpanded: boolean;
    onToggleExpand: (groupName: any) => void;
}

const SortableGroupItem: React.FC<SortableGroupItemProps> = ({
    form,
    groupKey,
    groupName,
    restGroupField,
    removeGroup,
    forceUpdate,
    isExpanded,
    onToggleExpand
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: groupKey.toString() });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="border border-blue-200 rounded-lg bg-blue-50"
        >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-100">
                <div className="flex items-center space-x-2 flex-1">
                    {/* Drag Handle */}
                    <Button
                        type="text"
                        size="small"
                        icon={<MenuOutlined />}
                        className="cursor-move text-gray-400 hover:text-gray-600"
                        {...attributes}
                        {...listeners}
                    />
                    {/* Expand/Collapse Button */}
                    <Button
                        type="text"
                        size="small"
                        icon={isExpanded ? <DownOutlined /> : <RightOutlined />}
                        onClick={() => onToggleExpand(groupName)}
                        className="p-0 h-auto"
                    />
                    <Form.Item
                        {...restGroupField}
                        name={[groupName, 'name']}
                        noStyle
                    >
                        <Input
                            placeholder="Group name"
                            size="small"
                            style={{ width: '200px', fontWeight: '600' }}
                            className="border-none bg-white focus:bg-white"
                        />
                    </Form.Item>
                    <span className="text-xs text-gray-500">
                        ({form.getFieldValue(['attributeGroups', groupName, 'attributes'])?.length || 0} attributes)
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    <Form.List name={[groupName, 'attributes']}>
                        {(attributeFields, { add: addAttribute }) => (
                            <Select
                                placeholder="Add attribute"
                                size="small"
                                style={{ width: '200px' }}
                                value={null}
                                onSelect={(fieldType: string | null) => {
                                    if (!fieldType) return;
                                    const newAttribute = {
                                        id: `attr_${Date.now()}`,
                                        fieldType: fieldType as AttributeFieldType,
                                        label: ATTRIBUTE_FIELD_TYPES[fieldType as AttributeFieldType],
                                        value: '',
                                        isDifferentiator: false
                                    };
                                    addAttribute(newAttribute);
                                    forceUpdate(); // Force re-render to show the new attribute
                                }}
                                allowClear
                            >
                                {Object.entries(ATTRIBUTE_FIELD_TYPES).map(([key, label]) => (
                                    <Select.Option key={key} value={key}>
                                        {label}
                                    </Select.Option>
                                ))}
                            </Select>
                        )}
                    </Form.List>
                    <Popconfirm
                        title="Remove Attribute Group"
                        description="Are you sure you want to remove this attribute group? This will also remove all attributes within the group."
                        onConfirm={() => removeGroup(groupName)}
                        okText="Yes, Remove"
                        cancelText="Cancel"
                        okType="danger"
                    >
                        <Button
                            type="text"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                        >
                            Remove Group
                        </Button>
                    </Popconfirm>
                </div>
            </div>

            {/* Collapsible Attributes List */}
            {isExpanded && (
                <div className="p-4">
                    <Form.List name={[groupName, 'attributes']}>
                        {(attributeFields, { add: addAttribute, remove: removeAttribute, move: moveAttribute }) => (
                            <AttributeList
                                form={form}
                                groupName={groupName}
                                attributeFields={attributeFields}
                                addAttribute={addAttribute}
                                removeAttribute={removeAttribute}
                                moveAttribute={moveAttribute}
                                forceUpdate={forceUpdate}
                                parentPath={['attributeGroups', groupName]}
                            />
                        )}
                    </Form.List>
                </div>
            )}
        </div>
    );
};

export default SortableGroupItem;
