import React, { useState } from 'react';
import { Card, Tabs, Typography } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';
import {
    DailySalesSummary,
    MonthlySalesReport,
    SalesReturnReport,
    TopCustomersReport,
    ProductCategoryReport,
    SalesGrowthReport,
    SalesPerformanceReport,
    AverageBillValueReport,
} from '../../components/SalesReports';

const { Title } = Typography;
const { TabPane } = Tabs;

const SalesReports: React.FC = () => {
    const [activeTab, setActiveTab] = useState('daily-summary');

    const tabItems = [
        {
            key: 'daily-summary',
            label: 'Daily Summary',
            children: <DailySalesSummary />,
        },
        {
            key: 'monthly-report',
            label: 'Monthly Report',
            children: <MonthlySalesReport />,
        },
        {
            key: 'performance',
            label: 'Performance',
            children: <SalesPerformanceReport />,
        },
        {
            key: 'returns',
            label: 'Returns',
            children: <SalesReturnReport />,
        },
        {
            key: 'top-customers',
            label: 'Top Customers',
            children: <TopCustomersReport />,
        },
        {
            key: 'product-category',
            label: 'Product Categories',
            children: <ProductCategoryReport />,
        },
        {
            key: 'growth',
            label: 'Growth Analysis',
            children: <SalesGrowthReport />,
        },
        {
            key: 'average-bill',
            label: 'Average Bill Value',
            children: <AverageBillValueReport />,
        },
    ];

    return (
        <div className="p-6">
            <div className="mb-6">
                <div className="flex items-center mb-4">
                    <BarChartOutlined className="text-2xl mr-3 text-blue-600" />
                    <Title level={2} className="mb-0">
                        Sales Reports
                    </Title>
                </div>
                <p className="text-gray-600">
                    Comprehensive sales analytics and reporting dashboard
                </p>
            </div>

            <Card>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    type="card"
                    items={tabItems}
                />
            </Card>
        </div>
    );
};

export default SalesReports;
