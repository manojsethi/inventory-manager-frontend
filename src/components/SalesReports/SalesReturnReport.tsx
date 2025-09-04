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
    Spin,
    message,
    Space,
    Tag,
} from 'antd';
import {
    DollarOutlined,
    ExclamationCircleOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { salesReportService, type SalesReturnReport as SalesReturnReportType } from '../../services/salesReportService';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Text } = Typography;

const SalesReturnReport: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<SalesReturnReportType | null>(null);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
        dayjs().subtract(90, 'days'),
        dayjs()
    ]);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const startDate = dateRange[0].format('YYYY-MM-DD');
            const endDate = dateRange[1].format('YYYY-MM-DD');

            const result = await salesReportService.getSalesReturnReport(startDate, endDate);
            setData(result);
        } catch (error) {
            message.error('Failed to load sales return report');
            console.error('Error loading sales return report:', error);
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

    // Prepare chart data for return trends
    const trendData = data?.returnTrends.map(item => ({
        month: item.month,
        returnCount: item.returnCount,
        returnAmount: item.returnAmount,
    })) || [];

    // Prepare pie chart data for return reasons
    const reasonData = data?.topReturnReasons.map(item => ({
        name: item.reason,
        value: item.count,
        amount: item.amount,
    })) || [];

    const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];

    const reasonColumns = [
        {
            title: 'Return Reason',
            dataIndex: 'reason',
            key: 'reason',
            render: (reason: string) => (
                <Tag color="red" icon={<ExclamationCircleOutlined />}>
                    {reason}
                </Tag>
            ),
        },
        {
            title: 'Count',
            dataIndex: 'count',
            key: 'count',
            sorter: (a: any, b: any) => a.count - b.count,
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (value: number) => `₹${value.toLocaleString()}`,
            sorter: (a: any, b: any) => a.amount - b.amount,
        },
        {
            title: 'Percentage',
            key: 'percentage',
            render: (record: any) => {
                const total = data?.topReturnReasons.reduce((sum, item) => sum + item.count, 0) || 1;
                const percentage = ((record.count / total) * 100).toFixed(1);
                return `${percentage}%`;
            },
        },
    ];

    const trendColumns = [
        {
            title: 'Month',
            dataIndex: 'month',
            key: 'month',
            sorter: (a: any, b: any) => dayjs(a.month).unix() - dayjs(b.month).unix(),
        },
        {
            title: 'Return Count',
            dataIndex: 'returnCount',
            key: 'returnCount',
            sorter: (a: any, b: any) => a.returnCount - b.returnCount,
        },
        {
            title: 'Return Amount',
            dataIndex: 'returnAmount',
            key: 'returnAmount',
            render: (value: number) => `₹${value.toLocaleString()}`,
            sorter: (a: any, b: any) => a.returnAmount - b.returnAmount,
        },
    ];

    if (!data) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spin size="large" />
            </div>
        );
    }

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
                            title="Total Returns"
                            value={data.totalReturns}
                            prefix={<ExclamationCircleOutlined />}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Total Return Amount"
                            value={data.totalReturnAmount}
                            prefix={<DollarOutlined />}
                            formatter={(value) => `₹${Number(value).toLocaleString()}`}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Return Rate"
                            value={data.returnRate}
                            prefix={<ExclamationCircleOutlined />}
                            suffix="%"
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Average Return Amount"
                            value={data.totalReturns > 0 ? data.totalReturnAmount / data.totalReturns : 0}
                            prefix={<DollarOutlined />}
                            formatter={(value) => `₹${Number(value).toFixed(2)}`}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Charts */}
            <Row gutter={16}>
                <Col span={12}>
                    <Card title="Return Trends Over Time" className="h-96">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip
                                    formatter={(value: number, name: string) => [
                                        name === 'returnAmount' ? `₹${value.toLocaleString()}` : value,
                                        name === 'returnAmount' ? 'Return Amount' : 'Return Count'
                                    ]}
                                />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="returnCount"
                                    stroke="#ff4d4f"
                                    strokeWidth={2}
                                    name="Return Count"
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="returnAmount"
                                    stroke="#ff7875"
                                    strokeWidth={2}
                                    name="Return Amount"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Return Reasons Distribution" className="h-96">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={reasonData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent || 0).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {reasonData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `${value} returns`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Card title="Return Amount by Reason" className="h-96">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={reasonData} layout="horizontal">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={100} />
                                <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                                <Bar dataKey="amount" fill="#ff4d4f" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Monthly Return Count" className="h-96">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="returnCount" fill="#ff7875" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Data Tables */}
            <Row gutter={16}>
                <Col span={12}>
                    <Card title="Top Return Reasons">
                        <Table
                            columns={reasonColumns}
                            dataSource={data.topReturnReasons}
                            rowKey="reason"
                            loading={loading}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Return Trends">
                        <Table
                            columns={trendColumns}
                            dataSource={data.returnTrends}
                            rowKey="month"
                            loading={loading}
                            pagination={{
                                pageSize: 6,
                                showSizeChanger: true,
                                showQuickJumper: true,
                            }}
                            size="small"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default SalesReturnReport;
