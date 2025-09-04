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
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import { productBrandService } from '../../services';
import type { ProductBrand } from '../../types';
import ImageWithFallback from '../../components/Common/ImageWithFallback';
import { ProductBrandModal } from '../../components/ProductBrands';

const { Title } = Typography;

const ProductBrands: React.FC = () => {
    const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [editingProductBrand, setEditingProductBrand] = useState<ProductBrand | null>(null);
    const [modalLoading, setModalLoading] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const fetchProductBrands = useCallback(async () => {
        try {
            setLoading(true);
            const response = await productBrandService.getAll();
            setProductBrands(response);
        } catch (err) {
            message.error(err instanceof Error ? err.message : 'Failed to fetch product brands');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProductBrands();
    }, [fetchProductBrands]);

    const handleSearch = () => {
        setCurrentPage(1);
        fetchProductBrands();
    };

    const handleDelete = async (id: string) => {
        try {
            await productBrandService.delete(id);
            message.success('Product brand deleted successfully');
            fetchProductBrands();
        } catch (err) {
            message.error(err instanceof Error ? err.message : 'Failed to delete product brand');
        }
    };

    const handleTableChange = (pagination: any, filters: any, sorter: any) => {
        setCurrentPage(pagination.current);
        setPageSize(pagination.pageSize);
    };

    const handleAddProductBrand = () => {
        setEditingProductBrand(null);
        setModalVisible(true);
    };

    const handleEditProductBrand = (productBrand: ProductBrand) => {
        setEditingProductBrand(productBrand);
        setModalVisible(true);
    };

    const handleModalSubmit = async (values: any) => {
        try {
            setModalLoading(true);
            const productBrandData = {
                name: values.name,
                logo: values.logo,
                isActive: values.isActive,
            };

            if (editingProductBrand) {
                await productBrandService.update(editingProductBrand._id, productBrandData);
                message.success('Product brand updated successfully');
            } else {
                await productBrandService.create(productBrandData);
                message.success('Product brand created successfully');
            }

            setModalVisible(false);
            fetchProductBrands();
        } catch (err) {
            message.error(err instanceof Error ? err.message : 'Failed to save product brand');
        } finally {
            setModalLoading(false);
        }
    };

    const handleModalCancel = () => {
        setModalVisible(false);
        setEditingProductBrand(null);
    };

    // Filter product brands based on search
    const filteredProductBrands = productBrands.filter(productBrand =>
        productBrand.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            title: 'Logo',
            key: 'logo',
            render: (record: ProductBrand) => (
                <div>
                    <ImageWithFallback
                        src={record.logo}
                        alt={record.name}
                        size="small"
                        variant="logo"
                        width={50}
                        height={50}
                    />
                </div>
            ),
            width: 80,
        },
        {
            title: 'Brand Name',
            key: 'brandName',
            render: (record: ProductBrand) => (
                <div>
                    <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>
                        {record.name}
                    </div>
                </div>
            ),
        },
        {
            title: 'Status',
            key: 'status',
            render: (record: ProductBrand) => (
                <Tag color={record.isActive ? 'green' : 'red'}>
                    {record.isActive ? 'Active' : 'Inactive'}
                </Tag>
            ),
            width: 100,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record: ProductBrand) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        size="small"
                        title="Edit"
                        onClick={() => handleEditProductBrand(record)}
                    />
                    <Popconfirm
                        title="Are you sure you want to delete this product brand?"
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

    return (
        <div className="space-y-6">
            <div>
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <Title level={2} style={{ margin: 0 }}>Product Brands</Title>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddProductBrand}
                    >
                        Add New Product Brand
                    </Button>
                </div>

                {/* Statistics */}
                <Row gutter={16} className="mb-6">
                    <Col xs={24} sm={12}>
                        <Card>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {productBrands.length}
                                </div>
                                <div className="text-gray-600">Total Product Brands</div>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Card>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {productBrands.filter(brand => brand.isActive).length}
                                </div>
                                <div className="text-gray-600">Active Brands</div>
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Search */}
                <Card className="mb-6">
                    <Row gutter={16} align="middle">
                        <Col xs={24} sm={20}>
                            <Input
                                placeholder="Search product brands..."
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

                {/* Product Brands Table */}
                <Card>
                    <Table
                        columns={columns}
                        dataSource={filteredProductBrands}
                        rowKey="_id"
                        loading={loading}
                        pagination={{
                            current: currentPage,
                            pageSize: pageSize,
                            total: filteredProductBrands.length,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} of ${total} product brands`,
                            pageSizeOptions: ['10', '20', '50'],
                        }}
                        onChange={handleTableChange}
                        scroll={{ x: 800 }}
                    />
                </Card>
            </div>

            {/* Add/Edit Product Brand Modal */}
            <ProductBrandModal
                open={modalVisible}
                onCancel={handleModalCancel}
                loading={modalLoading}
                editingProductBrand={editingProductBrand}
                onSubmit={handleModalSubmit}
            />
        </div>
    );
};

export default ProductBrands;
