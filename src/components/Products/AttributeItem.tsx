import React from 'react';
import { Form, Input, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { renderAttributeField } from '../../utils/attributeFieldRenderer';
import { ATTRIBUTE_FIELD_TYPES } from '../../constants/attributeConfigs';

interface AttributeItemProps {
    attribute: any;
    attrIndex: number;
    variantIndex: number;
    groupName: string;
    form: any;
    forceUpdate: (value?: any) => void;
}

const AttributeItem: React.FC<AttributeItemProps> = ({
    attribute,
    attrIndex,
    variantIndex,
    groupName,
    form,
    forceUpdate
}) => {
    return (
        <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg bg-white">
            <div className="flex-shrink-0 w-40">
                <div className="mb-2 text-left">
                    <span className="text-sm text-gray-600 font-semibold">Label</span>
                </div>
                <Form.Item
                    name={['variants', variantIndex, 'attributeGroups', groupName, 'attributes', attrIndex, 'label']}
                    noStyle
                    initialValue={attribute.label}
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
                            displayName: attribute.label || ATTRIBUTE_FIELD_TYPES[attribute.fieldType as keyof typeof ATTRIBUTE_FIELD_TYPES]
                        },
                        ['variants', variantIndex, 'attributeGroups', groupName, 'attributes', attrIndex, 'value']
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
                        // Get current group data to preserve it
                        const currentGroup = form.getFieldValue(['variants', variantIndex, 'attributeGroups', groupName]) || {};
                        const currentAttributes = currentGroup.attributes || [];
                        const updatedAttributes = currentAttributes.filter((_: any, index: number) => index !== attrIndex);

                        // Update the entire group while preserving existing data
                        const updatedGroup = {
                            ...currentGroup,
                            attributes: updatedAttributes
                        };

                        form.setFieldValue(['variants', variantIndex, 'attributeGroups', groupName], updatedGroup);
                        forceUpdate({}); // Force re-render to update the display
                    }}
                >
                    Remove
                </Button>
            </div>
        </div>
    );
};

export default AttributeItem;
