import React, { useState, useEffect, useCallback } from 'react';
import {
    Card,
    Row,
    Col,
    Select,
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
    RiseOutlined,
    FallOutlined,
    ReloadOutlined,
    BarChartOutlined,
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { salesReportService, type SalesGrowthReport as SalesGrowthReportType } from '../../services/salesReportService';
import dayjs from 'dayjs';

const { Option } = Select;
const { Text } = Typography;

const SalesGrowthReport: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<SalesGrowthReportType[]>([]);
    const [selectedYear, setSelectedYear] = useState(dayjs().year());

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const result = await salesReportService.getSalesGrowthReport(selectedYear);
            setData(result);
        } catch (error) {
            message.error('Failed to load sales growth report');
            console.error('Error loading sales growth report:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedYear]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleYearChange = (year: number) => {
        setSelectedYear(year);
    };

    const handleRefresh = () => {
        loadData();
    };

    // Calculate summary statistics
    const totalGrowth = data.reduce((sum, item) => sum + item.growthAmount, 0);
    const averageGrowthPercentage = data.length > 0
        ? data.reduce((sum, item) => sum + item.growthPercentage, 0) / data.length
        : 0;
    const positiveGrowthMonths = data.filter(item => item.growthPercentage > 0).length;
    const negativeGrowthMonths = data.filter(item => item.growthPercentage < 0).length;

    // Prepare chart data
    const chartData = data.map(item => ({
        month: item.month,
        currentSales: item.currentSales,
        previousSales: item.previousSales,
        growthAmount: item.growthAmount,
        growthPercentage: item.growthPercentage,
    }));

    const columns = [
        {
            title: 'Month',
            dataIndex: 'month',
            key: 'month',
            sorter: (a: SalesGrowthReportType, b: SalesGrowthReportType) =>
                dayjs(a.month, 'MMMM YYYY').unix() - dayjs(b.month, 'MMMM YYYY').unix(),
        },
        {
            title: 'Current Sales',
            dataIndex: 'currentSales',
            key: 'currentSales',
            render: (value: number) => `₹${value.toLocaleString()}`,
            sorter: (a: SalesGrowthReportType, b: SalesGrowthReportType) => a.currentSales - b.currentSales,
        },
        {
            title: 'Previous Sales',
            dataIndex: 'previousSales',
            key: 'previousSales',
            render: (value: number) => `₹${value.toLocaleString()}`,
            sorter: (a: SalesGrowthReportType, b: SalesGrowthReportType) => a.previousSales - b.previousSales,
        },
        {
            title: 'Growth Amount',
            dataIndex: 'growthAmount',
            key: 'growthAmount',
            render: (value: number) => (
                <span style={{ color: value >= 0 ? '#3f8600' : '#cf1322' }}>
                    {value >= 0 ? '+' : ''}₹{value.toLocaleString()}
                </span>
            ),
            sorter: (a: SalesGrowthReportType, b: SalesGrowthReportType) => a.growthAmount - b.growthAmount,
        },
        {
            title: 'Growth %',
            dataIndex: 'growthPercentage',
            key: 'growthPercentage',
            render: (value: number) => (
                <Tag
                    color={value >= 0 ? 'green' : 'red'}
                    icon={value >= 0 ? <RiseOutlined /> : <FallOutlined />}
                >
                    {value >= 0 ? '+' : ''}{value.toFixed(1)}%
                </Tag>
            ),
            sorter: (a: SalesGrowthReportType, b: SalesGrowthReportType) => a.growthPercentage - b.growthPercentage,
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
                            title="Total Growth Amount"
                            value={totalGrowth}
                            prefix={<DollarOutlined />}
                            formatter={(value) => `${Number(value) >= 0 ? '+' : ''}₹${Number(value).toLocaleString()}`}
                            valueStyle={{ color: totalGrowth >= 0 ? '#3f8600' : '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Average Growth %"
                            value={averageGrowthPercentage}
                            prefix={<BarChartOutlined />}
                            suffix="%"
                            precision={1}
                            valueStyle={{ color: averageGrowthPercentage >= 0 ? '#3f8600' : '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Positive Growth Months"
                            value={positiveGrowthMonths}
                            prefix={<RiseOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Negative Growth Months"
                            value={negativeGrowthMonths}
                            prefix={<FallOutlined />}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Charts */}
            <Row gutter={16}>
                <Col span={12}>
                    <Card title="Sales Comparison: Current vs Previous" className="h-96">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value: number, name: string) => [
                                        `₹${value.toLocaleString()}`,
                                        name === 'currentSales' ? 'Current Sales' : 'Previous Sales'
                                    ]}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="currentSales"
                                    stroke="#1890ff"
                                    strokeWidth={2}
                                    name="Current Sales"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="previousSales"
                                    stroke="#52c41a"
                                    strokeWidth={2}
                                    name="Previous Sales"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Monthly Growth Percentage" className="h-96">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Growth %']}
                                />
                                <Bar
                                    dataKey="growthPercentage"
                                    fill="#1890ff"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Card title="Growth Amount by Month" className="h-96">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Growth Amount']}
                                />
                                <Bar
                                    dataKey="growthAmount"
                                    fill="#52c41a"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Sales Trend Analysis" className="h-96">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value: number, name: string) => [
                                        name === 'growthAmount' ? `₹${value.toLocaleString()}` : `${value.toFixed(1)}%`,
                                        name === 'growthAmount' ? 'Growth Amount' : 'Growth %'
                                    ]}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="growthAmount"
                                    stroke="#722ed1"
                                    strokeWidth={2}
                                    name="Growth Amount"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Data Table */}
            <Card title="Monthly Growth Analysis">
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

export default SalesGrowthReport;
