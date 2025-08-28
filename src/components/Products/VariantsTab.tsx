import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, message } from 'antd';
import { PlusOutlined, StarOutlined } from '@ant-design/icons';
import VariantCard from './VariantCard';
import { productService } from '../../services';

const { Title, Text } = Typography;

interface VariantsTabProps {
    productId: string | null;
    productVariants: any[];
    onVariantsUpdate: () => void;
}

const VariantsTab: React.FC<VariantsTabProps> = ({
    productId,
    productVariants,
    onVariantsUpdate
}) => {
    const [processingVariant, setProcessingVariant] = useState<number | null>(null);
    const [expandedVariantIndex, setExpandedVariantIndex] = useState<number | null>(null);
    const [variants, setVariants] = useState<any[]>(productVariants);
    const [hasUnsavedVariant, setHasUnsavedVariant] = useState<boolean>(false);

    // Update hasUnsavedVariant when variants change
    useEffect(() => {
        const hasUnsaved = variants.some(variant => !variant._id);
        setHasUnsavedVariant(hasUnsaved);
    }, [variants]);

    // Helper function to check for duplicate variants based on differentiator attributes
    const checkForDuplicateVariants = (variantData: any, currentVariantIndex: number): boolean => {
        const currentDifferentiators = getDifferentiatorAttributes(variantData);

        // Check against all other variants
        for (let i = 0; i < variants.length; i++) {
            if (i === currentVariantIndex) continue; // Skip current variant

            const otherVariant = variants[i];
            const otherDifferentiators = getDifferentiatorAttributes(otherVariant);

            // Check if all differentiator attributes match
            if (areDifferentiatorsEqual(currentDifferentiators, otherDifferentiators)) {
                return true; // Duplicate found
            }
        }

        return false; // No duplicate found
    };

    // Helper function to extract differentiator attributes from variant data
    const getDifferentiatorAttributes = (variantData: any): any[] => {
        const differentiators: any[] = [];
        const attributeGroups = variantData.attributeGroups || [];

        attributeGroups.forEach((group: any) => {
            if (group.attributes) {
                group.attributes.forEach((attr: any) => {
                    if (attr.isDifferentiator) {
                        differentiators.push({
                            label: attr.label,
                            value: attr.value,
                            groupName: group.name
                        });
                    }
                });
            }
        });

        return differentiators;
    };

    // Helper function to compare differentiator attributes
    const areDifferentiatorsEqual = (diff1: any[], diff2: any[]): boolean => {
        if (diff1.length !== diff2.length) return false;

        // Sort both arrays by label for consistent comparison
        const sortedDiff1 = [...diff1].sort((a, b) => a.label.localeCompare(b.label));
        const sortedDiff2 = [...diff2].sort((a, b) => a.label.localeCompare(b.label));

        return sortedDiff1.every((attr, index) => {
            const otherAttr = sortedDiff2[index];
            return attr.label === otherAttr.label &&
                JSON.stringify(attr.value) === JSON.stringify(otherAttr.value);
        });
    };

    // Helper function to check if all variants have the same differentiator attributes
    const checkDifferentiatorConsistency = (variantData: any, currentVariantIndex: number): { isValid: boolean; missingAttributes: string[] } => {
        const currentDifferentiators = getDifferentiatorAttributes(variantData);
        const missingAttributes: string[] = [];

        // Get all differentiator labels from current variant
        const currentDifferentiatorLabels = currentDifferentiators.map(d => d.label);

        // Check against all other variants
        for (let i = 0; i < variants.length; i++) {
            if (i === currentVariantIndex) continue; // Skip current variant

            const otherVariant = variants[i];
            const otherDifferentiators = getDifferentiatorAttributes(otherVariant);
            const otherDifferentiatorLabels = otherDifferentiators.map(d => d.label);

            // Find missing differentiator attributes in current variant
            otherDifferentiatorLabels.forEach(label => {
                if (!currentDifferentiatorLabels.includes(label)) {
                    missingAttributes.push(label);
                }
            });

            // Find missing differentiator attributes in other variants
            currentDifferentiatorLabels.forEach(label => {
                if (!otherDifferentiatorLabels.includes(label)) {
                    missingAttributes.push(label);
                }
            });
        }

        return {
            isValid: missingAttributes.length === 0,
            missingAttributes: Array.from(new Set(missingAttributes)) // Remove duplicates
        };
    };

    // Helper function to get all differentiator attributes across all variants
    const getAllDifferentiatorAttributes = (): string[] => {
        const allDifferentiators = new Set<string>();

        variants.forEach(variant => {
            const differentiators = getDifferentiatorAttributes(variant);
            differentiators.forEach(diff => {
                allDifferentiators.add(diff.label);
            });
        });

        return Array.from(allDifferentiators);
    };

    // Handle expanding/collapsing variants
    const handleVariantToggle = (variantIndex: number) => {
        if (expandedVariantIndex === variantIndex) {
            // Collapse the currently expanded variant
            setExpandedVariantIndex(null);
        } else {
            // Expand the clicked variant and collapse others
            setExpandedVariantIndex(variantIndex);
        }
    };

    // Handle variant save
    const handleVariantSave = async (variantData: any, variantIndex: number) => {
        if (!productId) {
            message.error('Please save basic product details first');
            return;
        }

        // Check if another variant is being processed
        if (processingVariant !== null && processingVariant !== variantIndex) {
            message.warning('Please complete the current variant operation first');
            return;
        }

        // Check for duplicate variants based on differentiator attributes
        if (checkForDuplicateVariants(variantData, variantIndex)) {
            message.error('A variant with the same differentiator attributes already exists. Please modify the differentiator values to make this variant unique.');
            return;
        }

        // Check for differentiator attribute consistency across all variants
        const consistencyCheck = checkDifferentiatorConsistency(variantData, variantIndex);
        if (!consistencyCheck.isValid) {
            message.error(`Differentiator attributes must be consistent across all variants. Missing attributes: ${consistencyCheck.missingAttributes.join(', ')}. Please ensure all variants have the same differentiator attributes.`);
            return;
        }

        try {
            setProcessingVariant(variantIndex);

            // Images are now handled inside VariantCard, so variantData already includes images
            const variantDataWithImages = variantData;

            if (variantIndex >= 0 && variants[variantIndex]?._id) {
                await productService.updateVariant(productId, variants[variantIndex]._id, variantDataWithImages);
                message.success('Variant updated successfully');
                onVariantsUpdate();
            } else {
                // Add new variant
                await productService.addVariant(productId, variantDataWithImages);
                onVariantsUpdate();
                message.success('Variant added successfully');
            }
        } catch (error) {
            message.error('Failed to save variant');
        } finally {
            setProcessingVariant(null);
        }
    };

    // Handle variant delete
    const handleVariantDelete = async (variantId: string) => {
        // Check if another variant is being processed
        if (processingVariant !== null) {
            message.warning('Please complete the current variant operation first');
            return;
        }

        try {
            const variantIndex = variants.findIndex(v => v._id === variantId || v.id === variantId);
            if (variantIndex === -1) {
                message.error('Variant not found');
                return;
            }

            setProcessingVariant(variantIndex);
            const variant = variants[variantIndex];

            if (variant._id && productId) {
                // Delete saved variant from backend
                await productService.deleteVariant(productId, variant._id);
                onVariantsUpdate();
                message.success('Variant deleted successfully');
            } else {
                // Remove unsaved variant from client-side state
                setVariants(variants.filter(v => v.id !== variant.id));
                message.success('Unsaved variant removed');
            }
        } catch (error) {
            message.error('Failed to delete variant');
        } finally {
            setProcessingVariant(null);
        }
    };

    // Handle adding new variant
    const handleAddNewVariant = () => {
        // Check if there's already an unsaved variant
        if (hasUnsavedVariant) {
            message.warning('Please save the current variant before adding a new one');
            return;
        }

        // Check if another variant is being processed
        if (processingVariant !== null) {
            message.warning('Please complete the current variant operation first');
            return;
        }

        setVariants([...variants, {
            id: `temp_${Date.now()}`,
            name: '',
            price: 0,
            costPrice: 0,
            images: [],
            attributeGroups: []
        }]);
    };

    // Handle variant clone (frontend only)
    const handleVariantClone = (variantId: string) => {
        // Check if there's already an unsaved variant
        if (hasUnsavedVariant) {
            message.warning('Please save the current variant before cloning another one');
            return;
        }

        // Check if another variant is being processed
        if (processingVariant !== null) {
            message.warning('Please complete the current variant operation first');
            return;
        }

        const variantToClone = variants.find(v => v._id === variantId);
        if (!variantToClone) {
            message.error('Variant not found');
            return;
        }
        // Create a deep copy of the variant
        const clonedVariant = {
            ...variantToClone,
            sku: undefined,
            _id: undefined, // Remove the _id so it's treated as a new variant
            id: `temp_${Date.now()}`,
            name: `${variantToClone.name} (Copy)`,
            images: [...(variantToClone.images || [])],
            attributeGroups: variantToClone.attributeGroups ?
                JSON.parse(JSON.stringify(variantToClone.attributeGroups)) : [],
        };

        const newVariants = [...variants, clonedVariant];
        const clonedVariantIndex = newVariants.length - 1;
        setVariants(newVariants);
        // Set the cloned variant to be expanded
        setExpandedVariantIndex(clonedVariantIndex);
        message.success('Variant cloned successfully');
    };

    return (
        <div className="space-y-6">

            <>
                <div className="flex justify-between items-center">
                    <Title level={4}>Product Variants</Title>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddNewVariant}
                        disabled={processingVariant !== null || hasUnsavedVariant}
                    >
                        Add New Variant
                    </Button>
                </div>

                {/* Differentiator Summary */}
                {variants.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <StarOutlined className="text-blue-600 mr-2" />
                                <span className="text-blue-800 font-medium">Differentiator Summary:</span>
                            </div>
                            <div className="text-sm text-blue-700">
                                {variants.reduce((total, variant) => {
                                    const differentiatorCount = (variant.attributeGroups || []).reduce((sum: number, group: any) => {
                                        return sum + (group.attributes?.filter((attr: any) => attr.isDifferentiator)?.length || 0);
                                    }, 0);
                                    return total + differentiatorCount;
                                }, 0)} total differentiator attributes across {variants.length} variant{variants.length !== 1 ? 's' : ''}
                            </div>
                        </div>
                        {/* Consistency Warning */}
                        {(() => {
                            const allDifferentiators = getAllDifferentiatorAttributes();
                            const consistencyIssues = variants.map((variant, index) => {
                                const variantDifferentiators = getDifferentiatorAttributes(variant);
                                const variantDifferentiatorLabels = variantDifferentiators.map(d => d.label);
                                const missing = allDifferentiators.filter(label => !variantDifferentiatorLabels.includes(label));
                                return { variantIndex: index, missing };
                            }).filter(issue => issue.missing.length > 0);

                            if (consistencyIssues.length > 0) {
                                return (
                                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                        <div className="text-xs text-yellow-800 font-medium">
                                            ⚠️ Differentiator Consistency Issues:
                                        </div>
                                        <div className="text-xs text-yellow-700 mt-1">
                                            {consistencyIssues.map(issue => (
                                                <div key={issue.variantIndex}>
                                                    Variant {issue.variantIndex + 1}: Missing {issue.missing.join(', ')}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })()}
                    </div>
                )}
                {hasUnsavedVariant && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                        <Text className="text-orange-700">
                            ⚠️ You have an unsaved variant. Please save it before adding a new one.
                        </Text>
                    </div>
                )}
                {variants.length === 0 ? (
                    <Card>
                        <div className="text-center py-8 text-gray-500">
                            <Text>No variants added yet. Click "Add New Variant" to start.</Text>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {variants.map((variant, index) => {
                            return (
                                <VariantCard
                                    key={variant._id || variant.id}
                                    variant={variant}
                                    variantIndex={index}
                                    onSave={handleVariantSave}
                                    onDelete={handleVariantDelete}
                                    onClone={handleVariantClone}
                                    isProcessing={processingVariant === index}
                                    isUnsaved={!variant._id}
                                    isCollapsed={expandedVariantIndex !== index}
                                    onToggleCollapse={() => handleVariantToggle(index)}
                                />
                            )
                        })}
                    </div>
                )}
            </>

        </div>
    );
};

export default VariantsTab;
