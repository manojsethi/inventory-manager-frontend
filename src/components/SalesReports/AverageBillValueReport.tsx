import React, { useState, useEffect, useCallback } from 'react';
import {
    Card,
    Row,
    Col,
    DatePicker,
    Button,
    Statistic,
    Typography,
    Spin,
    message,
    Space,
    Progress,
} from 'antd';
import {
    ShoppingCartOutlined,
    ReloadOutlined,
    BarChartOutlined,
    RiseOutlined,
} from '@ant-design/icons';
import { salesReportService, type AverageBillValueReport as AverageBillValueReportType } from '../../services/salesReportService';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const AverageBillValueReport: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<AverageBillValueReportType | null>(null);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
        dayjs().subtract(30, 'days'),
        dayjs()
    ]);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const startDate = dateRange[0].format('YYYY-MM-DD');
            const endDate = dateRange[1].format('YYYY-MM-DD');

            const result = await salesReportService.getAverageBillValueReport(startDate, endDate);
            setData(result);
        } catch (error) {
            message.error('Failed to load average bill value report');
            console.error('Error loading average bill value report:', error);
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

    if (!data) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    // Calculate additional metrics
    const totalRevenue = data.totalSales;
    const totalBills = data.totalBills;
    const averageBillValue = data.averageBillValue;
    const period = data.period;

    // Calculate some performance indicators
    const billsPerDay = totalBills / Math.max(1, dayjs(dateRange[1]).diff(dayjs(dateRange[0]), 'days') + 1);
    const revenuePerDay = totalRevenue / Math.max(1, dayjs(dateRange[1]).diff(dayjs(dateRange[0]), 'days') + 1);

    // Performance indicators
    const performanceIndicators = [
        {
            title: 'Average Bill Value',
            value: averageBillValue,
            prefix: '₹',
            suffix: '',
            color: '#1890ff',
            description: 'Average amount per transaction',
        },
        {
            title: 'Total Revenue',
            value: totalRevenue,
            prefix: '₹',
            suffix: '',
            color: '#52c41a',
            description: 'Total sales amount for the period',
        },
        {
            title: 'Total Bills',
            value: totalBills,
            prefix: '',
            suffix: '',
            color: '#722ed1',
            description: 'Total number of transactions',
        },
        {
            title: 'Bills per Day',
            value: billsPerDay,
            prefix: '',
            suffix: '/day',
            color: '#fa8c16',
            description: 'Average transactions per day',
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

            {/* Period Information */}
            <Card>
                <div className="text-center">
                    <Title level={3} className="mb-2">Report Period</Title>
                    <Text type="secondary" className="text-lg">{period}</Text>
                </div>
            </Card>

            {/* Main Statistics */}
            <Row gutter={16}>
                {performanceIndicators.map((indicator, index) => (
                    <Col span={6} key={index}>
                        <Card>
                            <Statistic
                                title={indicator.title}
                                value={indicator.value}
                                prefix={indicator.prefix}
                                suffix={indicator.suffix}
                                formatter={(value) =>
                                    indicator.prefix === '₹'
                                        ? `₹${Number(value).toLocaleString()}`
                                        : Number(value).toFixed(1)
                                }
                                valueStyle={{ color: indicator.color }}
                            />
                            <div className="mt-2">
                                <Text type="secondary" className="text-xs">
                                    {indicator.description}
                                </Text>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Performance Analysis */}
            <Row gutter={16}>
                <Col span={12}>
                    <Card title="Revenue Analysis" className="h-64">
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <Text strong>Daily Revenue Average</Text>
                                    <Text strong>₹{revenuePerDay.toLocaleString()}</Text>
                                </div>
                                <Progress
                                    percent={Math.min(100, (revenuePerDay / 10000) * 100)}
                                    strokeColor="#52c41a"
                                    showInfo={false}
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <Text strong>Transaction Volume</Text>
                                    <Text strong>{billsPerDay.toFixed(1)} bills/day</Text>
                                </div>
                                <Progress
                                    percent={Math.min(100, (billsPerDay / 50) * 100)}
                                    strokeColor="#1890ff"
                                    showInfo={false}
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <Text strong>Bill Value Efficiency</Text>
                                    <Text strong>₹{averageBillValue.toFixed(2)}</Text>
                                </div>
                                <Progress
                                    percent={Math.min(100, (averageBillValue / 1000) * 100)}
                                    strokeColor="#722ed1"
                                    showInfo={false}
                                />
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Performance Insights" className="h-64">
                        <div className="space-y-4">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <BarChartOutlined className="text-blue-600" />
                                    <Text strong className="text-blue-800">Transaction Analysis</Text>
                                </div>
                                <Text className="text-blue-700">
                                    Your average bill value of ₹{averageBillValue.toFixed(2)} indicates{' '}
                                    {averageBillValue > 500 ? 'strong' : averageBillValue > 300 ? 'moderate' : 'room for improvement in'}
                                    {' '}customer spending per transaction.
                                </Text>
                            </div>

                            <div className="p-4 bg-green-50 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <RiseOutlined className="text-green-600" />
                                    <Text strong className="text-green-800">Revenue Performance</Text>
                                </div>
                                <Text className="text-green-700">
                                    With {totalBills} transactions generating ₹{totalRevenue.toLocaleString()} in revenue,
                                    your business shows{' '}
                                    {revenuePerDay > 10000 ? 'excellent' : revenuePerDay > 5000 ? 'good' : 'steady'}
                                    {' '}daily performance.
                                </Text>
                            </div>

                            <div className="p-4 bg-purple-50 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <ShoppingCartOutlined className="text-purple-600" />
                                    <Text strong className="text-purple-800">Growth Opportunities</Text>
                                </div>
                                <Text className="text-purple-700">
                                    Consider strategies to increase average bill value through upselling,
                                    bundling, or premium product promotion.
                                </Text>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Key Metrics Summary */}
            <Card title="Key Metrics Summary">
                <Row gutter={16}>
                    <Col span={8}>
                        <div className="text-center p-4 border rounded-lg">
                            <div className="text-2xl font-bold text-blue-600 mb-2">
                                ₹{averageBillValue.toFixed(2)}
                            </div>
                            <Text type="secondary">Average Bill Value</Text>
                        </div>
                    </Col>
                    <Col span={8}>
                        <div className="text-center p-4 border rounded-lg">
                            <div className="text-2xl font-bold text-green-600 mb-2">
                                {billsPerDay.toFixed(1)}
                            </div>
                            <Text type="secondary">Bills per Day</Text>
                        </div>
                    </Col>
                    <Col span={8}>
                        <div className="text-center p-4 border rounded-lg">
                            <div className="text-2xl font-bold text-purple-600 mb-2">
                                ₹{revenuePerDay.toLocaleString()}
                            </div>
                            <Text type="secondary">Daily Revenue</Text>
                        </div>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default AverageBillValueReport;
