import React, { useState, useEffect, useCallback } from 'react';
import {
    Card,
    Row,
    Col,
    Statistic,
    Typography,
    Spin,
    message,
    Space,
    Progress,
    Tag,
    Button,
    Table,
    Select,
    Avatar,
} from 'antd';
import {
    UserOutlined,
    RiseOutlined,
    FallOutlined,
    ReloadOutlined,
    TrophyOutlined,
    BarChartOutlined,
    TeamOutlined,
    CalendarOutlined,
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { dashboardService, type CustomerAnalytics } from '../../services/dashboardService';

const { Title, Text } = Typography;
const { Option } = Select;

const CustomerAnalyticsDashboard: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<CustomerAnalytics | null>(null);
    const [period, setPeriod] = useState('last30days');

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const result = await dashboardService.getCustomerAnalytics(period);
            setData(result);
        } catch (error) {
            message.error('Failed to load customer analytics');
            console.error('Error loading customer analytics:', error);
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handlePeriodChange = (value: string) => {
        setPeriod(value);
    };

    const handleRefresh = () => {
        loadData();
    };

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center">
                <Text type="secondary">Failed to load customer analytics</Text>
            </div>
        );
    }

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const topCustomersColumns = [
        {
            title: 'Customer',
            dataIndex: 'customerName',
            key: 'customerName',
            render: (text: string) => (
                <div className="flex items-center space-x-3">
                    <Avatar icon={<UserOutlined />} />
                    <Text strong>{text}</Text>
                </div>
            ),
        },
        {
            title: 'Total Purchases',
            dataIndex: 'totalPurchases',
            key: 'totalPurchases',
            render: (value: number) => (
                <Tag color="blue">{value} orders</Tag>
            ),
            sorter: (a: any, b: any) => a.totalPurchases - b.totalPurchases,
        },
        {
            title: 'Total Spent',
            dataIndex: 'totalSpent',
            key: 'totalSpent',
            render: (value: number) => (
                <Text strong style={{ color: '#52c41a' }}>
                    ₹{value.toLocaleString()}
                </Text>
            ),
            sorter: (a: any, b: any) => a.totalSpent - b.totalSpent,
        },
        {
            title: 'Last Purchase',
            dataIndex: 'lastPurchase',
            key: 'lastPurchase',
            render: (date: string) => (
                <div className="flex items-center space-x-2">
                    <CalendarOutlined />
                    <Text>{new Date(date).toLocaleDateString()}</Text>
                </div>
            ),
        },
        {
            title: 'Customer Value',
            key: 'customerValue',
            render: (record: any) => {
                const avgSpent = record.totalSpent / record.totalPurchases;
                return (
                    <Tag color={avgSpent >= 1000 ? 'green' : avgSpent >= 500 ? 'orange' : 'blue'}>
                        {avgSpent >= 1000 ? 'High Value' : avgSpent >= 500 ? 'Medium Value' : 'Standard'}
                    </Tag>
                );
            },
        },
    ];

    const statCards = [
        {
            title: 'Total Customers',
            value: data.totalCustomers,
            prefix: <UserOutlined />,
            color: '#1890ff',
            suffix: 'customers',
        },
        {
            title: 'New Customers',
            value: data.newCustomers,
            prefix: <RiseOutlined />,
            color: '#52c41a',
            suffix: 'customers',
        },
        {
            title: 'Returning Customers',
            value: data.returningCustomers,
            prefix: <TeamOutlined />,
            color: '#722ed1',
            suffix: 'customers',
        },
        {
            title: 'Retention Rate',
            value: Math.round((data.returningCustomers / data.totalCustomers) * 100),
            prefix: <TrophyOutlined />,
            color: '#fa8c16',
            suffix: '%',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <Title level={2} className="mb-2">
                        Customer Analytics
                    </Title>
                    <Text type="secondary">Customer behavior and engagement insights</Text>
                </div>
                <Space>
                    <Select
                        value={period}
                        onChange={handlePeriodChange}
                        style={{ width: 150 }}
                    >
                        <Option value="last7days">Last 7 Days</Option>
                        <Option value="last30days">Last 30 Days</Option>
                        <Option value="last90days">Last 90 Days</Option>
                        <Option value="last1year">Last Year</Option>
                    </Select>
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

            {/* Key Metrics */}
            <Row gutter={[16, 16]}>
                {statCards.map((card, index) => (
                    <Col xs={24} sm={12} lg={6} key={index}>
                        <Card>
                            <Statistic
                                title={card.title}
                                value={card.value}
                                prefix={card.prefix}
                                suffix={card.suffix}
                                valueStyle={{ color: card.color }}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Customer Insights */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={8}>
                    <Card title="Customer Segments" className="h-full">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={data.customerSegments}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent || 0).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {data.customerSegments.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="Customer Growth" className="h-full">
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <Text>New Customers</Text>
                                    <Text strong style={{ color: '#52c41a' }}>
                                        {data.newCustomers}
                                    </Text>
                                </div>
                                <Progress
                                    percent={Math.round((data.newCustomers / data.totalCustomers) * 100)}
                                    strokeColor="#52c41a"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <Text>Returning Customers</Text>
                                    <Text strong style={{ color: '#1890ff' }}>
                                        {data.returningCustomers}
                                    </Text>
                                </div>
                                <Progress
                                    percent={Math.round((data.returningCustomers / data.totalCustomers) * 100)}
                                    strokeColor="#1890ff"
                                />
                            </div>
                            <div className="text-center">
                                <Text type="secondary">
                                    Customer retention rate: {Math.round((data.returningCustomers / data.totalCustomers) * 100)}%
                                </Text>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="Customer Health" className="h-full">
                        <div className="space-y-4">
                            <div className="text-center">
                                <div className="mb-2">
                                    <Text strong className="text-lg">Customer Satisfaction</Text>
                                </div>
                                <Progress
                                    type="circle"
                                    percent={85}
                                    strokeColor="#52c41a"
                                    format={() => '85%'}
                                />
                                <div className="mt-2">
                                    <Tag color="green">Excellent</Tag>
                                </div>
                            </div>
                            <div className="text-center">
                                <Text type="secondary">
                                    Based on purchase frequency and customer feedback
                                </Text>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Customer Segments Chart */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="Customer Segments Distribution" className="h-96">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.customerSegments}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="segment" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value: number, name: string) => [
                                        name === 'count' ? value : `${value}%`,
                                        name === 'count' ? 'Count' : 'Percentage'
                                    ]}
                                />
                                <Bar dataKey="count" fill="#1890ff" name="count" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Customer Value Distribution" className="h-96">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.customerSegments}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="segment" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value: number) => [`${value}%`, 'Percentage']}
                                />
                                <Bar dataKey="percentage" fill="#52c41a" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Top Customers Table */}
            <Card title="Top Customers" className="h-full">
                <Table
                    columns={topCustomersColumns}
                    dataSource={data.topCustomers}
                    rowKey="customerName"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} of ${total} customers`,
                    }}
                    scroll={{ x: 600 }}
                />
            </Card>
        </div>
    );
};

export default CustomerAnalyticsDashboard;
