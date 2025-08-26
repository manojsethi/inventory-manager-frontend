import React from 'react';
import { Button, Input, Typography, Form } from 'antd';
import { DeleteOutlined, HolderOutlined } from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const { Text } = Typography;

interface SortableAttributeItemProps {
    attributeId: string;
    attribute: any;
    currentLabel: string;
    groupId: string;
    onLabelChange: (id: string, label: string) => void;
    onValueChange: (id: string, value: any) => void;
    onRemove: (id: string) => void;
    renderField: (attr: any, value: any, onChange: (value: any) => void) => React.ReactNode;
}

const SortableAttributeItem: React.FC<SortableAttributeItemProps> = ({
    attributeId,
    attribute,
    currentLabel,
    groupId,
    onLabelChange,
    onValueChange,
    onRemove,
    renderField
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: attributeId });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 1 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-start space-x-4 p-4 border border-gray-200 rounded-lg bg-white text-left ${isDragging ? 'shadow-lg' : ''}`}
        >
            <div className="flex-shrink-0 cursor-move" {...attributes} {...listeners}>
                <HolderOutlined className="text-gray-400 hover:text-gray-600" />
            </div>
            <div className="flex-shrink-0 w-40">
                <div className="mb-2 text-left">
                    <Text strong className="text-sm text-gray-600 text-left">Label</Text>
                </div>
                <Input
                    placeholder="Enter label"
                    size="small"
                    style={{ height: '32px' }}
                    className="text-left"
                    value={currentLabel}
                    onChange={(e) => onLabelChange(attributeId, e.target.value)}
                />
            </div>
            <div className="flex-1">
                <div className="mb-2 text-left">
                    <Text strong className="text-sm text-gray-600 text-left">Value</Text>
                </div>
                <div className="form-item-wrapper text-left">
                    {renderField(attribute, attribute.value || '', (value) => onValueChange(attributeId, value))}
                </div>
            </div>
            <div className="flex-shrink-0 pt-6">
                <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => onRemove(attributeId)}
                >
                    Remove
                </Button>
            </div>
        </div>
    );
};

export default SortableAttributeItem;
