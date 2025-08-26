import React from 'react';
import { Card, Typography } from 'antd';
import { getAvailableAttributes } from '../../utils';

const { Text } = Typography;

interface DifferentiatorSummaryProps {
    variants: any[];
}

const DifferentiatorSummary: React.FC<DifferentiatorSummaryProps> = ({
    variants
}) => {
    const availableAttributes = getAvailableAttributes();

    // Calculate differentiators from variants
    const calculateDifferentiators = () => {
        const attributeValueMap: { [attributeId: string]: Set<string> } = {};

        // Collect all attribute values across variants
        variants.forEach(variant => {
            if (variant.attributeGroups) {
                variant.attributeGroups.forEach((group: any) => {
                    group.attributes.forEach((attr: any) => {
                        if (!attributeValueMap[attr.id]) {
                            attributeValueMap[attr.id] = new Set();
                        }
                        if (attr.value) {
                            attributeValueMap[attr.id].add(String(attr.value));
                        }
                    });
                });
            }
        });

        // Attributes with multiple different values are differentiators
        return Object.keys(attributeValueMap).filter(
            attrId => attributeValueMap[attrId].size > 1
        );
    };

    const differentiatorAttributes = calculateDifferentiators();

    if (differentiatorAttributes.length === 0) {
        return null;
    }

    return (
        <Card title="Differentiator Summary" className="mb-6">
            <div className="space-y-4">
                <div>
                    <Text strong>Differentiator Attributes:</Text>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {differentiatorAttributes.map(attributeId => {
                            const attribute = availableAttributes.find(attr => attr._id === attributeId);
                            return (
                                <div key={attributeId} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                    {attribute?.displayName || attributeId}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <Text type="secondary" className="text-sm">
                        These attributes have different values across variants and are automatically detected as differentiators.
                    </Text>
                </div>
            </div>
        </Card>
    );
};

export default DifferentiatorSummary;
