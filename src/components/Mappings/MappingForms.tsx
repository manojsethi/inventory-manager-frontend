import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Select,
    Input,
    Button,
    message,
    Spin,
    Space,
} from 'antd';
import {
    supplierCategoryService,
    companyCategoryService,
    supplierCompanyService,
    categoryService,
    supplierService
} from '../../services';
import type { Category, Supplier } from '../../types';

const { TextArea } = Input;
const { Option } = Select;

interface MappingFormProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    mappingType: 'supplier-category' | 'company-category' | 'supplier-company';
    entityId: string;
    entityName: string;
    existingMapping?: any;
    existingMappings?: any[]; // Array of existing mappings to filter out
}

const MappingForms: React.FC<MappingFormProps> = ({
    visible,
    onCancel,
    onSuccess,
    mappingType,
    entityId,
    entityName,
    existingMapping,
    existingMappings = []
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [dataLoading, setDataLoading] = useState(false);

    const isEditing = !!existingMapping;

    useEffect(() => {
        if (visible) {
            fetchData();
            if (isEditing) {
                form.setFieldsValue({
                    notes: existingMapping.notes || '',
                    ...getInitialValues()
                });
            } else {
                form.resetFields();
            }
        }
    }, [visible, existingMapping]);

    const fetchData = async () => {
        try {
            setDataLoading(true);

            switch (mappingType) {
                case 'supplier-category':
                    const suppliersResponse = await supplierService.getAll();
                    setSuppliers(suppliersResponse.data);
                    break;
                case 'company-category':
                    const categories = await categoryService.getAll();
                    setCategories(categories);
                    break;
                case 'supplier-company':
                    const suppliersResponse2 = await supplierService.getAll();
                    setSuppliers(suppliersResponse2.data);
                    break;
            }
        } catch (err) {
            message.error('Failed to fetch data');
        } finally {
            setDataLoading(false);
        }
    };

    const getInitialValues = () => {
        if (!existingMapping) return {};

        switch (mappingType) {
            case 'supplier-category':
                return {
                    supplierId: existingMapping.supplierId._id
                };
            case 'company-category':
                return {
                    categoryId: existingMapping.categoryId._id
                };
            case 'supplier-company':
                return {
                    supplierId: existingMapping.supplierId._id,
                };
            default:
                return {};
        }
    };

    const getModalTitle = () => {
        const action = isEditing ? 'Edit' : 'Add';
        switch (mappingType) {
            case 'supplier-category':
                return `${action} Supplier for ${entityName}`;
            case 'company-category':
                return `${action} Company for ${entityName}`;
            case 'supplier-company':
                return `${action} Supplier for ${entityName}`;
            default:
                return 'Mapping';
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            setLoading(true);

            switch (mappingType) {
                case 'supplier-category':
                    if (isEditing) {
                        await supplierCategoryService.update(existingMapping._id, {
                            notes: values.notes
                        });
                    } else {
                        await supplierCategoryService.create({
                            supplierId: values.supplierId,
                            categoryId: entityId,
                            notes: values.notes
                        });
                    }
                    break;

                case 'company-category':
                    if (isEditing) {
                        await companyCategoryService.update(existingMapping._id, {
                            notes: values.notes
                        });
                    } else {
                        await companyCategoryService.create({
                            companyId: entityId,
                            categoryId: values.categoryId,
                            notes: values.notes
                        });
                    }
                    break;

                case 'supplier-company':
                    if (isEditing) {
                        await supplierCompanyService.update(existingMapping._id, {
                            isActive: values.isActive,
                            notes: values.notes
                        });
                    } else {
                        await supplierCompanyService.create({
                            supplierId: values.supplierId,
                            companyId: entityId,
                            isActive: values.isActive,
                            notes: values.notes
                        });
                    }
                    break;
            }

            message.success(`Mapping ${isEditing ? 'updated' : 'created'} successfully`);
            onSuccess();
            onCancel();
        } catch (err) {
            message.error(err instanceof Error ? err.message : 'Failed to save mapping');
        } finally {
            setLoading(false);
        }
    };

    const renderFormFields = () => {
        // Filter out already existing mappings
        const getFilteredSuppliers = () => {
            if (isEditing) return suppliers; // Show all when editing
            return suppliers.filter(supplier =>
                !existingMappings.some(mapping =>
                    mapping.supplierId?._id === supplier._id || mapping.supplierId === supplier._id
                )
            );
        };

        const getFilteredCategories = () => {
            if (isEditing) return categories; // Show all when editing
            return categories.filter(category =>
                !existingMappings.some(mapping =>
                    mapping.categoryId?._id === category._id || mapping.categoryId === category._id
                )
            );
        };

        switch (mappingType) {
            case 'supplier-category':
                const filteredSuppliers = getFilteredSuppliers();
                return (
                    <>
                        <Form.Item
                            name="supplierId"
                            label="Supplier"
                            rules={[{ required: true, message: 'Please select a supplier' }]}
                        >
                            <Select
                                placeholder={filteredSuppliers.length === 0 ? "No available suppliers to add" : "Select a supplier"}
                                loading={dataLoading}
                                disabled={isEditing || filteredSuppliers.length === 0}
                                notFoundContent={filteredSuppliers.length === 0 ? "All suppliers are already mapped" : "No suppliers found"}
                            >
                                {filteredSuppliers.map(supplier => (
                                    <Option key={supplier._id} value={supplier._id}>
                                        {supplier.name} - {supplier.contactPerson}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </>
                );

            case 'company-category':
                const filteredCategories = getFilteredCategories();
                return (
                    <>
                        <Form.Item
                            name="categoryId"
                            label="Category"
                            rules={[{ required: true, message: 'Please select a category' }]}
                        >
                            <Select
                                placeholder={filteredCategories.length === 0 ? "No available categories to add" : "Select a category"}
                                loading={dataLoading}
                                disabled={isEditing || filteredCategories.length === 0}
                                notFoundContent={filteredCategories.length === 0 ? "All categories are already mapped" : "No categories found"}
                            >
                                {filteredCategories.map(category => (
                                    <Option key={category._id} value={category._id}>
                                        {category.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </>
                );

            case 'supplier-company':
                const filteredSuppliersForCompany = getFilteredSuppliers();
                return (
                    <>
                        <Form.Item
                            name="supplierId"
                            label="Supplier"
                            rules={[{ required: true, message: 'Please select a supplier' }]}
                        >
                            <Select
                                placeholder={filteredSuppliersForCompany.length === 0 ? "No available suppliers to add" : "Select a supplier"}
                                loading={dataLoading}
                                disabled={isEditing || filteredSuppliersForCompany.length === 0}
                                notFoundContent={filteredSuppliersForCompany.length === 0 ? "All suppliers are already mapped" : "No suppliers found"}
                            >
                                {filteredSuppliersForCompany.map(supplier => (
                                    <Option key={supplier._id} value={supplier._id}>
                                        {supplier.name} - {supplier.contactPerson}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <Modal
            title={getModalTitle()}
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={600}
            destroyOnHidden
        >
            <Spin spinning={dataLoading}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                    }}
                >
                    {renderFormFields()}

                    <Form.Item
                        name="notes"
                        label="Notes"
                    >
                        <TextArea
                            rows={4}
                            placeholder="Add any notes about this mapping (optional)"
                            maxLength={500}
                            showCount
                        />
                    </Form.Item>

                    <Form.Item className="mb-0">
                        <Space className="w-full justify-end">
                            <Button onClick={onCancel}>
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                            >
                                {isEditing ? 'Update' : 'Create'} Mapping
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Spin>
        </Modal>
    );
};

export default MappingForms; 