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
    Modal,
    Form,
    Switch,
    Upload,
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
    UploadOutlined,
    DeleteOutlined as DeleteIcon,
} from '@ant-design/icons';
import { productBrandService, type ProductBrand } from '../../services';
import { uploadService } from '../../services';
import ImageWithFallback from '../../components/Common/ImageWithFallback';

const { Title } = Typography;

const ProductBrands: React.FC = () => {
    const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [editingProductBrand, setEditingProductBrand] = useState<ProductBrand | null>(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [form] = Form.useForm();
    const [logoUrl, setLogoUrl] = useState<string>('');
    const [uploading, setUploading] = useState(false);

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
        setLogoUrl('');
        form.resetFields();
        setModalVisible(true);
    };

    const handleEditProductBrand = (productBrand: ProductBrand) => {
        setEditingProductBrand(productBrand);
        setLogoUrl(productBrand.logo || '');
        form.setFieldsValue({
            name: productBrand.name,
            logo: productBrand.logo,
            isActive: productBrand.isActive,
        });
        setModalVisible(true);
    };

    const handleLogoUpload = async (file: File) => {
        try {
            setUploading(true);
            const uploadedImage = await uploadService.uploadSingle(file);
            setLogoUrl(uploadedImage.url);
            form.setFieldsValue({ logo: uploadedImage.url });
            message.success('Logo uploaded successfully');
        } catch (err) {
            message.error(err instanceof Error ? err.message : 'Logo upload failed');
        } finally {
            setUploading(false);
        }
    };

    const removeLogo = () => {
        setLogoUrl('');
        form.setFieldsValue({ logo: '' });
    };

    const handleModalSubmit = async (values: any) => {
        try {
            setModalLoading(true);
            const productBrandData = {
                name: values.name,
                logo: logoUrl || values.logo,
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
        setLogoUrl('');
        form.resetFields();
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
            <Modal
                title={editingProductBrand ? 'Edit Product Brand' : 'Add New Product Brand'}
                open={modalVisible}
                onCancel={handleModalCancel}
                footer={null}
                width={600}
                destroyOnHidden
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleModalSubmit}
                >
                    <Form.Item
                        name="name"
                        label="Brand Name"
                        rules={[
                            { required: true, message: 'Please enter brand name' },
                            { min: 2, message: 'Name must be at least 2 characters' },
                            { max: 100, message: 'Name cannot exceed 100 characters' }
                        ]}
                    >
                        <Input placeholder="Enter brand name" />
                    </Form.Item>

                    <Form.Item
                        name="logo"
                        label="Logo"
                    >
                        <div className="space-y-4">
                            {logoUrl && (
                                <div className="flex items-center space-x-4">
                                    <ImageWithFallback
                                        src={logoUrl}
                                        alt="Logo"
                                        size="medium"
                                        variant="logo"
                                        width={80}
                                        height={80}
                                    />
                                    <Button
                                        type="text"
                                        icon={<DeleteIcon />}
                                        danger
                                        onClick={removeLogo}
                                        title="Remove Logo"
                                    >
                                        Remove
                                    </Button>
                                </div>
                            )}
                            <Upload
                                name="logo"
                                multiple={false}
                                accept="image/*"
                                beforeUpload={async (file: File) => {
                                    const isImage = file.type.startsWith('image/');
                                    if (!isImage) {
                                        message.error('You can only upload image files!');
                                        return false;
                                    }
                                    const isLt5M = file.size / 1024 / 1024 < 5;
                                    if (!isLt5M) {
                                        message.error('Image must be smaller than 5MB!');
                                        return false;
                                    }

                                    await handleLogoUpload(file);
                                    return false;
                                }}
                                showUploadList={false}
                            >
                                <Button
                                    icon={<UploadOutlined />}
                                    loading={uploading}
                                >
                                    {uploading ? 'Uploading...' : 'Upload Logo'}
                                </Button>
                            </Upload>
                            <div className="text-sm text-gray-500">
                                Upload a square image (recommended: 150x150px, max 5MB)
                            </div>
                        </div>
                    </Form.Item>

                    <Form.Item
                        name="isActive"
                        label="Status"
                        valuePropName="checked"
                        initialValue={true}
                    >
                        <Switch
                            checkedChildren="Active"
                            unCheckedChildren="Inactive"
                        />
                    </Form.Item>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-4 pt-6 border-t">
                        <Button onClick={handleModalCancel} disabled={modalLoading}>
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={modalLoading}
                        >
                            {editingProductBrand ? 'Update Product Brand' : 'Create Product Brand'}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default ProductBrands;
