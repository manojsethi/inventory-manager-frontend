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
    RiseOutlined,
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { salesReportService, type SalesPerformanceByDate as SalesPerformanceByDateType } from '../../services/salesReportService';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Text } = Typography;

const SalesPerformanceReport: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<SalesPerformanceByDateType[]>([]);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
        dayjs().subtract(30, 'days'),
        dayjs()
    ]);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const startDate = dateRange[0].format('YYYY-MM-DD');
            const endDate = dateRange[1].format('YYYY-MM-DD');

            const result = await salesReportService.getSalesPerformanceByDate(startDate, endDate);
            setData(result);
        } catch (error) {
            message.error('Failed to load sales performance report');
            console.error('Error loading sales performance report:', error);
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
    const totalSales = data.reduce((sum, item) => sum + item.totalSales, 0);
    const totalBills = data.reduce((sum, item) => sum + item.totalBills, 0);
    const totalProfit = data.reduce((sum, item) => sum + item.profit, 0);
    const averageProfitMargin = data.length > 0
        ? data.reduce((sum, item) => sum + item.profitMargin, 0) / data.length
        : 0;

    // Prepare chart data
    const chartData = data.map(item => ({
        date: dayjs(item.date).format('MMM DD'),
        sales: item.totalSales,
        bills: item.totalBills,
        quantity: item.totalQuantity,
        profit: item.profit,
        profitMargin: item.profitMargin,
    }));

    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
            sorter: (a: SalesPerformanceByDateType, b: SalesPerformanceByDateType) =>
                dayjs(a.date).unix() - dayjs(b.date).unix(),
        },
        {
            title: 'Total Sales',
            dataIndex: 'totalSales',
            key: 'totalSales',
            render: (value: number) => `₹${value.toLocaleString()}`,
            sorter: (a: SalesPerformanceByDateType, b: SalesPerformanceByDateType) => a.totalSales - b.totalSales,
        },
        {
            title: 'Total Bills',
            dataIndex: 'totalBills',
            key: 'totalBills',
            sorter: (a: SalesPerformanceByDateType, b: SalesPerformanceByDateType) => a.totalBills - b.totalBills,
        },
        {
            title: 'Total Quantity',
            dataIndex: 'totalQuantity',
            key: 'totalQuantity',
            sorter: (a: SalesPerformanceByDateType, b: SalesPerformanceByDateType) => a.totalQuantity - b.totalQuantity,
        },
        {
            title: 'Profit',
            dataIndex: 'profit',
            key: 'profit',
            render: (value: number) => (
                <span style={{ color: value >= 0 ? '#3f8600' : '#cf1322' }}>
                    ₹{value.toLocaleString()}
                </span>
            ),
            sorter: (a: SalesPerformanceByDateType, b: SalesPerformanceByDateType) => a.profit - b.profit,
        },
        {
            title: 'Profit Margin',
            dataIndex: 'profitMargin',
            key: 'profitMargin',
            render: (value: number) => (
                <Tag
                    color={value >= 0 ? 'green' : 'red'}
                    icon={<RiseOutlined />}
                >
                    {value.toFixed(1)}%
                </Tag>
            ),
            sorter: (a: SalesPerformanceByDateType, b: SalesPerformanceByDateType) => a.profitMargin - b.profitMargin,
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
                            title="Total Bills"
                            value={totalBills}
                            prefix={<ShoppingCartOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Total Profit"
                            value={totalProfit}
                            prefix={<RiseOutlined />}
                            formatter={(value) => `₹${Number(value).toLocaleString()}`}
                            valueStyle={{ color: totalProfit >= 0 ? '#3f8600' : '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Avg Profit Margin"
                            value={averageProfitMargin}
                            prefix={<BarChartOutlined />}
                            suffix="%"
                            precision={1}
                            valueStyle={{ color: averageProfitMargin >= 0 ? '#3f8600' : '#cf1322' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Charts */}
            <Row gutter={16}>
                <Col span={12}>
                    <Card title="Sales vs Profit Trend" className="h-96">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip
                                    formatter={(value: number, name: string) => [
                                        name === 'sales' || name === 'profit' ? `₹${value.toLocaleString()}` : value,
                                        name === 'sales' ? 'Sales' : name === 'profit' ? 'Profit' : 'Bills'
                                    ]}
                                />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#1890ff"
                                    strokeWidth={2}
                                    name="Sales"
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="profit"
                                    stroke="#52c41a"
                                    strokeWidth={2}
                                    name="Profit"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Profit Margin Trend" className="h-96">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Profit Margin']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="profitMargin"
                                    stroke="#722ed1"
                                    fill="#722ed1"
                                    fillOpacity={0.3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Card title="Daily Sales Performance" className="h-96">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Sales']}
                                />
                                <Bar dataKey="sales" fill="#1890ff" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Daily Profit Performance" className="h-96">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Profit']}
                                />
                                <Bar
                                    dataKey="profit"
                                    fill="#52c41a"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Data Table */}
            <Card title="Daily Performance Data">
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="date"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} of ${total} days`,
                    }}
                    scroll={{ x: 800 }}
                />
            </Card>
        </div>
    );
};

export default SalesPerformanceReport;
