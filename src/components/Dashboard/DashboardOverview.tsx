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
    Select,
} from 'antd';
import {
    ShoppingCartOutlined,
    DollarOutlined,
    UserOutlined,
    AlertOutlined,
    RiseOutlined,
    FallOutlined,
    ReloadOutlined,
    BarChartOutlined,
    TrophyOutlined,
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { dashboardService, type DashboardOverview as DashboardOverviewType } from '../../services/dashboardService';

const { Title, Text } = Typography;
const { Option } = Select;

const DashboardOverview: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<DashboardOverviewType | null>(null);
    const [period, setPeriod] = useState('last30days');

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const result = await dashboardService.getOverview(period);
            setData(result);
        } catch (error) {
            message.error('Failed to load dashboard overview');
            console.error('Error loading dashboard overview:', error);
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
                <Text type="secondary">Failed to load dashboard data</Text>
            </div>
        );
    }

    // Prepare chart data for sales trend
    const salesTrendData = [
        { month: 'Jan', sales: 1000, revenue: 100000 },
        { month: 'Feb', sales: 1200, revenue: 120000 },
        { month: 'Mar', sales: 1250, revenue: 125000 },
        { month: 'Apr', sales: 1100, revenue: 110000 },
        { month: 'May', sales: 1300, revenue: 130000 },
        { month: 'Jun', sales: 1250, revenue: 125000 },
    ];


    const statCards = [
        {
            title: 'Total Sales',
            value: data.totalSales,
            prefix: <ShoppingCartOutlined />,
            color: '#1890ff',
            suffix: 'orders',
        },
        {
            title: 'Total Revenue',
            value: data.totalRevenue,
            prefix: '₹',
            color: '#52c41a',
            suffix: '₹',
        },
        {
            title: 'Total Profit',
            value: data.totalProfit,
            prefix: <TrophyOutlined />,
            color: '#722ed1',
            suffix: '₹',
        },
        {
            title: 'Total Customers',
            value: data.totalCustomers,
            prefix: <UserOutlined />,
            color: '#fa8c16',
            suffix: 'customers',
        },
        {
            title: 'Total Products',
            value: data.totalProducts,
            prefix: <BarChartOutlined />,
            color: '#13c2c2',
            suffix: 'items',
        },
        {
            title: 'Low Stock Items',
            value: data.lowStockItems,
            prefix: <AlertOutlined />,
            color: '#f5222d',
            suffix: 'items',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <Title level={2} className="mb-2">
                        Dashboard Overview
                    </Title>
                    <Text type="secondary">Business performance summary</Text>
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
                    <Col xs={24} sm={12} lg={8} xl={4} key={index}>
                        <Card>
                            <Statistic
                                title={card.title}
                                value={card.value}
                                prefix={card.prefix}
                                valueStyle={{ color: card.color }}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Performance Indicators */}
            {/* <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <div className="text-center">
                            <div className="mb-2">
                                <Text strong>Sales Growth</Text>
                            </div>
                            <div className="flex items-center justify-center space-x-2">
                                {data.salesGrowth >= 0 ? (
                                    <RiseOutlined className="text-green-500 text-xl" />
                                ) : (
                                    <FallOutlined className="text-red-500 text-xl" />
                                )}
                                <Text
                                    strong
                                    style={{ color: data.salesGrowth >= 0 ? '#52c41a' : '#f5222d' }}
                                >
                                    {data.salesGrowth >= 0 ? '+' : ''}{data.salesGrowth}%
                                </Text>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <div className="text-center">
                            <div className="mb-2">
                                <Text strong>Profit Margin</Text>
                            </div>
                            <div className="flex items-center justify-center space-x-2">
                                <TrophyOutlined className="text-blue-500 text-xl" />
                                <Text strong style={{ color: '#1890ff' }}>
                                    {data.profitMargin}%
                                </Text>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <div className="text-center">
                            <div className="mb-2">
                                <Text strong>Pending Orders</Text>
                            </div>
                            <div className="flex items-center justify-center space-x-2">
                                <AlertOutlined className="text-orange-500 text-xl" />
                                <Text strong style={{ color: '#fa8c16' }}>
                                    {data.pendingOrders}
                                </Text>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <div className="text-center">
                            <div className="mb-2">
                                <Text strong>Total Suppliers</Text>
                            </div>
                            <div className="flex items-center justify-center space-x-2">
                                <UserOutlined className="text-purple-500 text-xl" />
                                <Text strong style={{ color: '#722ed1' }}>
                                    {data.totalSuppliers}
                                </Text>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row> */}

            {/* Charts */}
            {/* <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="Sales Trend" className="h-96">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={salesTrendData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value: number, name: string) => [
                                        name === 'sales' ? value : `₹${value.toLocaleString()}`,
                                        name === 'sales' ? 'Sales Count' : 'Revenue'
                                    ]}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#1890ff"
                                    strokeWidth={2}
                                    name="sales"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#52c41a"
                                    strokeWidth={2}
                                    name="revenue"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Revenue Distribution" className="h-96">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Electronics', value: 40, color: '#0088FE' },
                                        { name: 'Clothing', value: 30, color: '#00C49F' },
                                        { name: 'Books', value: 20, color: '#FFBB28' },
                                        { name: 'Others', value: 10, color: '#FF8042' },
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent || 0).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {[
                                        { name: 'Electronics', value: 40, color: '#0088FE' },
                                        { name: 'Clothing', value: 30, color: '#00C49F' },
                                        { name: 'Books', value: 20, color: '#FFBB28' },
                                        { name: 'Others', value: 10, color: '#FF8042' },
                                    ].map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row> */}

            {/* Quick Stats */}
            {/* <Row gutter={[16, 16]}>
                <Col xs={24} lg={8}>
                    <Card title="Business Health" className="h-full">
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <Text>Sales Performance</Text>
                                    <Tag color="green">Excellent</Tag>
                                </div>
                                <Progress percent={85} status="active" />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <Text>Inventory Status</Text>
                                    <Tag color="orange">Good</Tag>
                                </div>
                                <Progress percent={70} status="active" />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <Text>Customer Satisfaction</Text>
                                    <Tag color="blue">Very Good</Tag>
                                </div>
                                <Progress percent={90} status="active" />
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="Recent Activity" className="h-full">
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <Text>New sale completed - ₹15,000</Text>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <Text>New customer registered</Text>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                <Text>Low stock alert - iPhone 15</Text>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <Text>New supplier added</Text>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="Quick Actions" className="h-full">
                        <div className="space-y-3">
                            <Button type="primary" block icon={<ShoppingCartOutlined />}>
                                Create New Sale
                            </Button>
                            <Button block icon={<UserOutlined />}>
                                Add Customer
                            </Button>
                            <Button block icon={<BarChartOutlined />}>
                                Add Product
                            </Button>
                            <Button block icon={<AlertOutlined />}>
                                View Low Stock
                            </Button>
                        </div>
                    </Card>
                </Col>
            </Row> */}
        </div>
    );
};

export default DashboardOverview;
