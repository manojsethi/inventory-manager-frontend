import React, { useState, useEffect, useCallback } from 'react';
import {
    Table,
    Card,
    Button,
    Input,
    Space,
    Typography,
    message,
    Popconfirm,
    Row,
    Col,
    Select,
    DatePicker,
    Tooltip,
    Badge,
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons';
import { purchaseBillService, supplierService } from '../../services';
import type { PurchaseBill, Supplier } from '../../types';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const PurchaseBills: React.FC = () => {
    const navigate = useNavigate();
    const [purchaseBills, setPurchaseBills] = useState<PurchaseBill[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'paid'>('all');
    const [supplierFilter, setSupplierFilter] = useState<string>('all');
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);

    const fetchPurchaseBills = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: pageSize,
                search: searchTerm || undefined,
                status: statusFilter === 'all' ? undefined : statusFilter,
                supplierId: supplierFilter === 'all' ? undefined : supplierFilter,
                startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
                endDate: dateRange?.[1]?.format('YYYY-MM-DD'),
            };
            const response = await purchaseBillService.getAll(params);
            setPurchaseBills(response.data);
            setTotal(response.total || 0);
        } catch (err) {
            message.error(err instanceof Error ? err.message : 'Failed to fetch purchase bills');
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, searchTerm, statusFilter, supplierFilter, dateRange]);

    const fetchSuppliers = useCallback(async () => {
        try {
            const response = await supplierService.getAll({ limit: 1000 });
            setSuppliers(response.data);
        } catch (err) {
            message.error('Failed to fetch suppliers');
        }
    }, []);

    useEffect(() => {
        fetchPurchaseBills();
        fetchSuppliers();
    }, [fetchPurchaseBills, fetchSuppliers]);

    const handleSearch = () => {
        setCurrentPage(1);
        fetchPurchaseBills();
    };

    const handleDelete = async (id: string) => {
        try {
            await purchaseBillService.delete(id);
            message.success('Purchase bill deleted successfully');
            fetchPurchaseBills();
        } catch (err) {
            message.error(err instanceof Error ? err.message : 'Failed to delete purchase bill');
        }
    };

    const handleMarkAsPaid = async (id: string) => {
        try {
            await purchaseBillService.markAsPaid(id);
            message.success('Purchase bill marked as done successfully');
            fetchPurchaseBills();
        } catch (err) {
            message.error(err instanceof Error ? err.message : 'Failed to mark purchase bill as done');
        }
    };

    const handleTableChange = (pagination: any, filters: any, sorter: any) => {
        setCurrentPage(pagination.current);
        setPageSize(pagination.pageSize);
    };

    const handleAddBill = () => {
        navigate('/purchase-bills/create');
    };

    const columns = [
        {
            title: 'Bill Number',
            dataIndex: 'billNumber',
            key: 'billNumber',
            render: (text: string) => (
                <span className="font-semibold text-blue-600">{text}</span>
            ),
        },
        {
            title: 'Supplier Bill Number',
            dataIndex: 'supplierBillNumber',
            key: 'supplierBillNumber',
            render: (text: string) => (
                <span className="font-medium text-gray-700">{text}</span>
            ),
        },
        {
            title: 'Supplier',
            dataIndex: 'supplierId',
            key: 'supplierId',
            render: (supplier: any) => (
                <span className="font-medium">{supplier?.name || '-'}</span>
            ),
        },
        {
            title: 'Bill Date',
            dataIndex: 'billDate',
            key: 'billDate',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
        },

        {
            title: 'Total Amount',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (amount: number) => (
                <span className="font-semibold text-green-600">
                    ₹{amount.toFixed(2)}
                </span>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Badge
                    status={status === 'paid' ? 'success' : 'processing'}
                    text={status === 'paid' ? 'Paid' : 'Draft'}
                />
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: PurchaseBill) => (
                <Space size="small">
                    <Tooltip title="View Details">
                        <Button
                            type="text"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`/purchase-bills/${record._id}`)}
                        />
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => navigate(`/purchase-bills/edit/${record._id}`)}
                        />
                    </Tooltip>
                    {record.status === 'draft' && (
                        <Tooltip title="Mark as Paid">
                            <Button
                                type="text"
                                size="small"
                                icon={<CheckCircleOutlined />}
                                onClick={() => handleMarkAsPaid(record._id)}
                            />
                        </Tooltip>
                    )}
                    <Popconfirm
                        title="Delete Purchase Bill"
                        description="Are you sure you want to delete this purchase bill? This action cannot be undone."
                        onConfirm={() => handleDelete(record._id)}
                        okText="Yes, Delete"
                        cancelText="Cancel"
                        okType="danger"
                    >
                        <Button
                            type="text"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-6">
            <div className="mb-6">
                <Title level={2} className="mb-2">
                    Purchase Bills
                </Title>
                <p className="text-gray-600">
                    Manage your purchase bills and track supplier invoices
                </p>
            </div>

            <Card>
                {/* Search and Filter Section */}
                <div className="mb-6">
                    <Row gutter={[16, 16]} align="middle">
                        <Col xs={24} sm={12} md={6}>
                            <Input
                                placeholder="Search bills..."
                                prefix={<SearchOutlined />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onPressEnter={handleSearch}
                                allowClear
                            />
                        </Col>
                        <Col xs={24} sm={12} md={4}>
                            <Select
                                placeholder="Status"
                                value={statusFilter}
                                onChange={setStatusFilter}
                                style={{ width: '100%' }}
                            >
                                <Option value="all">All Status</Option>
                                <Option value="draft">Draft</Option>
                                <Option value="paid">Paid</Option>
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={4}>
                            <Select
                                placeholder="Supplier"
                                value={supplierFilter}
                                onChange={setSupplierFilter}
                                style={{ width: '100%' }}
                            >
                                <Option value="all">All Suppliers</Option>
                                {suppliers.map((supplier) => (
                                    <Option key={supplier._id} value={supplier._id}>
                                        {supplier.name}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <RangePicker
                                placeholder={['Start Date', 'End Date']}
                                value={dateRange}
                                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
                                style={{ width: '100%' }}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={4}>
                            <Space>
                                <Button type="primary" onClick={handleSearch}>
                                    Search
                                </Button>
                                <Button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('all');
                                        setSupplierFilter('all');
                                        setDateRange(null);
                                        setCurrentPage(1);
                                    }}
                                >
                                    Reset
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </div>

                {/* Action Buttons */}
                <div className="mb-4 flex justify-between items-center">
                    <div>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAddBill}
                        >
                            Create Purchase Bill
                        </Button>
                    </div>
                    <div className="text-sm text-gray-500">
                        Total: {total} bills
                    </div>
                </div>

                {/* Table */}
                <Table
                    columns={columns}
                    dataSource={purchaseBills}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: total,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} of ${total} items`,
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: 1200 }}
                />
            </Card>

            {/* Modal removed - now using separate pages */}
        </div>
    );
};

export default PurchaseBills;
