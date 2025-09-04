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
    Alert,
} from 'antd';
import {
    ShoppingCartOutlined,
    AlertOutlined,
    ReloadOutlined,
    BarChartOutlined,
    DollarOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { dashboardService, type InventoryOverview } from '../../services/dashboardService';

const { Title, Text } = Typography;

const InventoryDashboard: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<InventoryOverview | null>(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const result = await dashboardService.getInventoryOverview();
            setData(result);
        } catch (error) {
            message.error('Failed to load inventory data');
            console.error('Error loading inventory data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

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
                <Text type="secondary">Failed to load inventory data</Text>
            </div>
        );
    }

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    // Prepare chart data
    const categoryData = data.categoryBreakdown.map(item => ({
        name: item.category,
        count: item.count,
        value: item.value,
    }));

    const stockStatusData = [
        { name: 'In Stock', value: data.totalProducts - data.lowStockItems - data.outOfStockItems, color: '#52c41a' },
        { name: 'Low Stock', value: data.lowStockItems, color: '#fa8c16' },
        { name: 'Out of Stock', value: data.outOfStockItems, color: '#f5222d' },
    ];

    const topProductsColumns = [
        {
            title: 'Product Name',
            dataIndex: 'productName',
            key: 'productName',
        },
        {
            title: 'Current Stock',
            dataIndex: 'currentStock',
            key: 'currentStock',
            render: (value: number, record: any) => (
                <span style={{ color: value <= record.minStock ? '#f5222d' : '#52c41a' }}>
                    {value}
                </span>
            ),
        },
        {
            title: 'Min Stock',
            dataIndex: 'minStock',
            key: 'minStock',
        },
        {
            title: 'Status',
            key: 'status',
            render: (record: any) => {
                if (record.currentStock === 0) {
                    return <Tag color="red">Out of Stock</Tag>;
                } else if (record.currentStock <= record.minStock) {
                    return <Tag color="orange">Low Stock</Tag>;
                } else {
                    return <Tag color="green">In Stock</Tag>;
                }
            },
        },
        {
            title: 'Value',
            dataIndex: 'value',
            key: 'value',
            render: (value: number) => `₹${value.toLocaleString()}`,
        },
    ];

    const statCards = [
        {
            title: 'Total Products',
            value: data.totalProducts,
            prefix: <ShoppingCartOutlined />,
            color: '#1890ff',
            suffix: 'items',
        },
        {
            title: 'Low Stock Items',
            value: data.lowStockItems,
            prefix: <AlertOutlined />,
            color: '#fa8c16',
            suffix: 'items',
        },
        {
            title: 'Out of Stock',
            value: data.outOfStockItems,
            prefix: <ExclamationCircleOutlined />,
            color: '#f5222d',
            suffix: 'items',
        },
        {
            title: 'Total Inventory Value',
            value: data.totalInventoryValue,
            prefix: <DollarOutlined />,
            color: '#52c41a',
            suffix: '₹',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <Title level={2} className="mb-2">
                        Inventory Dashboard
                    </Title>
                    <Text type="secondary">Stock levels and inventory management</Text>
                </div>
                <Button
                    type="primary"
                    icon={<ReloadOutlined />}
                    onClick={handleRefresh}
                    loading={loading}
                >
                    Refresh
                </Button>
            </div>

            {/* Alerts */}
            {data.lowStockItems > 0 && (
                <Alert
                    message={`${data.lowStockItems} items are running low on stock`}
                    type="warning"
                    showIcon
                    action={
                        <Button size="small" type="text">
                            View Details
                        </Button>
                    }
                />
            )}
            {data.outOfStockItems > 0 && (
                <Alert
                    message={`${data.outOfStockItems} items are out of stock`}
                    type="error"
                    showIcon
                    action={
                        <Button size="small" type="text">
                            Restock Now
                        </Button>
                    }
                />
            )}

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

            {/* Charts */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="Stock Status Distribution" className="h-96">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={stockStatusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent || 0).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {stockStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Category Breakdown" className="h-96">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={categoryData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value: number, name: string) => [
                                        name === 'count' ? value : `₹${value.toLocaleString()}`,
                                        name === 'count' ? 'Count' : 'Value'
                                    ]}
                                />
                                <Bar dataKey="count" fill="#1890ff" name="count" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Inventory Value by Category */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="Inventory Value by Category" className="h-96">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={categoryData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Value']}
                                />
                                <Bar dataKey="value" fill="#52c41a" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Stock Health Overview" className="h-96">
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <Text>Overall Stock Health</Text>
                                    <Text strong style={{ color: '#52c41a' }}>
                                        {Math.round(((data.totalProducts - data.lowStockItems - data.outOfStockItems) / data.totalProducts) * 100)}%
                                    </Text>
                                </div>
                                <Progress
                                    percent={Math.round(((data.totalProducts - data.lowStockItems - data.outOfStockItems) / data.totalProducts) * 100)}
                                    status="active"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <Text>Low Stock Alert</Text>
                                    <Text strong style={{ color: '#fa8c16' }}>
                                        {Math.round((data.lowStockItems / data.totalProducts) * 100)}%
                                    </Text>
                                </div>
                                <Progress
                                    percent={Math.round((data.lowStockItems / data.totalProducts) * 100)}
                                    status="active"
                                    strokeColor="#fa8c16"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <Text>Out of Stock</Text>
                                    <Text strong style={{ color: '#f5222d' }}>
                                        {Math.round((data.outOfStockItems / data.totalProducts) * 100)}%
                                    </Text>
                                </div>
                                <Progress
                                    percent={Math.round((data.outOfStockItems / data.totalProducts) * 100)}
                                    status="active"
                                    strokeColor="#f5222d"
                                />
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Top Products Table */}
            <Card title="Critical Stock Items" className="h-full">
                <Table
                    columns={topProductsColumns}
                    dataSource={data.topProducts}
                    rowKey="productName"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} of ${total} items`,
                    }}
                    scroll={{ x: 600 }}
                />
            </Card>
        </div>
    );
};

export default InventoryDashboard;
