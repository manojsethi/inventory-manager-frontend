import React, { useState, useEffect, useCallback } from 'react';
import {
    Card,
    Row,
    Col,
    DatePicker,
    Button,
    Table,
    Statistic,
    Typography,
    message,
    Space,
    InputNumber,
    Avatar,
} from 'antd';
import {
    DollarOutlined,
    UserOutlined,
    ShoppingCartOutlined,
    ReloadOutlined,
    TrophyOutlined,
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { salesReportService, type TopCustomer } from '../../services/salesReportService';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Text } = Typography;

const TopCustomersReport: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<TopCustomer[]>([]);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
    const [limit, setLimit] = useState(10);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const params: any = { limit };
            if (dateRange) {
                params.startDate = dateRange[0].format('YYYY-MM-DD');
                params.endDate = dateRange[1].format('YYYY-MM-DD');
            }

            const result = await salesReportService.getTopCustomers(params.limit, params.startDate, params.endDate);
            setData(result);
        } catch (error) {
            message.error('Failed to load top customers report');
            console.error('Error loading top customers report:', error);
        } finally {
            setLoading(false);
        }
    }, [limit, dateRange]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleDateRangeChange = (dates: any) => {
        setDateRange(dates);
    };

    const handleLimitChange = (value: number | null) => {
        if (value) {
            setLimit(value);
        }
    };

    const handleRefresh = () => {
        loadData();
    };

    // Calculate summary statistics
    const totalCustomers = data.length;
    const totalAmount = data.reduce((sum, customer) => sum + customer.totalAmount, 0);
    const totalBills = data.reduce((sum, customer) => sum + customer.totalBills, 0);
    const averageBillValue = totalBills > 0 ? totalAmount / totalBills : 0;

    // Prepare chart data
    const chartData = data.slice(0, 10).map(customer => ({
        name: customer.customerName.length > 15
            ? customer.customerName.substring(0, 15) + '...'
            : customer.customerName,
        fullName: customer.customerName,
        amount: customer.totalAmount,
        bills: customer.totalBills,
    }));

    // Prepare pie chart data for top 5 customers
    const pieData = data.slice(0, 5).map(customer => ({
        name: customer.customerName,
        value: customer.totalAmount,
    }));

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    const columns = [
        {
            title: 'Rank',
            key: 'rank',
            width: 60,
            render: (_: any, __: any, index: number) => (
                <div className="flex items-center justify-center">
                    {index < 3 ? (
                        <TrophyOutlined
                            style={{
                                color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32',
                                fontSize: '20px'
                            }}
                        />
                    ) : (
                        <span className="font-bold text-lg">{index + 1}</span>
                    )}
                </div>
            ),
        },
        {
            title: 'Customer',
            key: 'customer',
            render: (record: TopCustomer) => (
                <div className="flex items-center space-x-3">
                    <Avatar
                        size={40}
                        icon={<UserOutlined />}
                        style={{ backgroundColor: '#1890ff' }}
                    />
                    <div>
                        <div className="font-medium">{record.customerName}</div>
                        <div className="text-sm text-gray-500">
                            Last purchase: {dayjs(record.lastPurchaseDate).format('DD/MM/YYYY')}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Total Amount',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (value: number) => `₹${value.toLocaleString()}`,
            sorter: (a: TopCustomer, b: TopCustomer) => a.totalAmount - b.totalAmount,
        },
        {
            title: 'Total Bills',
            dataIndex: 'totalBills',
            key: 'totalBills',
            sorter: (a: TopCustomer, b: TopCustomer) => a.totalBills - b.totalBills,
        },
        {
            title: 'Average Bill Value',
            dataIndex: 'averageBillValue',
            key: 'averageBillValue',
            render: (value: number) => `₹${value.toFixed(2)}`,
            sorter: (a: TopCustomer, b: TopCustomer) => a.averageBillValue - b.averageBillValue,
        },
        {
            title: 'Last Purchase',
            dataIndex: 'lastPurchaseDate',
            key: 'lastPurchaseDate',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
            sorter: (a: TopCustomer, b: TopCustomer) =>
                dayjs(a.lastPurchaseDate).unix() - dayjs(b.lastPurchaseDate).unix(),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Filters */}
            <Card>
                <div className="flex justify-between items-center">
                    <Space>
                        <Text strong>Date Range (Optional):</Text>
                        <RangePicker
                            value={dateRange}
                            onChange={handleDateRangeChange}
                            format="DD/MM/YYYY"
                            placeholder={['Start Date', 'End Date']}
                        />
                        <Text strong>Limit:</Text>
                        <InputNumber
                            min={5}
                            max={50}
                            value={limit}
                            onChange={handleLimitChange}
                            style={{ width: 80 }}
                        />
                        <Button
                            type="primary"
                            icon={<ReloadOutlined />}
                            onClick={handleRefresh}
                            loading={loading}
                        >
                            Refresh
                        </Button>
                    </Space>
                </div>
            </Card>

            {/* Summary Statistics */}
            <Row gutter={16}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Total Customers"
                            value={totalCustomers}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Total Amount"
                            value={totalAmount}
                            prefix={<DollarOutlined />}
                            formatter={(value) => `₹${Number(value).toLocaleString()}`}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Total Bills"
                            value={totalBills}
                            prefix={<ShoppingCartOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Average Bill Value"
                            value={averageBillValue}
                            prefix={<DollarOutlined />}
                            formatter={(value) => `₹${Number(value).toFixed(2)}`}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Charts */}
            <Row gutter={16}>
                <Col span={12}>
                    <Card title="Top Customers by Sales Amount" className="h-96">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData} layout="horizontal">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={120} />
                                <Tooltip
                                    formatter={(value: number, name: string, props: any) => [
                                        name === 'amount' ? `₹${value.toLocaleString()}` : value,
                                        name === 'amount' ? 'Sales Amount' : 'Bills Count',
                                        props.payload.fullName
                                    ]}
                                />
                                <Bar dataKey="amount" fill="#1890ff" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Top 5 Customers Distribution" className="h-96">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent || 0).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={24}>
                    <Card title="Top Customers by Bills Count" className="h-96">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value: number, name: string, props: any) => [
                                        value,
                                        'Bills Count',
                                        props.payload.fullName
                                    ]}
                                />
                                <Bar dataKey="bills" fill="#52c41a" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Data Table */}
            <Card title="Top Customers Ranking">
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="customerId"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} of ${total} customers`,
                    }}
                    scroll={{ x: 1000 }}
                />
            </Card>
        </div>
    );
};

export default TopCustomersReport;
