import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Progress, Typography, Spin } from 'antd';
import {
    ShoppingCartOutlined,
    UserOutlined,
    AlertOutlined,
} from '@ant-design/icons';
import { dashboardService, type DashboardStats } from '../services';
import { formatNumber } from '../utils/formatters';
import SyncButton from '../components/SyncButton';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const { stats: dashboardStats } = await dashboardService.getDashboardData();
            setStats(dashboardStats);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center">
                <Text type="secondary">Failed to load dashboard data</Text>
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Sales',
            value: stats.totalSales,
            prefix: <ShoppingCartOutlined />,
            color: '#1890ff',
        },
        {
            title: 'Total Revenue',
            value: stats.totalRevenue,
            prefix: '₹',
            suffix: ` (${formatNumber(stats.totalRevenue, { type: 'number' })})`,
            color: '#52c41a',
        },
        {
            title: 'Total Profit',
            value: stats.totalProfit,
            prefix: '₹',
            suffix: ` (${formatNumber(stats.totalProfit, { type: 'number' })})`,
            color: '#722ed1',
        },
        {
            title: 'Low Stock Items',
            value: stats.lowStockItems,
            prefix: <AlertOutlined />,
            color: '#fa8c16',
        },
    ];

    const topSellingColumns = [
        {
            title: 'Product',
            dataIndex: 'productName',
            key: 'productName',
        },
        {
            title: 'Units Sold',
            dataIndex: 'unitsSold',
            key: 'unitsSold',
            render: (value: number) => <Text strong>{value}</Text>,
        },
        {
            title: 'Revenue',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (value: number) => formatNumber(value),
        },
    ];

    const recentSalesColumns = [
        {
            title: 'Sale #',
            dataIndex: 'saleNumber',
            key: 'saleNumber',
        },
        {
            title: 'Customer',
            dataIndex: 'customerName',
            key: 'customerName',
        },
        {
            title: 'Amount',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (value: number) => formatNumber(value),
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <Title level={2} className="mb-2">
                        Dashboard Overview
                    </Title>
                    <Text type="secondary">Last 7 days performance summary</Text>
                </div>
                <SyncButton
                    size="middle"
                    type="primary"
                    showText={true}
                    className="ml-4"
                />
            </div>

            <Row gutter={[16, 16]}>
                {statCards.map((card, index) => (
                    <Col xs={24} sm={12} lg={6} key={index}>
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

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="Top Selling Items" className="h-full">
                        <Table
                            dataSource={stats.topSellingItems}
                            columns={topSellingColumns}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Recent Sales" className="h-full">
                        <Table
                            dataSource={stats.recentSales}
                            columns={recentSalesColumns}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="Quick Actions" className="h-full">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Card size="small" className="text-center cursor-pointer hover:shadow-md transition-shadow">
                                    <ShoppingCartOutlined className="text-2xl text-blue-500 mb-2" />
                                    <div>New Sale</div>
                                </Card>
                                <Card size="small" className="text-center cursor-pointer hover:shadow-md transition-shadow">
                                    <UserOutlined className="text-2xl text-green-500 mb-2" />
                                    <div>Add Customer</div>
                                </Card>
                                <Card size="small" className="text-center cursor-pointer hover:shadow-md transition-shadow">
                                    <ShoppingCartOutlined className="text-2xl text-purple-500 mb-2" />
                                    <div>Add Product</div>
                                </Card>
                                <Card size="small" className="text-center cursor-pointer hover:shadow-md transition-shadow">
                                    <AlertOutlined className="text-2xl text-orange-500 mb-2" />
                                    <div>Low Stock</div>
                                </Card>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="System Status" className="h-full">
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <Text>Database Connection</Text>
                                    <Text type="success">Connected</Text>
                                </div>
                                <Progress percent={100} status="success" size="small" />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <Text>API Status</Text>
                                    <Text type="success">Online</Text>
                                </div>
                                <Progress percent={100} status="success" size="small" />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <Text>Storage</Text>
                                    <Text type="warning">75% Used</Text>
                                </div>
                                <Progress percent={75} status="active" size="small" />
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard; 