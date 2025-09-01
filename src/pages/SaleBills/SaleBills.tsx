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
    Tag,
    Tooltip,
    Badge,
    Avatar,
    DatePicker,
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    ReloadOutlined,
    DollarOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { saleBillService, SaleBill } from '../../services/saleBillService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const SaleBills: React.FC = () => {
    const navigate = useNavigate();
    const [saleBills, setSaleBills] = useState<SaleBill[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // Load sale bills
    const loadSaleBills = async (page = 1, pageSize = 10) => {
        try {
            setLoading(true);
            const params: any = {
                page,
                limit: pageSize,
                search: searchText || undefined,
                status: statusFilter === 'all' ? undefined : statusFilter,
            };

            if (dateRange) {
                params.startDate = dateRange[0].format('YYYY-MM-DD');
                params.endDate = dateRange[1].format('YYYY-MM-DD');
            }

            const response = await saleBillService.getAll(params);
            setSaleBills(response.data);
            setPagination({
                current: response.page,
                pageSize: response.limit,
                total: response.total,
            });
        } catch (error) {
            message.error('Failed to load sale bills');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSaleBills();
    }, [searchText, statusFilter, dateRange]);

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

    // Handle date range filter
    const handleDateRangeChange = (dates: any) => {
        setDateRange(dates);
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    // Handle table pagination
    const handleTableChange = (pagination: any) => {
        loadSaleBills(pagination.current, pagination.pageSize);
    };

    // Delete sale bill
    const handleDeleteSaleBill = async (id: string) => {
        try {
            await saleBillService.delete(id);
            message.success('Sale bill deleted successfully');
            loadSaleBills();
        } catch (error: any) {
            message.error(error.response?.data?.error || 'Failed to delete sale bill');
        }
    };

    // Table columns
    const columns = [
        {
            title: 'Bill Number',
            dataIndex: 'billNumber',
            key: 'billNumber',
            render: (billNumber: string) => (
                <Text strong className="text-blue-600">
                    {billNumber}
                </Text>
            ),
        },
        {
            title: 'Customer',
            key: 'customer',
            render: (record: SaleBill) => (
                <div className="flex items-center space-x-3">
                    <Avatar icon={<UserOutlined />} className="bg-green-500" />
                    <div>
                        <div className="font-medium">{record.customer.name}</div>
                        {record.customer.phone && (
                            <div className="text-sm text-gray-500">{record.customer.phone}</div>
                        )}
                    </div>
                </div>
            ),
        },
        {
            title: 'Bill Date',
            dataIndex: 'billDate',
            key: 'billDate',
            render: (date: string) => (
                <Text>
                    {dayjs(date).format('DD/MM/YYYY')}
                </Text>
            ),
        },
        {
            title: 'Items',
            key: 'items',
            render: (record: SaleBill) => (
                <div>
                    <div className="font-medium">{record.items.length} items</div>
                    <div className="text-sm text-gray-500">
                        {record.items.reduce((sum, item) => sum + item.quantity, 0)} units
                    </div>
                </div>
            ),
        },
        {
            title: 'Total Amount',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (amount: number) => (
                <div className="flex items-center">
                    <Text strong className="text-green-600">
                        ₹{amount.toFixed(2)}
                    </Text>
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Badge
                    status={status === 'paid' ? 'success' : 'default'}
                    text={status === 'paid' ? 'Paid' : 'Cancelled'}
                />
            ),
        },
        {
            title: 'Created By',
            key: 'createdBy',
            render: (record: SaleBill) => (
                <Text type="secondary">
                    {record.createdBy.name}
                </Text>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record: SaleBill) => (
                <Space size="small">
                    <Tooltip title="View Details">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`/sale-bills/${record._id}`)}
                            className="text-blue-600 hover:text-blue-800"
                        />
                    </Tooltip>
                    <Tooltip title="Edit Sale Bill">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => navigate(`/sale-bills/edit/${record._id}`)}
                            className="text-green-600 hover:text-green-800"
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Delete Sale Bill"
                        description="Are you sure you want to delete this sale bill? This action cannot be undone."
                        onConfirm={() => handleDeleteSaleBill(record._id)}
                        okText="Yes, Delete"
                        cancelText="Cancel"
                        okType="danger"
                    >
                        <Tooltip title="Delete Sale Bill">
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
                        Sale Bills
                    </Title>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/sale-bills/create')}
                        size="large"
                    >
                        Create Sale Bill
                    </Button>
                </div>

                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex space-x-4">
                            <Input
                                placeholder="Search by bill number, customer..."
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
                                <Option value="paid">Paid</Option>
                                <Option value="cancelled">Cancelled</Option>
                            </Select>
                            <RangePicker
                                value={dateRange}
                                onChange={handleDateRangeChange}
                                placeholder={['Start Date', 'End Date']}
                                format="DD/MM/YYYY"
                            />
                        </div>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => loadSaleBills()}
                            loading={loading}
                        >
                            Refresh
                        </Button>
                    </div>

                    <Table
                        columns={columns}
                        dataSource={saleBills}
                        rowKey="_id"
                        loading={loading}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: pagination.total,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} of ${total} sale bills`,
                        }}
                        onChange={handleTableChange}
                        scroll={{ x: 1200 }}
                    />
                </Card>
            </div>
        </div>
    );
};

export default SaleBills;
