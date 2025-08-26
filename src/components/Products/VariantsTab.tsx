import React, { useState } from 'react';
import { Card, Button, Typography, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import VariantCard from './VariantCard';
import { productService } from '../../services';

const { Title, Text } = Typography;

interface VariantsTabProps {
    productSaved: boolean;
    productId: string | null;
    variants: any[];
    onVariantsChange: (variants: any[]) => void;
    onAddNewVariant: () => void;
}

const VariantsTab: React.FC<VariantsTabProps> = ({
    productSaved,
    productId,
    variants,
    onVariantsChange,
    onAddNewVariant
}) => {
    const [processingVariant, setProcessingVariant] = useState<number | null>(null);

    // Check if there are any unsaved variants (variants without SKU)
    const hasUnsavedVariant = variants.some(variant => !variant.sku);

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

        try {
            setProcessingVariant(variantIndex);

            // Images are now handled inside VariantCard, so variantData already includes images
            const variantDataWithImages = variantData;

            if (variantIndex >= 0 && variants[variantIndex]?.sku) {
                // Update existing variant using SKU
                await productService.updateVariant(productId, variants[variantIndex].sku, variantDataWithImages);
                message.success('Variant updated successfully');
            } else {
                // Add new variant
                const updatedProduct = await productService.addVariant(productId, variantDataWithImages);
                onVariantsChange(updatedProduct.variants || []);
                message.success('Variant added successfully');
            }
        } catch (error) {
            message.error('Failed to save variant');
        } finally {
            setProcessingVariant(null);
        }
    };

    // Handle variant delete
    const handleVariantDelete = async (variantSku: string) => {
        if (!productId) return;

        // Check if another variant is being processed
        if (processingVariant !== null) {
            message.warning('Please complete the current variant operation first');
            return;
        }

        try {
            const variantIndex = variants.findIndex(v => v.sku === variantSku);
            setProcessingVariant(variantIndex);

            await productService.deleteVariant(productId, variantSku);
            onVariantsChange(variants.filter(v => v.sku !== variantSku));
            message.success('Variant deleted successfully');
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

        onAddNewVariant();
    };

    // Handle variant clone (frontend only)
    const handleVariantClone = (variantSku: string) => {
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

        const variantToClone = variants.find(v => v.sku === variantSku);
        if (!variantToClone) {
            message.error('Variant not found');
            return;
        }

        // Create a deep copy of the variant
        const clonedVariant = {
            ...variantToClone,
            sku: undefined, // Remove the SKU so it's treated as a new variant
            id: `temp_${Date.now()}`,
            name: `${variantToClone.name} (Copy)`,
            images: [...(variantToClone.images || [])],
            attributeGroups: variantToClone.attributeGroups ?
                JSON.parse(JSON.stringify(variantToClone.attributeGroups)) : []
        };

        onVariantsChange([...variants, clonedVariant]);
        message.success('Variant cloned successfully');
    };

    return (
        <div className="space-y-6">
            {!productSaved ? (
                <Card>
                    <div className="text-center py-8 text-gray-500">
                        <Text>Please save the basic product details first to manage variants.</Text>
                    </div>
                </Card>
            ) : (
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
                            {variants.map((variant, index) => (
                                <VariantCard
                                    key={variant.sku || variant.id}
                                    variant={variant}
                                    variantIndex={index}
                                    onSave={handleVariantSave}
                                    onDelete={handleVariantDelete}
                                    onClone={handleVariantClone}
                                    onVariantChange={(variantIndex, updatedVariant) => {
                                        const updatedVariants = [...variants];
                                        updatedVariants[variantIndex] = updatedVariant;
                                        onVariantsChange(updatedVariants);
                                    }}
                                    isProcessing={processingVariant === index}
                                    isUnsaved={!variant.sku}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default VariantsTab;
