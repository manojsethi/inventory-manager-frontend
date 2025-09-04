import React, { useState, useEffect } from 'react';
import {
    Card,
    Row,
    Col,
    Select,
    Button,
    Table,
    Statistic,
    Typography,
    Spin,
    message,
    Space,
} from 'antd';
import {
    DollarOutlined,
    ShoppingCartOutlined,
    BarChartOutlined,
    ReloadOutlined,
    RiseOutlined,
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { salesReportService, type MonthlySalesReport as MonthlySalesReportType } from '../../services/salesReportService';
import dayjs from 'dayjs';

const { Option } = Select;
const { Title, Text } = Typography;

const MonthlySalesReport: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<MonthlySalesReportType[]>([]);
    const [selectedYear, setSelectedYear] = useState(dayjs().year());

    const loadData = async () => {
        try {
            setLoading(true);
            const result = await salesReportService.getMonthlySalesReport(selectedYear);
            setData(result);
        } catch (error) {
            message.error('Failed to load monthly sales report');
            console.error('Error loading monthly sales report:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [selectedYear]);

    const handleYearChange = (year: number) => {
        setSelectedYear(year);
    };

    const handleRefresh = () => {
        loadData();
    };

    // Calculate summary statistics
    const totalSales = data.reduce((sum, item) => sum + item.totalSales, 0);
    const totalBills = data.reduce((sum, item) => sum + item.totalBills, 0);
    const totalQuantity = data.reduce((sum, item) => sum + item.totalQuantity, 0);
    const averageBillValue = totalBills > 0 ? totalSales / totalBills : 0;

    // Calculate growth
    const currentMonth = data[data.length - 1];
    const previousMonth = data[data.length - 2];
    const growthPercentage = previousMonth && currentMonth
        ? ((currentMonth.totalSales - previousMonth.totalSales) / previousMonth.totalSales) * 100
        : 0;

    // Prepare chart data
    const chartData = data.map(item => ({
        month: item.month,
        sales: item.totalSales,
        bills: item.totalBills,
        quantity: item.totalQuantity,
        avgBillValue: item.averageBillValue,
    }));

    // Prepare pie chart data for monthly distribution
    const pieData = data.map(item => ({
        name: item.month,
        value: item.totalSales,
    }));

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

    const columns = [
        {
            title: 'Month',
            dataIndex: 'month',
            key: 'month',
            sorter: (a: MonthlySalesReportType, b: MonthlySalesReportType) =>
                dayjs(a.month, 'MMMM YYYY').unix() - dayjs(b.month, 'MMMM YYYY').unix(),
        },
        {
            title: 'Total Sales',
            dataIndex: 'totalSales',
            key: 'totalSales',
            render: (value: number) => `₹${value.toLocaleString()}`,
            sorter: (a: MonthlySalesReportType, b: MonthlySalesReportType) => a.totalSales - b.totalSales,
        },
        {
            title: 'Total Bills',
            dataIndex: 'totalBills',
            key: 'totalBills',
            sorter: (a: MonthlySalesReportType, b: MonthlySalesReportType) => a.totalBills - b.totalBills,
        },
        {
            title: 'Total Quantity',
            dataIndex: 'totalQuantity',
            key: 'totalQuantity',
            sorter: (a: MonthlySalesReportType, b: MonthlySalesReportType) => a.totalQuantity - b.totalQuantity,
        },
        {
            title: 'Avg Bill Value',
            dataIndex: 'averageBillValue',
            key: 'averageBillValue',
            render: (value: number) => `₹${value.toFixed(2)}`,
            sorter: (a: MonthlySalesReportType, b: MonthlySalesReportType) => a.averageBillValue - b.averageBillValue,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Filters */}
            <Card>
                <div className="flex justify-between items-center">
                    <Space>
                        <Text strong>Year:</Text>
                        <Select
                            value={selectedYear}
                            onChange={handleYearChange}
                            style={{ width: 120 }}
                        >
                            {Array.from({ length: 5 }, (_, i) => dayjs().year() - i).map(year => (
                                <Option key={year} value={year}>{year}</Option>
                            ))}
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
                            title="Monthly Growth"
                            value={growthPercentage}
                            prefix={<RiseOutlined />}
                            suffix="%"
                            valueStyle={{ color: growthPercentage >= 0 ? '#3f8600' : '#cf1322' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Charts */}
            <Row gutter={16}>
                <Col span={12}>
                    <Card title="Monthly Sales Trend" className="h-96">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
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
                    <Card title="Monthly Sales Distribution" className="h-96">
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
                    <Card title="Monthly Bills Count" className="h-96">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="bills" fill="#52c41a" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Average Bill Value Trend" className="h-96">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`} />
                                <Line
                                    type="monotone"
                                    dataKey="avgBillValue"
                                    stroke="#722ed1"
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Data Table */}
            <Card title="Monthly Sales Data">
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="month"
                    loading={loading}
                    pagination={{
                        pageSize: 12,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} of ${total} months`,
                    }}
                    scroll={{ x: 800 }}
                />
            </Card>
        </div>
    );
};

export default MonthlySalesReport;
