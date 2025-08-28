import React from 'react';
import { Form } from 'antd';
import ImageWithFallback from '../Common/ImageWithFallback';

interface VariantSummaryProps {
    variant: any;
    images: string[];
}

const VariantSummary: React.FC<VariantSummaryProps> = ({ variant, images }) => {
    const [form] = Form.useForm();

    // Helper function to format attribute value for display
    const formatAttributeValue = (value: any): string => {
        if (!value) return 'Not set';

        // If value is an object (like for number_with_unit fields)
        if (typeof value === 'object' && value !== null) {
            if (value.value !== undefined && value.unit !== undefined) {
                return `${value.value} ${value.unit}`;
            }
            if (value.unitType && value.unit) {
                return `${value.value || '0'} ${value.unit}`;
            }
            // For other object types, try to stringify
            return JSON.stringify(value);
        }

        // If value is a string or number, return as is
        return String(value);
    };

    // Generate summary for the variant
    const getVariantSummary = () => {
        const name = form.getFieldValue('name') || variant.name || 'Unnamed Variant';
        const price = form.getFieldValue('price') || variant.price || 0;
        const costPrice = form.getFieldValue('costPrice') || variant.costPrice || 0;
        const imageCount = images.length;
        const attributeGroups = form.getFieldValue('attributeGroups') || variant.attributeGroups || [];
        const totalAttributes = attributeGroups.reduce((sum: number, group: any) => sum + (group.attributes?.length || 0), 0);

        // Get differentiator attributes
        const differentiatorAttributes = attributeGroups.reduce((acc: any[], group: any) => {
            const groupDifferentiators = group.attributes?.filter((attr: any) => attr.isDifferentiator) || [];
            return [...acc, ...groupDifferentiators.map((attr: any) => ({
                label: attr.label,
                value: attr.value,
                formattedValue: formatAttributeValue(attr.value),
                groupName: group.name
            }))];
        }, []);

        // Get all attributes organized by groups
        const attributesByGroup = attributeGroups.map((group: any) => ({
            groupName: group.name,
            attributes: group.attributes?.map((attr: any) => ({
                label: attr.label,
                value: attr.value,
                formattedValue: formatAttributeValue(attr.value),
                isDifferentiator: attr.isDifferentiator
            })) || []
        })).filter((group: any) => group.attributes.length > 0);

        return {
            name,
            price: `₹${price}`,
            costPrice: `₹${costPrice}`,
            imageCount,
            totalAttributes,
            differentiatorAttributes,
            attributesByGroup,
            sku: variant.sku || 'No SKU'
        };
    };

    const summary = getVariantSummary();
    return (
        <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start space-x-4">
                {/* First Image with Count Below */}
                {images.length > 0 && (
                    <div className="flex flex-col items-center flex-shrink-0">
                        <ImageWithFallback
                            src={images[0]}
                            alt="First Image"
                            className="w-full h-full object-cover rounded"
                        />
                        {images.length > 1 && (
                            <div className="mt-1 text-xs text-gray-600 font-semibold text-center">
                                {images.length} images
                            </div>
                        )}
                    </div>
                )}

                {/* Variant Info */}
                <div className="flex-1 min-w-0">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                            <span className="font-semibold text-gray-600">Name:</span>
                            <div className="text-gray-800">{summary.name}</div>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-600">Price:</span>
                            <div className="text-gray-800">{summary.price}</div>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-600">Attributes:</span>
                            <div className="text-gray-800">{summary.totalAttributes} attribute{summary.totalAttributes !== 1 ? 's' : ''}</div>
                        </div>
                    </div>

                    <div className="mb-2 text-xs text-gray-500">
                        SKU: {summary.sku}
                    </div>

                    {/* Attributes by Group */}
                    {summary.attributesByGroup.length > 0 && (
                        <div className="space-y-2">
                            {summary.attributesByGroup.map((group: any, groupIndex: number) => (
                                <div key={groupIndex} className="border border-gray-200 rounded-lg p-2 bg-white">
                                    <div className="text-xs font-semibold text-gray-700 mb-1">
                                        {group.groupName}
                                    </div>
                                    <div className="space-y-1">
                                        {group.attributes.map((attr: any, attrIndex: number) => (
                                            <div key={attrIndex} className="flex justify-between items-center text-xs">
                                                <span className="text-gray-600 flex items-center">
                                                    {attr.label}
                                                    {attr.isDifferentiator && (
                                                        <span className="ml-1 text-blue-500">★</span>
                                                    )}
                                                </span>
                                                <span className="text-gray-800 font-medium">
                                                    {attr.formattedValue}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VariantSummary;
