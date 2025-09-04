import React, { useState } from 'react';
import { Tabs, Typography } from 'antd';
import {
    DashboardOutlined,
    ShoppingCartOutlined,
    DollarOutlined,
    UserOutlined,
    ShopOutlined,
} from '@ant-design/icons';
import {
    DashboardOverview,
    InventoryDashboard,
    FinancialDashboard,
    CustomerAnalyticsDashboard,
    SupplierPerformanceDashboard,
} from '../components/Dashboard';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const tabItems = [
        {
            key: 'overview',
            label: (
                <span>
                    <DashboardOutlined />
                    Overview
                </span>
            ),
            children: <DashboardOverview />,
        },
        // {
        //     key: 'inventory',
        //     label: (
        //         <span>
        //             <ShoppingCartOutlined />
        //             Inventory
        //         </span>
        //     ),
        //     children: <InventoryDashboard />,
        // },
        // {
        //     key: 'financial',
        //     label: (
        //         <span>
        //             <DollarOutlined />
        //             Financial
        //         </span>
        //     ),
        //     children: <FinancialDashboard />,
        // },
        // {
        //     key: 'customers',
        //     label: (
        //         <span>
        //             <UserOutlined />
        //             Customers
        //         </span>
        //     ),
        //     children: <CustomerAnalyticsDashboard />,
        // },
        // {
        //     key: 'suppliers',
        //     label: (
        //         <span>
        //             <ShopOutlined />
        //             Suppliers
        //         </span>
        //     ),
        //     children: <SupplierPerformanceDashboard />,
        // },
    ];

    return (
        <div className="space-y-6">
            <div>
                <Title level={2} className="mb-2">
                    Business Dashboard
                </Title>
                <Text type="secondary">Comprehensive business analytics and insights</Text>
            </div>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                size="large"
                className="dashboard-tabs"
            />
        </div>
    );
};

export default Dashboard; 