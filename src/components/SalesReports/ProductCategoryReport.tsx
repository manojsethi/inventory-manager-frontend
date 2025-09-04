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
    Tag,
} from 'antd';
import {
    DollarOutlined,
    ShoppingCartOutlined,
    BarChartOutlined,
    ReloadOutlined,
    TagsOutlined,
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { salesReportService, type ProductCategoryReport as ProductCategoryReportType } from '../../services/salesReportService';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Text } = Typography;

const ProductCategoryReport: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<ProductCategoryReportType[]>([]);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
        dayjs().subtract(30, 'days'),
        dayjs()
    ]);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const startDate = dateRange[0].format('YYYY-MM-DD');
            const endDate = dateRange[1].format('YYYY-MM-DD');

            const result = await salesReportService.getProductCategoryReport(startDate, endDate);
            setData(result);
        } catch (error) {
            message.error('Failed to load product category report');
            console.error('Error loading product category report:', error);
        } finally {
            setLoading(false);
        }
    }, [dateRange]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleDateRangeChange = (dates: any) => {
        if (dates) {
            setDateRange(dates);
        }
    };

    const handleRefresh = () => {
        loadData();
    };

    // Calculate summary statistics
    const totalCategories = data.length;
    const totalSales = data.reduce((sum, category) => sum + category.totalSales, 0);
    const totalQuantity = data.reduce((sum, category) => sum + category.totalQuantity, 0);
    const totalBills = data.reduce((sum, category) => sum + category.totalBills, 0);

    // Prepare chart data
    const chartData = data.map(category => ({
        name: category.categoryName.length > 15
            ? category.categoryName.substring(0, 15) + '...'
            : category.categoryName,
        fullName: category.categoryName,
        sales: category.totalSales,
        quantity: category.totalQuantity,
        bills: category.totalBills,
        avgPrice: category.averagePrice,
    }));

    // Prepare pie chart data
    const pieData = data.map(category => ({
        name: category.categoryName,
        value: category.totalSales,
    }));

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

    const columns = [
        {
            title: 'Category',
            key: 'category',
            render: (record: ProductCategoryReportType) => (
                <div className="flex items-center space-x-2">
                    <Tag color="blue" icon={<TagsOutlined />}>
                        {record.categoryName}
                    </Tag>
                </div>
            ),
            sorter: (a: ProductCategoryReportType, b: ProductCategoryReportType) =>
                a.categoryName.localeCompare(b.categoryName),
        },
        {
            title: 'Total Sales',
            dataIndex: 'totalSales',
            key: 'totalSales',
            render: (value: number) => `₹${value.toLocaleString()}`,
            sorter: (a: ProductCategoryReportType, b: ProductCategoryReportType) => a.totalSales - b.totalSales,
        },
        {
            title: 'Total Quantity',
            dataIndex: 'totalQuantity',
            key: 'totalQuantity',
            sorter: (a: ProductCategoryReportType, b: ProductCategoryReportType) => a.totalQuantity - b.totalQuantity,
        },
        {
            title: 'Total Bills',
            dataIndex: 'totalBills',
            key: 'totalBills',
            sorter: (a: ProductCategoryReportType, b: ProductCategoryReportType) => a.totalBills - b.totalBills,
        },
        {
            title: 'Average Price',
            dataIndex: 'averagePrice',
            key: 'averagePrice',
            render: (value: number) => `₹${value.toFixed(2)}`,
            sorter: (a: ProductCategoryReportType, b: ProductCategoryReportType) => a.averagePrice - b.averagePrice,
        },
        {
            title: 'Sales Share',
            key: 'salesShare',
            render: (record: ProductCategoryReportType) => {
                const percentage = totalSales > 0 ? ((record.totalSales / totalSales) * 100).toFixed(1) : '0.0';
                return (
                    <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                            ></div>
                        </div>
                        <span className="text-sm font-medium">{percentage}%</span>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="space-y-6">
            {/* Filters */}
            <Card>
                <div className="flex justify-between items-center">
                    <Space>
                        <Text strong>Date Range:</Text>
                        <RangePicker
                            value={dateRange}
                            onChange={handleDateRangeChange}
                            format="DD/MM/YYYY"
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
                            title="Total Categories"
                            value={totalCategories}
                            prefix={<TagsOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Total Sales"
                            value={totalSales}
                            prefix={<DollarOutlined />}
                            formatter={(value) => `₹${Number(value).toLocaleString()}`}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Total Quantity"
                            value={totalQuantity}
                            prefix={<BarChartOutlined />}
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
            </Row>

            {/* Charts */}
            <Row gutter={16}>
                <Col span={12}>
                    <Card title="Sales by Category" className="h-96">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData} layout="horizontal">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={120} />
                                <Tooltip
                                    formatter={(value: number, name: string, props: any) => [
                                        name === 'sales' ? `₹${value.toLocaleString()}` : value,
                                        name === 'sales' ? 'Sales Amount' : 'Quantity',
                                        props.payload.fullName
                                    ]}
                                />
                                <Bar dataKey="sales" fill="#1890ff" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Category Sales Distribution" className="h-96">
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
                <Col span={12}>
                    <Card title="Quantity Sold by Category" className="h-96">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value: number, name: string, props: any) => [
                                        value,
                                        'Quantity Sold',
                                        props.payload.fullName
                                    ]}
                                />
                                <Bar dataKey="quantity" fill="#52c41a" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Average Price by Category" className="h-96">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value: number, name: string, props: any) => [
                                        `₹${value.toFixed(2)}`,
                                        'Average Price',
                                        props.payload.fullName
                                    ]}
                                />
                                <Bar dataKey="avgPrice" fill="#722ed1" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Data Table */}
            <Card title="Product Category Performance">
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="categoryId"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} of ${total} categories`,
                    }}
                    scroll={{ x: 1000 }}
                />
            </Card>
        </div>
    );
};

export default ProductCategoryReport;
