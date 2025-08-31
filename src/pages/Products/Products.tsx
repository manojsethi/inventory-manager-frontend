import {
    DeleteOutlined,
    EditOutlined,
    ExclamationCircleOutlined,
    PlusOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    Input,
    message,
    Popconfirm,
    Row,
    Select,
    Space,
    Table,
    Tag,
    Typography,
} from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageWithFallback from '../../components/Common/ImageWithFallback';
import { productBrandService, productService, productTypeService, type Product, type ProductBrand, type ProductType } from '../../services';

const { Title } = Typography;
const { Option } = Select;

const Products: React.FC = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('active');
    const [productTypeFilter, setProductTypeFilter] = useState<string>('');
    const [productBrandFilter, setProductBrandFilter] = useState<string>('');

    // Data for dropdowns
    const [productTypes, setProductTypes] = useState<ProductType[]>([]);
    const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (searchTerm) params.name = searchTerm;
            if (statusFilter !== 'all') params.isActive = statusFilter === 'active';
            if (productTypeFilter) params.productType = productTypeFilter;
            if (productBrandFilter) params.productBrand = productBrandFilter;

            const response = await productService.getAll(params);
            setProducts(response);
        } catch (err) {
            if (err instanceof Error && err.message.includes('401')) {
                message.error('Authentication required. Please log in again.');
            } else {
                message.error(err instanceof Error ? err.message : 'Failed to fetch products');
            }
        } finally {
            setLoading(false);
        }
    }, [searchTerm, statusFilter, productTypeFilter, productBrandFilter]);

    const fetchDropdownData = useCallback(async () => {
        try {
            const [types, brands] = await Promise.all([
                productTypeService.getAll(),
                productBrandService.getAll()
            ]);

            setProductTypes(types);
            setProductBrands(brands);
        } catch (error: any) {
            if (error.message?.includes('401')) {
                message.error('Authentication required. Please log in again.');
            } else {
                message.error('Failed to load dropdown data');
            }
        }
    }, []);

    useEffect(() => {
        fetchProducts();
        fetchDropdownData();
    }, [fetchProducts, fetchDropdownData]);

    const handleSearch = () => {
        fetchProducts();
    };

    const handleDelete = async (id: string) => {
        try {
            await productService.delete(id);
            message.success('Product deleted successfully');
            fetchProducts();
        } catch (error: any) {
            if (error.message?.includes('401')) {
                message.error('Authentication required. Please log in again.');
            } else {
                message.error('Failed to delete product');
            }
        }
    };

    const handleAddProduct = () => {
        navigate('/products/add');
    };

    const handleEditProduct = (product: Product) => {
        navigate(`/products/edit/${product._id}`);
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            title: 'Product Name',
            key: 'name',
            render: (record: Product) => (
                <div>
                    <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>
                        {record.name}
                    </div>
                    {record.description && (
                        <div style={{ color: '#666', fontSize: '14px' }}>
                            {record.description}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Type & Category',
            key: 'typeCategory',
            render: (record: Product) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{record.productType.name}</div>
                    <div style={{ color: '#666', fontSize: '12px' }}>
                        {record.productTypeCategory.name}
                    </div>
                </div>
            ),
        },
        {
            title: 'Brand',
            key: 'brand',
            render: (record: Product) => (
                <div className="flex items-center">
                    <ImageWithFallback
                        src={record.productBrand.logo}
                        alt={record.productBrand.name}
                        size="small"
                        variant="logo"
                        width={30}
                        height={30}
                    />
                    <span className="ml-2">{record.productBrand.name}</span>
                </div>
            ),
        },
        {
            title: 'Variants',
            key: 'variants',
            render: (record: Product) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{record.variants.length} variants</div>
                    {record.variants.length > 0 && (
                        <div style={{ color: '#666', fontSize: '12px' }}>
                            ₹{Math.min(...record.variants.map(v => v.currentPrice))} - ₹{Math.max(...record.variants.map(v => v.currentPrice))}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Status',
            key: 'status',
            render: (record: Product) => (
                <Tag color={record.isActive ? 'green' : 'red'}>
                    {record.isActive ? 'Active' : 'Inactive'}
                </Tag>
            ),
            width: 100,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record: Product) => (
                <Space size="small">
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEditProduct(record)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete Product"
                        description="Are you sure you want to delete this product?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                        icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                    >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
            width: 150,
        },
    ];

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <Title level={2}>Products</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddProduct}
                >
                    Add New Product
                </Button>
            </div>

            {/* Statistics */}
            <Row gutter={16} className="mb-6">
                <Col span={6}>
                    <Card>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {products.length}
                            </div>
                            <div className="text-gray-600">Total Products</div>
                        </div>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {products.filter(p => p.isActive).length}
                            </div>
                            <div className="text-gray-600">Active Products</div>
                        </div>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                                {products.reduce((total, p) => total + p.variants.length, 0)}
                            </div>
                            <div className="text-gray-600">Total Variants</div>
                        </div>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                                {productTypes.length}
                            </div>
                            <div className="text-gray-600">Product Types</div>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Search and Filters */}
            <Card className="mb-6">
                <Row gutter={16} align="middle">
                    <Col span={6}>
                        <Input
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onPressEnter={handleSearch}
                            prefix={<SearchOutlined />}
                        />
                    </Col>
                    <Col span={4}>
                        <Select
                            placeholder="Status"
                            value={statusFilter}
                            onChange={setStatusFilter}
                            style={{ width: '100%' }}
                        >
                            <Option value="active">Active</Option>
                            <Option value="inactive">Inactive</Option>
                            <Option value="all">All Status</Option>
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Select
                            placeholder="Product Type"
                            value={productTypeFilter}
                            onChange={setProductTypeFilter}
                            style={{ width: '100%' }}
                            allowClear
                        >
                            {productTypes.map(type => (
                                <Option key={type._id} value={type._id}>
                                    {type.name}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Select
                            placeholder="Product Brand"
                            value={productBrandFilter}
                            onChange={setProductBrandFilter}
                            style={{ width: '100%' }}
                            allowClear
                        >
                            {productBrands.map(brand => (
                                <Option key={brand._id} value={brand._id}>
                                    {brand.name}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={6}>
                        <Space>
                            <Button type="primary" onClick={handleSearch}>
                                Search
                            </Button>
                            <Button onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('active');
                                setProductTypeFilter('');
                                setProductBrandFilter('');
                            }}>
                                Clear
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Products Table */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={filteredProducts}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} of ${total} products`,
                    }}
                />
            </Card>
        </div>
    );
};

export default Products;
