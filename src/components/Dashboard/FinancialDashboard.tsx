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
} from 'antd';
import {
    DollarOutlined,
    RiseOutlined,
    FallOutlined,
    ReloadOutlined,
    TrophyOutlined,
    BarChartOutlined,
} from '@ant-design/icons';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { dashboardService, type FinancialOverview } from '../../services/dashboardService';

const { Title, Text } = Typography;
const { Option } = Select;

const FinancialDashboard: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<FinancialOverview | null>(null);
    const [period, setPeriod] = useState('last30days');

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const result = await dashboardService.getFinancialOverview(period);
            setData(result);
        } catch (error) {
            message.error('Failed to load financial data');
            console.error('Error loading financial data:', error);
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
                <Text type="secondary">Failed to load financial data</Text>
            </div>
        );
    }

    const topRevenueColumns = [
        {
            title: 'Product Name',
            dataIndex: 'productName',
            key: 'productName',
        },
        {
            title: 'Revenue',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (value: number) => `₹${value.toLocaleString()}`,
            sorter: (a: any, b: any) => a.revenue - b.revenue,
        },
        {
            title: 'Profit',
            dataIndex: 'profit',
            key: 'profit',
            render: (value: number) => (
                <span style={{ color: value >= 0 ? '#52c41a' : '#f5222d' }}>
                    ₹{value.toLocaleString()}
                </span>
            ),
            sorter: (a: any, b: any) => a.profit - b.profit,
        },
        {
            title: 'Profit Margin',
            key: 'profitMargin',
            render: (record: any) => {
                const margin = (record.profit / record.revenue) * 100;
                return (
                    <Tag color={margin >= 20 ? 'green' : margin >= 10 ? 'orange' : 'red'}>
                        {margin.toFixed(1)}%
                    </Tag>
                );
            },
        },
    ];

    const statCards = [
        {
            title: 'Total Revenue',
            value: data.totalRevenue,
            prefix: <DollarOutlined />,
            color: '#52c41a',
            suffix: '₹',
        },
        {
            title: 'Total Costs',
            value: data.totalCosts,
            prefix: <BarChartOutlined />,
            color: '#fa8c16',
            suffix: '₹',
        },
        {
            title: 'Total Profit',
            value: data.totalProfit,
            prefix: <TrophyOutlined />,
            color: '#1890ff',
            suffix: '₹',
        },
        {
            title: 'Profit Margin',
            value: data.profitMargin,
            prefix: <RiseOutlined />,
            color: '#722ed1',
            suffix: '%',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <Title level={2} className="mb-2">
                        Financial Dashboard
                    </Title>
                    <Text type="secondary">Revenue, costs, and profit analysis</Text>
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

            {/* Financial Health Indicators */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={8}>
                    <Card title="Profit Margin Trend" className="h-full">
                        <div className="text-center">
                            <div className="mb-4">
                                <Text strong className="text-2xl" style={{ color: '#52c41a' }}>
                                    {data.profitMargin}%
                                </Text>
                            </div>
                            <Progress
                                type="circle"
                                percent={data.profitMargin}
                                strokeColor="#52c41a"
                                format={() => `${data.profitMargin}%`}
                            />
                            <div className="mt-4">
                                <Text type="secondary">
                                    {data.profitMargin >= 20 ? 'Excellent' :
                                        data.profitMargin >= 15 ? 'Good' :
                                            data.profitMargin >= 10 ? 'Average' : 'Needs Improvement'}
                                </Text>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card title="Revenue vs Costs" className="h-full">
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <Text>Revenue</Text>
                                    <Text strong style={{ color: '#52c41a' }}>
                                        ₹{data.totalRevenue.toLocaleString()}
                                    </Text>
                                </div>
                                <Progress
                                    percent={100}
                                    strokeColor="#52c41a"
                                    showInfo={false}
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <Text>Costs</Text>
                                    <Text strong style={{ color: '#fa8c16' }}>
                                        ₹{data.totalCosts.toLocaleString()}
                                    </Text>
                                </div>
                                <Progress
                                    percent={Math.round((data.totalCosts / data.totalRevenue) * 100)}
                                    strokeColor="#fa8c16"
                                    showInfo={false}
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <Text>Profit</Text>
                                    <Text strong style={{ color: '#1890ff' }}>
                                        ₹{data.totalProfit.toLocaleString()}
                                    </Text>
                                </div>
                                <Progress
                                    percent={Math.round((data.totalProfit / data.totalRevenue) * 100)}
                                    strokeColor="#1890ff"
                                    showInfo={false}
                                />
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card title="Financial Health" className="h-full">
                        <div className="space-y-4">
                            <div className="text-center">
                                <div className="flex items-center justify-center space-x-2 mb-2">
                                    {data.profitMargin >= 15 ? (
                                        <RiseOutlined className="text-green-500 text-xl" />
                                    ) : (
                                        <FallOutlined className="text-red-500 text-xl" />
                                    )}
                                    <Text strong>
                                        {data.profitMargin >= 15 ? 'Healthy' : 'Needs Attention'}
                                    </Text>
                                </div>
                                <Tag color={data.profitMargin >= 15 ? 'green' : 'orange'} className="text-lg">
                                    {data.profitMargin >= 15 ? 'Excellent Performance' : 'Room for Improvement'}
                                </Tag>
                            </div>
                            <div className="text-center">
                                <Text type="secondary">
                                    {data.profitMargin >= 15
                                        ? 'Your business is performing well with healthy profit margins.'
                                        : 'Consider optimizing costs or increasing prices to improve profitability.'}
                                </Text>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Charts */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="Monthly Financial Trend" className="h-96">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={data.monthlyTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value: number, name: string) => [
                                        `₹${value.toLocaleString()}`,
                                        name === 'revenue' ? 'Revenue' :
                                            name === 'costs' ? 'Costs' : 'Profit'
                                    ]}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stackId="1"
                                    stroke="#52c41a"
                                    fill="#52c41a"
                                    fillOpacity={0.6}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="costs"
                                    stackId="2"
                                    stroke="#fa8c16"
                                    fill="#fa8c16"
                                    fillOpacity={0.6}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="profit"
                                    stackId="3"
                                    stroke="#1890ff"
                                    fill="#1890ff"
                                    fillOpacity={0.6}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Revenue vs Profit Comparison" className="h-96">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.monthlyTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value: number, name: string) => [
                                        `₹${value.toLocaleString()}`,
                                        name === 'revenue' ? 'Revenue' : 'Profit'
                                    ]}
                                />
                                <Bar dataKey="revenue" fill="#52c41a" name="revenue" />
                                <Bar dataKey="profit" fill="#1890ff" name="profit" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Top Revenue Products */}
            <Card title="Top Revenue Products" className="h-full">
                <Table
                    columns={topRevenueColumns}
                    dataSource={data.topRevenueProducts}
                    rowKey="productName"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} of ${total} products`,
                    }}
                    scroll={{ x: 600 }}
                />
            </Card>
        </div>
    );
};

export default FinancialDashboard;
