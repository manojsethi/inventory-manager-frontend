import React from 'react';
import AttributeItem from './AttributeItem';

interface AttributeItemListProps {
    form: any;
    variantIndex: number;
    groupName: string;
    forceUpdate: (value?: any) => void;
}

const AttributeItemList: React.FC<AttributeItemListProps> = ({
    form,
    variantIndex,
    groupName,
    forceUpdate
}) => {
    const attributes = form.getFieldValue(['variants', variantIndex, 'attributeGroups', groupName, 'attributes']) || [];

    return (
        <div className="space-y-3">
            {attributes.map((attribute: any, attrIndex: number) => (
                <AttributeItem
                    key={attribute.id}
                    attribute={attribute}
                    attrIndex={attrIndex}
                    variantIndex={variantIndex}
                    groupName={groupName}
                    form={form}
                    forceUpdate={forceUpdate}
                />
            ))}
        </div>
    );
};

export default AttributeItemList;
