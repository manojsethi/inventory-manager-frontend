import React from 'react';
import { Form, Input, Select, Button } from 'antd';
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
                    <Select
                        placeholder="Add attribute"
                        size="small"
                        style={{ width: '200px' }}
                        value={null}
                        onSelect={(fieldType: string | null) => {
                            if (!fieldType) return;
                            const currentAttributes = form.getFieldValue(['attributeGroups', groupName, 'attributes']) || [];
                            const newAttribute = {
                                id: `attr_${Date.now()}`,
                                fieldType: fieldType as AttributeFieldType,
                                label: ATTRIBUTE_FIELD_TYPES[fieldType as AttributeFieldType],
                                value: ''
                            };
                            form.setFieldValue(['attributeGroups', groupName, 'attributes'], [...currentAttributes, newAttribute]);
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
                    <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeGroup(groupName)}
                    >
                        Remove Group
                    </Button>
                </div>
            </div>

            {/* Collapsible Attributes List */}
            {isExpanded && (
                <div className="p-4">
                    <AttributeList
                        form={form}
                        groupName={groupName}
                        forceUpdate={forceUpdate}
                    />
                </div>
            )}
        </div>
    );
};

export default SortableGroupItem;
