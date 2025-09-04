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
} from 'antd';
import {
    DollarOutlined,
    ShoppingCartOutlined,
    BarChartOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { salesReportService, type DailySalesSummary as DailySalesSummaryType } from '../../services/salesReportService';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Text } = Typography;

const DailySalesSummary: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<DailySalesSummaryType[]>([]);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
        dayjs().subtract(30, 'days'),
        dayjs()
    ]);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const startDate = dateRange[0].format('YYYY-MM-DD');
            const endDate = dateRange[1].format('YYYY-MM-DD');

            const result = await salesReportService.getDailySalesSummary(startDate, endDate);
            setData(result);
        } catch (error) {
            message.error('Failed to load daily sales summary');
            console.error('Error loading daily sales summary:', error);
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
    const totalQuantity = data.reduce((sum, item) => sum + item.totalQuantity, 0);
    const averageBillValue = totalBills > 0 ? totalSales / totalBills : 0;

    // Prepare chart data
    const chartData = data.map(item => ({
        date: dayjs(item.date).format('MMM DD'),
        sales: item.totalSales,
        bills: item.totalBills,
        quantity: item.totalQuantity,
        avgBillValue: item.averageBillValue,
    }));

    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
            sorter: (a: DailySalesSummaryType, b: DailySalesSummaryType) =>
                dayjs(a.date).unix() - dayjs(b.date).unix(),
        },
        {
            title: 'Total Sales',
            dataIndex: 'totalSales',
            key: 'totalSales',
            render: (value: number) => `₹${value.toLocaleString()}`,
            sorter: (a: DailySalesSummaryType, b: DailySalesSummaryType) => a.totalSales - b.totalSales,
        },
        {
            title: 'Total Bills',
            dataIndex: 'totalBills',
            key: 'totalBills',
            sorter: (a: DailySalesSummaryType, b: DailySalesSummaryType) => a.totalBills - b.totalBills,
        },
        {
            title: 'Total Quantity',
            dataIndex: 'totalQuantity',
            key: 'totalQuantity',
            sorter: (a: DailySalesSummaryType, b: DailySalesSummaryType) => a.totalQuantity - b.totalQuantity,
        },
        {
            title: 'Avg Bill Value',
            dataIndex: 'averageBillValue',
            key: 'averageBillValue',
            render: (value: number) => `₹${value.toFixed(2)}`,
            sorter: (a: DailySalesSummaryType, b: DailySalesSummaryType) => a.averageBillValue - b.averageBillValue,
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
                            title="Total Quantity"
                            value={totalQuantity}
                            prefix={<BarChartOutlined />}
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
                    <Card title="Daily Sales Trend" className="h-96">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value: number, name: string) => [
                                        name === 'sales' ? `₹${value.toLocaleString()}` : value,
                                        name === 'sales' ? 'Sales' : 'Bills'
                                    ]}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#1890ff"
                                    strokeWidth={2}
                                    name="Sales"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Daily Bills Count" className="h-96">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="bills" fill="#52c41a" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Data Table */}
            <Card title="Daily Sales Data">
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

export default DailySalesSummary;
