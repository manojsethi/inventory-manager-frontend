import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Space,
    Input,
    Select,
    Card,
    Typography,
    Popconfirm,
    message,

    Tooltip,
    Modal,
    Form,
    Row,
    Col,

    Badge,
    Avatar,

} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    UserOutlined,
    PhoneOutlined,
    MailOutlined,
    EnvironmentOutlined,
    EyeOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import { customerService } from '../../services/customerService';
import type { Customer, CreateCustomerRequest, UpdateCustomerRequest } from '../../types/customer';
import PhoneInputField, { getPhoneInputValidationRules } from '../../components/Common/PhoneInputField';

const { Title, Text } = Typography;
const { Option } = Select;

interface CustomerFormData {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
    notes?: string;
    isActive: boolean;
}

const Customers: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('active');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // Modal states
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [modalLoading, setModalLoading] = useState(false);

    // Form
    const [form] = Form.useForm();

    // Load customers
    const loadCustomers = async (page = 1, pageSize = 10) => {
        try {
            setLoading(true);
            const params = {
                page,
                limit: pageSize,
                search: searchText || undefined,
                isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
            };

            const response = await customerService.getAll(params);
            setCustomers(response.data);
            setPagination({
                current: response.page,
                pageSize: response.limit,
                total: response.total,
            });
        } catch (error) {
            message.error('Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCustomers();
    }, [searchText, statusFilter]);

    // Handle search
    const handleSearch = (value: string) => {
        setSearchText(value);
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    // Handle status filter
    const handleStatusFilter = (value: string) => {
        setStatusFilter(value);
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    // Handle table pagination
    const handleTableChange = (pagination: any) => {
        loadCustomers(pagination.current, pagination.pageSize);
    };

    // Add customer
    const handleAddCustomer = async (values: CustomerFormData) => {
        try {
            setModalLoading(true);
            const customerData: CreateCustomerRequest = {
                name: values.name,
                email: values.email,
                phone: values.phone,
                address: values.address,
            };

            await customerService.create(customerData);
            message.success('Customer added successfully');
            setIsAddModalVisible(false);
            form.resetFields();
            loadCustomers();
        } catch (error: any) {
            message.error(error.response?.data?.error || 'Failed to add customer');
        } finally {
            setModalLoading(false);
        }
    };

    // Edit customer
    const handleEditCustomer = async (values: CustomerFormData) => {
        if (!editingCustomer) return;

        try {
            setModalLoading(true);
            const customerData: UpdateCustomerRequest = {
                name: values.name,
                email: values.email,
                phone: values.phone,
                address: values.address,
                isActive: values.isActive,
            };

            await customerService.update(editingCustomer._id, customerData);
            message.success('Customer updated successfully');
            setIsEditModalVisible(false);
            setEditingCustomer(null);
            form.resetFields();
            loadCustomers();
        } catch (error: any) {
            message.error(error.response?.data?.error || 'Failed to update customer');
        } finally {
            setModalLoading(false);
        }
    };

    // Delete customer
    const handleDeleteCustomer = async (id: string) => {
        try {
            await customerService.delete(id);
            message.success('Customer deleted successfully');
            loadCustomers();
        } catch (error: any) {
            message.error(error.response?.data?.error || 'Failed to delete customer');
        }
    };

    // Open edit modal
    const openEditModal = (customer: Customer) => {
        setEditingCustomer(customer);
        form.setFieldsValue({
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            isActive: customer.isActive,
        });
        setIsEditModalVisible(true);
    };

    // Table columns
    const columns = [
        {
            title: 'Customer',
            key: 'customer',
            render: (record: Customer) => (
                <div className="flex items-center space-x-3">
                    <Avatar icon={<UserOutlined />} className="bg-blue-500" />
                    <div>
                        <div className="font-medium">{record.name}</div>
                        <div className="text-sm text-gray-500">{record.email}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Contact',
            key: 'contact',
            render: (record: Customer) => (
                <div className="space-y-1">
                    {record.phone && (
                        <div className="flex items-center text-sm">
                            <PhoneOutlined className="mr-1 text-gray-400" />
                            {record.phone}
                        </div>
                    )}
                    {record.address && (
                        <div className="flex items-center text-sm">
                            <EnvironmentOutlined className="mr-1 text-gray-400" />
                            <span className="truncate max-w-32">{record.address}</span>
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'status',
            render: (isActive: boolean) => (
                <Badge
                    status={isActive ? 'success' : 'default'}
                    text={isActive ? 'Active' : 'Inactive'}
                />
            ),
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => (
                <Text type="secondary">
                    {new Date(date).toLocaleDateString()}
                </Text>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record: Customer) => (
                <Space size="small">
                    <Tooltip title="Edit Customer">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => openEditModal(record)}
                            className="text-blue-600 hover:text-blue-800"
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Delete Customer"
                        description="Are you sure you want to delete this customer? This action cannot be undone."
                        onConfirm={() => handleDeleteCustomer(record._id)}
                        okText="Yes, Delete"
                        cancelText="Cancel"
                        okType="danger"
                    >
                        <Tooltip title="Delete Customer">
                            <Button
                                type="text"
                                icon={<DeleteOutlined />}
                                className="text-red-600 hover:text-red-800"
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-6">
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <Title level={2} className="mb-0">
                        Customers
                    </Title>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsAddModalVisible(true)}
                    >
                        Add Customer
                    </Button>
                </div>

                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex space-x-4">
                            <Input
                                placeholder="Search customers..."
                                prefix={<SearchOutlined />}
                                value={searchText}
                                onChange={(e) => handleSearch(e.target.value)}
                                style={{ width: 300 }}
                                allowClear
                            />
                            <Select
                                value={statusFilter}
                                onChange={handleStatusFilter}
                                style={{ width: 120 }}
                            >
                                <Option value="all">All Status</Option>
                                <Option value="active">Active</Option>
                                <Option value="inactive">Inactive</Option>
                            </Select>
                        </div>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => loadCustomers()}
                            loading={loading}
                        >
                            Refresh
                        </Button>
                    </div>

                    <Table
                        columns={columns}
                        dataSource={customers}
                        rowKey="_id"
                        loading={loading}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: pagination.total,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} of ${total} customers`,
                        }}
                        onChange={handleTableChange}
                        scroll={{ x: 800 }}
                    />
                </Card>
            </div>

            {/* Add Customer Modal */}
            <Modal
                title="Add New Customer"
                open={isAddModalVisible}
                onCancel={() => {
                    setIsAddModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                width={600}
                destroyOnHidden
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddCustomer}
                    initialValues={{ isActive: true }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Customer Name"
                                rules={[
                                    { required: true, message: 'Please enter customer name' },
                                    { min: 2, message: 'Name must be at least 2 characters' },
                                ]}
                            >
                                <Input placeholder="Enter customer name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="phone"
                                label="Phone Number"
                                rules={getPhoneInputValidationRules()}
                            >
                                <PhoneInputField
                                    placeholder="Enter phone number"
                                    onChange={(value) => {
                                        form.setFieldsValue({ phone: value });
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { type: 'email', message: 'Please enter a valid email' },
                                ]}
                            >
                                <Input placeholder="Enter email address" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="isActive"
                                label="Status"
                                valuePropName="checked"
                            >
                                <Select>
                                    <Option value={true}>Active</Option>
                                    <Option value={false}>Inactive</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="address"
                        label="Address"
                    >
                        <Input.TextArea
                            rows={3}
                            placeholder="Enter address"
                        />
                    </Form.Item>

                    <Form.Item
                        name="notes"
                        label="Notes"
                    >
                        <Input.TextArea
                            rows={2}
                            placeholder="Enter any additional notes"
                        />
                    </Form.Item>

                    <div className="flex justify-end space-x-2">
                        <Button
                            onClick={() => {
                                setIsAddModalVisible(false);
                                form.resetFields();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={modalLoading}
                        >
                            Add Customer
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* Edit Customer Modal */}
            <Modal
                title="Edit Customer"
                open={isEditModalVisible}
                onCancel={() => {
                    setIsEditModalVisible(false);
                    setEditingCustomer(null);
                    form.resetFields();
                }}
                footer={null}
                width={600}
                destroyOnHidden
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleEditCustomer}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Customer Name"
                                rules={[
                                    { required: true, message: 'Please enter customer name' },
                                    { min: 2, message: 'Name must be at least 2 characters' },
                                ]}
                            >
                                <Input placeholder="Enter customer name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="phone"
                                label="Phone Number"
                                rules={getPhoneInputValidationRules()}
                            >
                                <PhoneInputField />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { type: 'email', message: 'Please enter a valid email' },
                                ]}
                            >
                                <Input placeholder="Enter email address" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="isActive"
                                label="Status"
                            >
                                <Select>
                                    <Option value={true}>Active</Option>
                                    <Option value={false}>Inactive</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="address"
                        label="Address"
                    >
                        <Input.TextArea
                            rows={3}
                            placeholder="Enter address"
                        />
                    </Form.Item>

                    <Form.Item
                        name="notes"
                        label="Notes"
                    >
                        <Input.TextArea
                            rows={2}
                            placeholder="Enter any additional notes"
                        />
                    </Form.Item>

                    <div className="flex justify-end space-x-2">
                        <Button
                            onClick={() => {
                                setIsEditModalVisible(false);
                                setEditingCustomer(null);
                                form.resetFields();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={modalLoading}
                        >
                            Update Customer
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default Customers;
