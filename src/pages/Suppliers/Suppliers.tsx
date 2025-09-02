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
    Select,
    Divider,
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
} from '@ant-design/icons';
import { supplierService } from '../../services';
import type { Supplier } from '../../types';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Suppliers: React.FC = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [form] = Form.useForm();

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);

    const fetchSuppliers = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: pageSize,
                search: searchTerm || undefined,
                isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
            };

            const response = await supplierService.getAll(params);
            setSuppliers(response.data);
            setTotal(response.total || 0);
        } catch (err) {
            message.error(err instanceof Error ? err.message : 'Failed to fetch suppliers');
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, searchTerm, statusFilter]);

    useEffect(() => {
        fetchSuppliers();
    }, [fetchSuppliers]);

    const handleSearch = () => {
        setCurrentPage(1);
        fetchSuppliers();
    };

    const handleDelete = async (id: string) => {
        try {
            await supplierService.delete(id);
            message.success('Supplier deleted successfully');
            fetchSuppliers();
        } catch (err) {
            message.error(err instanceof Error ? err.message : 'Failed to delete supplier');
        }
    };

    const handleTableChange = (pagination: any, filters: any, sorter: any) => {
        setCurrentPage(pagination.current);
        setPageSize(pagination.pageSize);
    };

    const handleAddSupplier = () => {
        setEditingSupplier(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEditSupplier = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        form.setFieldsValue({
            name: supplier.name,
            contactPerson: supplier.contactPerson,
            email: supplier.email,
            phone: supplier.phone,
            address: supplier.address,
            taxId: supplier.taxId,
            notes: supplier.notes,
            isActive: supplier.isActive,
        });
        setModalVisible(true);
    };

    const handleModalSubmit = async (values: any) => {
        try {
            setModalLoading(true);
            const supplierData = {
                name: values.name,
                contactPerson: values.contactPerson,
                email: values.email,
                phone: values.phone,
                address: {
                    street: values.address.street,
                    city: values.address.city,
                    state: values.address.state,
                    zipCode: values.address.zipCode,
                    country: values.address.country,
                },
                taxId: values.taxId,
                notes: values.notes,
                isActive: values.isActive,
            };

            if (editingSupplier) {
                await supplierService.update(editingSupplier._id, supplierData);
                message.success('Supplier updated successfully');
            } else {
                await supplierService.create(supplierData);
                message.success('Supplier created successfully');
            }

            setModalVisible(false);
            fetchSuppliers();
        } catch (err) {
            message.error(err instanceof Error ? err.message : 'Failed to save supplier');
        } finally {
            setModalLoading(false);
        }
    };

    const handleModalCancel = () => {
        setModalVisible(false);
        setEditingSupplier(null);
        form.resetFields();
    };

    const columns = [
        {
            title: 'Supplier Name',
            key: 'name',
            render: (record: Supplier) => (
                <div>
                    <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>
                        {record.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        {record.taxId && `Tax ID: ${record.taxId}`}
                    </div>
                </div>
            ),
        },
        {
            title: 'Contact Information',
            key: 'contact',
            render: (record: Supplier) => (
                <div>
                    <div style={{ marginBottom: '4px' }}>
                        <UserOutlined style={{ marginRight: '4px', color: '#1890ff' }} />
                        {record.contactPerson}
                    </div>
                    <div style={{ marginBottom: '4px' }}>
                        <MailOutlined style={{ marginRight: '4px', color: '#52c41a' }} />
                        {record.email}
                    </div>
                    <div>
                        <PhoneOutlined style={{ marginRight: '4px', color: '#fa8c16' }} />
                        {record.phone}
                    </div>
                </div>
            ),
        },
        {
            title: 'Address',
            key: 'address',
            render: (record: Supplier) => (
                <div>
                    <div style={{ marginBottom: '2px' }}>
                        {record.address.street}
                    </div>
                    <div style={{ marginBottom: '2px' }}>
                        {record.address.city}, {record.address.state} {record.address.zipCode}
                    </div>
                    <div>
                        {record.address.country}
                    </div>
                </div>
            ),
        },

        {
            title: 'Status',
            key: 'status',
            render: (record: Supplier) => (
                <Tag color={record.isActive ? 'green' : 'red'}>
                    {record.isActive ? 'Active' : 'Inactive'}
                </Tag>
            ),
            width: 100,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record: Supplier) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        size="small"
                        title="Edit"
                        onClick={() => handleEditSupplier(record)}
                    />
                    <Popconfirm
                        title="Are you sure you want to delete this supplier?"
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
                    <Title level={2} style={{ margin: 0 }}>Suppliers</Title>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddSupplier}
                    >
                        Add New Supplier
                    </Button>
                </div>

                {/* Statistics */}
                <Row gutter={16} className="mb-6">
                    <Col xs={24} sm={8}>
                        <Card>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {total}
                                </div>
                                <div className="text-gray-600">Total Suppliers</div>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {suppliers.filter(supplier => supplier.isActive).length}
                                </div>
                                <div className="text-gray-600">Active Suppliers</div>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-orange-600">
                                    {suppliers.filter(supplier => !supplier.isActive).length}
                                </div>
                                <div className="text-gray-600">Inactive Suppliers</div>
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Search and Filters */}
                <Card className="mb-6">
                    <Row gutter={16} align="middle">
                        <Col xs={24} sm={12}>
                            <Input
                                placeholder="Search suppliers by name, contact person, or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onPressEnter={handleSearch}
                                prefix={<SearchOutlined />}
                                allowClear
                            />
                        </Col>
                        <Col xs={24} sm={6}>
                            <Select
                                placeholder="Filter by status"
                                value={statusFilter}
                                onChange={setStatusFilter}
                                style={{ width: '100%' }}
                            >
                                <Option value="all">All Suppliers</Option>
                                <Option value="active">Active Only</Option>
                                <Option value="inactive">Inactive Only</Option>
                            </Select>
                        </Col>
                        <Col xs={24} sm={6}>
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

                {/* Suppliers Table */}
                <Card>
                    <Table
                        columns={columns}
                        dataSource={suppliers}
                        rowKey="_id"
                        loading={loading}
                        pagination={{
                            current: currentPage,
                            pageSize: pageSize,
                            total: total,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} of ${total} suppliers`,
                            pageSizeOptions: ['10', '20', '50'],
                        }}
                        onChange={handleTableChange}
                        scroll={{ x: 1200 }}
                    />
                </Card>
            </div>

            {/* Add/Edit Supplier Modal */}
            <Modal
                title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                open={modalVisible}
                onCancel={handleModalCancel}
                footer={null}
                width={800}
                destroyOnHidden
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleModalSubmit}
                    initialValues={{
                        isActive: true,
                    }}
                >
                    {/* Basic Information */}
                    <Title level={4}>Basic Information</Title>
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="name"
                                label="Supplier Name"
                                rules={[
                                    { required: true, message: 'Please enter supplier name' },
                                    { min: 2, message: 'Name must be at least 2 characters' },
                                    { max: 100, message: 'Name cannot exceed 100 characters' }
                                ]}
                            >
                                <Input placeholder="Enter supplier name" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="contactPerson"
                                label="Contact Person"
                                rules={[
                                    { required: true, message: 'Please enter contact person' },
                                    { min: 2, message: 'Contact person must be at least 2 characters' },
                                    { max: 50, message: 'Contact person cannot exceed 50 characters' }
                                ]}
                            >
                                <Input placeholder="Enter contact person name" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Please enter email address' },
                                    { type: 'email', message: 'Please enter a valid email address' }
                                ]}
                            >
                                <Input placeholder="Enter email address" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="phone"
                                label="Phone"
                                rules={[
                                    { required: true, message: 'Please enter phone number' }
                                ]}
                            >
                                <Input placeholder="Enter phone number" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="taxId"
                                label="Tax ID"
                            >
                                <Input placeholder="Enter tax ID (optional)" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="isActive"
                                label="Status"
                                valuePropName="checked"
                            >
                                <Switch
                                    checkedChildren="Active"
                                    unCheckedChildren="Inactive"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Address Information */}
                    <Divider />
                    <Title level={4}>Address Information</Title>
                    <Row gutter={16}>
                        <Col xs={24}>
                            <Form.Item
                                name={['address', 'street']}
                                label="Street Address"
                                rules={[
                                    { required: true, message: 'Please enter street address' }
                                ]}
                            >
                                <Input placeholder="Enter street address" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} sm={8}>
                            <Form.Item
                                name={['address', 'city']}
                                label="City"
                                rules={[
                                    { required: true, message: 'Please enter city' }
                                ]}
                            >
                                <Input placeholder="Enter city" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item
                                name={['address', 'state']}
                                label="State/Province"
                                rules={[
                                    { required: true, message: 'Please enter state/province' }
                                ]}
                            >
                                <Input placeholder="Enter state/province" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item
                                name={['address', 'zipCode']}
                                label="ZIP/Postal Code"
                                rules={[
                                    { required: true, message: 'Please enter ZIP/postal code' }
                                ]}
                            >
                                <Input placeholder="Enter ZIP/postal code" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24}>
                            <Form.Item
                                name={['address', 'country']}
                                label="Country"
                                rules={[
                                    { required: true, message: 'Please enter country' }
                                ]}
                            >
                                <Input placeholder="Enter country" />
                            </Form.Item>
                        </Col>
                    </Row>



                    {/* Notes */}
                    <Divider />
                    <Title level={4}>Additional Information</Title>
                    <Form.Item
                        name="notes"
                        label="Notes"
                    >
                        <TextArea
                            rows={4}
                            placeholder="Enter any additional notes about this supplier"
                            maxLength={500}
                            showCount
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
                            {editingSupplier ? 'Update Supplier' : 'Create Supplier'}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default Suppliers;
