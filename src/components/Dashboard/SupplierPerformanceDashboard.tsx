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
    Rate,
} from 'antd';
import {
    ShopOutlined,
    RiseOutlined,
    FallOutlined,
    ReloadOutlined,
    TrophyOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { dashboardService, type SupplierPerformance } from '../../services/dashboardService';

const { Title, Text } = Typography;
const { Option } = Select;

const SupplierPerformanceDashboard: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<SupplierPerformance | null>(null);
    const [period, setPeriod] = useState('last30days');

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const result = await dashboardService.getSupplierPerformance(period);
            setData(result);
        } catch (error) {
            message.error('Failed to load supplier performance data');
            console.error('Error loading supplier performance data:', error);
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
                <Text type="secondary">Failed to load supplier performance data</Text>
            </div>
        );
    }

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const topSuppliersColumns = [
        {
            title: 'Supplier Name',
            dataIndex: 'supplierName',
            key: 'supplierName',
            render: (text: string) => (
                <div className="flex items-center space-x-3">
                    <ShopOutlined className="text-blue-500" />
                    <Text strong>{text}</Text>
                </div>
            ),
        },
        {
            title: 'Total Orders',
            dataIndex: 'totalOrders',
            key: 'totalOrders',
            render: (value: number) => (
                <Tag color="blue">{value} orders</Tag>
            ),
            sorter: (a: any, b: any) => a.totalOrders - b.totalOrders,
        },
        {
            title: 'Total Value',
            dataIndex: 'totalValue',
            key: 'totalValue',
            render: (value: number) => (
                <Text strong style={{ color: '#52c41a' }}>
                    ₹{value.toLocaleString()}
                </Text>
            ),
            sorter: (a: any, b: any) => a.totalValue - b.totalValue,
        },
        {
            title: 'Avg Delivery Time',
            dataIndex: 'averageDeliveryTime',
            key: 'averageDeliveryTime',
            render: (value: number) => (
                <div className="flex items-center space-x-2">
                    <ClockCircleOutlined />
                    <Text>{value} days</Text>
                </div>
            ),
            sorter: (a: any, b: any) => a.averageDeliveryTime - b.averageDeliveryTime,
        },
        {
            title: 'Performance Rating',
            key: 'rating',
            render: (record: any) => {
                const avgValue = record.totalValue / record.totalOrders;
                const rating = avgValue >= 10000 ? 5 : avgValue >= 5000 ? 4 : avgValue >= 2000 ? 3 : 2;
                return <Rate disabled defaultValue={rating} />
            },
        },
    ];

    const statCards = [
        {
            title: 'Total Suppliers',
            value: data.totalSuppliers,
            prefix: <ShopOutlined />,
            color: '#1890ff',
            suffix: 'suppliers',
        },
        {
            title: 'Active Suppliers',
            value: data.activeSuppliers,
            prefix: <RiseOutlined />,
            color: '#52c41a',
            suffix: 'suppliers',
        },
        {
            title: 'Inactive Suppliers',
            value: data.totalSuppliers - data.activeSuppliers,
            prefix: <FallOutlined />,
            color: '#fa8c16',
            suffix: 'suppliers',
        },
        {
            title: 'Activity Rate',
            value: Math.round((data.activeSuppliers / data.totalSuppliers) * 100),
            prefix: <TrophyOutlined />,
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
                        Supplier Performance
                    </Title>
                    <Text type="secondary">Supplier analytics and performance metrics</Text>
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

            {/* Supplier Insights */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={8}>
                    <Card title="Supplier Categories" className="h-full">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={data.supplierCategories}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent || 0).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {data.supplierCategories.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="Supplier Activity" className="h-full">
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <Text>Active Suppliers</Text>
                                    <Text strong style={{ color: '#52c41a' }}>
                                        {data.activeSuppliers}
                                    </Text>
                                </div>
                                <Progress
                                    percent={Math.round((data.activeSuppliers / data.totalSuppliers) * 100)}
                                    strokeColor="#52c41a"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <Text>Inactive Suppliers</Text>
                                    <Text strong style={{ color: '#fa8c16' }}>
                                        {data.totalSuppliers - data.activeSuppliers}
                                    </Text>
                                </div>
                                <Progress
                                    percent={Math.round(((data.totalSuppliers - data.activeSuppliers) / data.totalSuppliers) * 100)}
                                    strokeColor="#fa8c16"
                                />
                            </div>
                            <div className="text-center">
                                <Text type="secondary">
                                    Activity rate: {Math.round((data.activeSuppliers / data.totalSuppliers) * 100)}%
                                </Text>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="Supplier Health" className="h-full">
                        <div className="space-y-4">
                            <div className="text-center">
                                <div className="mb-2">
                                    <Text strong className="text-lg">Overall Performance</Text>
                                </div>
                                <Progress
                                    type="circle"
                                    percent={Math.round((data.activeSuppliers / data.totalSuppliers) * 100)}
                                    strokeColor="#52c41a"
                                    format={() => `${Math.round((data.activeSuppliers / data.totalSuppliers) * 100)}%`}
                                />
                                <div className="mt-2">
                                    <Tag color="green">Good</Tag>
                                </div>
                            </div>
                            <div className="text-center">
                                <Text type="secondary">
                                    Based on order frequency and delivery performance
                                </Text>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Charts */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="Supplier Categories Distribution" className="h-96">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.supplierCategories}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="category" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value: number, name: string) => [
                                        name === 'count' ? value : `₹${value.toLocaleString()}`,
                                        name === 'count' ? 'Count' : 'Total Value'
                                    ]}
                                />
                                <Bar dataKey="count" fill="#1890ff" name="count" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Supplier Value by Category" className="h-96">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.supplierCategories}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="category" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Total Value']}
                                />
                                <Bar dataKey="totalValue" fill="#52c41a" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Top Suppliers Table */}
            <Card title="Top Performing Suppliers" className="h-full">
                <Table
                    columns={topSuppliersColumns}
                    dataSource={data.topSuppliers}
                    rowKey="supplierName"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} of ${total} suppliers`,
                    }}
                    scroll={{ x: 600 }}
                />
            </Card>
        </div>
    );
};

export default SupplierPerformanceDashboard;
