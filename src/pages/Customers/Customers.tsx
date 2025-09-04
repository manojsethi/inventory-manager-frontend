import React, { useState, useEffect, useCallback } from 'react';
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
    EnvironmentOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import { customerService } from '../../services/customerService';
import type { Customer } from '../../types/customer';
import AddCustomerModal from '../../components/Common/AddCustomerModal';

const { Title, Text } = Typography;
const { Option } = Select;

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

    // Load customers
    const loadCustomers = useCallback(async (page = 1, pageSize = 10) => {
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
    }, [searchText, statusFilter]);

    useEffect(() => {
        loadCustomers();
    }, [loadCustomers]);

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

    // Handle customer added/updated from modal
    const handleCustomerAdded = (customer: Customer) => {
        loadCustomers();
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
            <AddCustomerModal
                open={isAddModalVisible}
                onCancel={() => setIsAddModalVisible(false)}
                onCustomerAdded={handleCustomerAdded}
                showOptionalFields={true}
                title="Add New Customer"
            />

            {/* Edit Customer Modal */}
            <AddCustomerModal
                open={isEditModalVisible}
                onCancel={() => {
                    setIsEditModalVisible(false);
                    setEditingCustomer(null);
                }}
                onCustomerAdded={handleCustomerAdded}
                editingCustomer={editingCustomer}
                showOptionalFields={true}
                title="Edit Customer"
            />
        </div>
    );
};

export default Customers;
