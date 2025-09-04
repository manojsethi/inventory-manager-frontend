import React, { useState, useEffect, useCallback } from 'react';
import {
    Table,
    Card,
    Button,
    Input,
    Space,
    Tag,
    Typography,
    message,
    Popconfirm,
    Row,
    Col,
    Select,
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
    KeyOutlined,
} from '@ant-design/icons';
import { productTypeService } from '../../services';
import type { ProductType, ProductTypeCategory } from '../../types';
import ImageWithFallback from '../../components/Common/ImageWithFallback';
import { ProductTypeModal, ProductTypeCategoryModal } from '../../components/ProductTypes';

const { Title, Text } = Typography;

const ProductTypes: React.FC = () => {
    const [productTypes, setProductTypes] = useState<ProductType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [editingProductType, setEditingProductType] = useState<ProductType | null>(null);
    const [modalLoading, setModalLoading] = useState(false);

    // Category modal state
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ProductTypeCategory | null>(null);
    const [categoryModalLoading, setCategoryModalLoading] = useState(false);
    const [selectedProductType, setSelectedProductType] = useState<ProductType | null>(null);
    const [categories, setCategories] = useState<{ [key: string]: ProductTypeCategory[] }>({});
    const [categoriesLoading, setCategoriesLoading] = useState<{ [key: string]: boolean }>({});
    const [expandedRows, setExpandedRows] = useState<string[]>([]);
    const [categoryPagination, setCategoryPagination] = useState<{ [key: string]: { current: number; pageSize: number } }>({});

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const fetchProductTypes = useCallback(async () => {
        try {
            setLoading(true);
            const response = await productTypeService.getAll();
            setProductTypes(response);
        } catch (err) {
            message.error(err instanceof Error ? err.message : 'Failed to fetch product types');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCategories = useCallback(async (productTypeId: string) => {
        try {
            setCategoriesLoading(prev => ({ ...prev, [productTypeId]: true }));
            const response = await productTypeService.getAllCategories(productTypeId);
            setCategories(prev => ({ ...prev, [productTypeId]: response }));
        } catch (err) {
            message.error(err instanceof Error ? err.message : 'Failed to fetch categories');
        } finally {
            setCategoriesLoading(prev => ({ ...prev, [productTypeId]: false }));
        }
    }, []);

    useEffect(() => {
        fetchProductTypes();
    }, [fetchProductTypes]);

    const handleSearch = () => {
        setCurrentPage(1);
        fetchProductTypes();
    };

    const handleDelete = async (id: string) => {
        try {
            await productTypeService.delete(id);
            message.success('Product type deleted successfully');
            fetchProductTypes();
        } catch (err) {
            message.error(err instanceof Error ? err.message : 'Failed to delete product type');
        }
    };

    const handleTableChange = (pagination: any, filters: any, sorter: any) => {
        setCurrentPage(pagination.current);
        setPageSize(pagination.pageSize);
    };

    const handleAddProductType = () => {
        setEditingProductType(null);
        setModalVisible(true);
    };

    const handleEditProductType = (productType: ProductType) => {
        setEditingProductType(productType);
        setModalVisible(true);
    };

    const handleModalCancel = () => {
        setModalVisible(false);
        setEditingProductType(null);
    };

    // Category handlers
    const handleAddCategory = (productType: ProductType) => {
        setSelectedProductType(productType);
        setEditingCategory(null);
        setCategoryModalVisible(true);
    };

    const handleEditCategory = (category: ProductTypeCategory) => {
        setEditingCategory(category);
        setCategoryModalVisible(true);
    };

    const handleCategoryModalCancel = () => {
        setCategoryModalVisible(false);
        setSelectedProductType(null);
        setEditingCategory(null);
    };

    const handleDeleteCategory = async (productTypeId: string, categoryId: string) => {
        try {
            await productTypeService.deleteCategory(productTypeId, categoryId);
            message.success('Category deleted successfully');
            await fetchCategories(productTypeId);
        } catch (err) {
            message.error(err instanceof Error ? err.message : 'Failed to delete category');
        }
    };

    const handleExpand = async (expanded: boolean, record: ProductType) => {
        if (expanded && !categories[record._id]) {
            await fetchCategories(record._id);
        }
        if (expanded) {
            setExpandedRows(prev => [...prev, record._id]);
        } else {
            setExpandedRows(prev => prev.filter(id => id !== record._id));
        }
    };

    // Filter product types based on search
    const filteredProductTypes = productTypes.filter(productType =>
        productType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        productType.skuPrefix.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            title: 'Logo',
            key: 'logo',
            render: (record: ProductType) => (
                <div>
                    <ImageWithFallback
                        src={record.logo}
                        alt={record.name}
                        size="medium"
                        variant="logo"

                    />
                </div>
            ),
            width: 80,
        },
        {
            title: 'Product Type',
            key: 'productType',
            render: (record: ProductType) => (
                <div>
                    <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>
                        {record.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        {record.description}
                    </div>
                </div>
            ),
        },
        {
            title: 'SKU Prefix',
            key: 'skuPrefix',
            render: (record: ProductType) => (
                <Tag color="blue" icon={<KeyOutlined />}>
                    {record.skuPrefix}
                </Tag>
            ),
            width: 120,
        },

        {
            title: 'Actions',
            key: 'actions',
            render: (record: ProductType) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        size="small"
                        title="Edit"
                        onClick={() => handleEditProductType(record)}
                    />
                    <Popconfirm
                        title="Are you sure you want to delete this product type?"
                        description="This action cannot be undone."
                        onConfirm={() => handleDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                        icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                    >
                        <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            size="small"
                            danger
                            title="Delete"
                        />
                    </Popconfirm>
                </Space>
            ),
            width: 120,
        },
    ];

    const categoryColumns = [
        {
            title: 'Logo',
            key: 'logo',
            render: (record: ProductTypeCategory) => (
                <div>
                    <ImageWithFallback
                        src={record.logo}
                        alt={record.name}
                        size="medium"
                        variant="logo"

                    />
                </div>
            ),
            width: 120,
        },
        {
            title: 'Category',
            key: 'category',
            render: (record: ProductTypeCategory) => (
                <div>
                    <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>
                        {record.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        {record.description}
                    </div>
                </div>
            ),
        },
        {
            title: 'SKU Prefix',
            key: 'skuPrefix',
            render: (record: ProductTypeCategory) => (
                <Tag color="green" icon={<KeyOutlined />}>
                    {record.skuPrefix}
                </Tag>
            ),
            width: 160,
        },
        {
            title: 'Latest Number',
            key: 'latestNumber',
            render: (record: ProductTypeCategory) => (
                <Text>{record.latestNumber}</Text>
            ),
            width: 160,
        },
        {
            title: 'Status',
            key: 'status',
            render: (record: ProductTypeCategory) => (
                <Tag color={record.isActive ? 'green' : 'red'}>
                    {record.isActive ? 'Active' : 'Inactive'}
                </Tag>
            ),
            width: 160,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record: ProductTypeCategory) => {
                // Find the parent product type from expanded rows
                const parentProductType = filteredProductTypes.find(pt =>
                    expandedRows.includes(pt._id) && categories[pt._id]?.some(cat => cat._id === record._id)
                );

                return (
                    <Space size="small">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            size="small"
                            title="Edit"
                            onClick={() => handleEditCategory(record)}
                        />
                        <Popconfirm
                            title="Are you sure you want to delete this category?"
                            description="This action cannot be undone."
                            onConfirm={() => parentProductType && handleDeleteCategory(parentProductType._id, record._id)}
                            okText="Yes"
                            cancelText="No"
                            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                        >
                            <Button
                                type="text"
                                icon={<DeleteOutlined />}
                                size="small"
                                danger
                                title="Delete"
                            />
                        </Popconfirm>
                    </Space>
                );
            },
            width: 160,
        },
    ];

    return (
        <div className="space-y-6">

            <div>
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <Title level={2} style={{ margin: 0 }}>Product Types</Title>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddProductType}
                    >
                        Add New Product Type
                    </Button>
                </div>


                {/* Search */}
                <Card className="mb-6">
                    <Row gutter={16} align="middle">
                        <Col xs={24} sm={20}>
                            <Input
                                placeholder="Search product types..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onPressEnter={handleSearch}
                                prefix={<SearchOutlined />}
                                allowClear
                            />
                        </Col>
                        <Col xs={24} sm={4}>
                            <Button
                                type="primary"
                                onClick={handleSearch}
                                icon={<SearchOutlined />}
                                style={{ width: '100%' }}
                            >
                                Search
                            </Button>
                        </Col>
                    </Row>
                </Card>

                {/* Product Types Table */}
                <Card>
                    <Table
                        columns={columns}
                        dataSource={filteredProductTypes}
                        rowKey="_id"
                        loading={loading}
                        expandable={{
                            expandedRowClassName: 'bg-blue-50 expanded-table-row',
                            expandedRowKeys: expandedRows,
                            onExpand: handleExpand,
                            expandedRowRender: (record: ProductType) => {
                                const productTypeCategories = categories[record._id] || [];
                                const currentPagination = categoryPagination[record._id] || { current: 1, pageSize: 10 };

                                // Calculate pagination
                                const startIndex = (currentPagination.current - 1) * currentPagination.pageSize;
                                const endIndex = startIndex + currentPagination.pageSize;
                                const paginatedCategories = productTypeCategories.slice(startIndex, endIndex);

                                const handleCategoryPaginationChange = (page: number, pageSize: number) => {
                                    setCategoryPagination(prev => ({
                                        ...prev,
                                        [record._id]: { current: page, pageSize }
                                    }));
                                };

                                return (
                                    <div className="ml-8 mb-8 px-10 rounded-lg border border-gray-200">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-lg font-semibold text-gray-700">Categories</h4>
                                            <Button
                                                type="primary"
                                                icon={<PlusOutlined />}
                                                size="small"
                                                onClick={() => handleAddCategory(record)}
                                            >
                                                Add Category
                                            </Button>
                                        </div>
                                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                            <Table
                                                columns={categoryColumns}
                                                dataSource={paginatedCategories}
                                                rowKey="_id"
                                                loading={categoriesLoading[record._id] || false}
                                                pagination={{
                                                    current: currentPagination.current,
                                                    pageSize: currentPagination.pageSize,
                                                    total: productTypeCategories.length,
                                                    showSizeChanger: true,
                                                    showQuickJumper: true,
                                                    showTotal: (total, range) =>
                                                        `${range[0]}-${range[1]} of ${total} categories`,
                                                    pageSizeOptions: ['10', '50', '100'],
                                                    onChange: handleCategoryPaginationChange,
                                                    size: 'small',
                                                }}
                                                size="small"
                                                className="category-table"
                                            />
                                        </div>
                                    </div>
                                );
                            },
                        }}
                        pagination={{
                            current: currentPage,
                            pageSize: pageSize,
                            total: filteredProductTypes.length,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} of ${total} product types`,
                            pageSizeOptions: ['10', '20', '50'],
                        }}
                        onChange={handleTableChange}
                        scroll={{ x: 800 }}
                    />
                </Card>
            </div>

            {/* Add/Edit Product Type Modal */}
            <ProductTypeModal
                open={modalVisible}
                onCancel={handleModalCancel}
                loading={modalLoading}
                editingProductType={editingProductType}
                onSubmit={async (values) => {
                    try {
                        setModalLoading(true);
                        const productTypeData = {
                            name: values.name,
                            description: values.description,
                            logo: values.logo, // Logo is now handled by the modal's upload component
                            skuPrefix: values.skuPrefix,
                        };

                        if (editingProductType) {
                            await productTypeService.update(editingProductType._id, productTypeData);
                            message.success('Product type updated successfully');
                        } else {
                            await productTypeService.create(productTypeData);
                            message.success('Product type created successfully');
                        }

                        setModalVisible(false);
                        fetchProductTypes();
                    } catch (err) {
                        message.error(err instanceof Error ? err.message : 'Failed to save product type');
                    } finally {
                        setModalLoading(false);
                    }
                }}
            />

            {/* Category Form Modal */}
            <ProductTypeCategoryModal
                open={categoryModalVisible}
                onCancel={handleCategoryModalCancel}
                loading={categoryModalLoading}
                editingCategory={editingCategory}
                onSubmit={async (values) => {
                    if (!selectedProductType) return;

                    try {
                        setCategoryModalLoading(true);
                        const categoryData = {
                            name: values.name,
                            description: values.description,
                            logo: values.logo, // Logo is now handled by the modal's upload component
                            skuPrefix: values.skuPrefix,
                            isActive: values.isActive,
                        };

                        if (editingCategory) {
                            await productTypeService.updateCategory(selectedProductType._id, editingCategory._id, categoryData);
                            message.success('Category updated successfully');
                        } else {
                            await productTypeService.createCategory(selectedProductType._id, categoryData);
                            message.success('Category created successfully');
                        }

                        setEditingCategory(null);
                        setCategoryModalVisible(false);
                        await fetchCategories(selectedProductType._id);
                    } catch (err) {
                        message.error(err instanceof Error ? err.message : 'Failed to save category');
                    } finally {
                        setCategoryModalLoading(false);
                    }
                }}
            />
        </div>
    );
};

export default ProductTypes; 