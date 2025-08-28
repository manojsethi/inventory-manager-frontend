import React from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, message } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DashboardOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    FileTextOutlined,
    BarChartOutlined,
    LogoutOutlined,
    TeamOutlined,
    TagsOutlined,
    ShoppingOutlined,
    DollarOutlined,
    PieChartOutlined,
    LineChartOutlined,
    AlertOutlined,
    ContainerOutlined,
    UserSwitchOutlined,
    FileProtectOutlined,
    BankOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services';
import SyncButton from '../SyncButton';

const { Sider } = Layout;

interface SidebarProps {
    collapsed: boolean;
    onCollapse: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onCollapse }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, setUser } = useAuth();

    const handleMenuClick = ({ key }: { key: string }) => {
        navigate(key);
    };

    const handleLogout = async () => {
        try {
            await authService.logout();
            setUser(null);
            message.success('Logged out successfully');
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            message.error('Logout failed');
        }
    };

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Profile',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            onClick: handleLogout,
        },
    ];

    const menuItems = [
        {
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        {
            key: 'inventory',
            icon: <ContainerOutlined />,
            label: 'Inventory Management',
            children: [
                {
                    key: '/product-types',
                    icon: <TagsOutlined />,
                    label: 'Product Types',
                },

                {
                    key: '/product-brands',
                    icon: <BankOutlined />,
                    label: 'Product Brands',
                },
                {
                    key: '/suppliers',
                    icon: <TeamOutlined />,
                    label: 'Suppliers',
                },
                {
                    key: '/products',
                    icon: <ShoppingOutlined />,
                    label: 'Products',
                },

                {
                    key: '/low-stock',
                    icon: <AlertOutlined />,
                    label: 'Low Stock Alert',
                },
            ],
        },
        {
            key: 'sales',
            icon: <ShoppingCartOutlined />,
            label: 'Sales Management',
            children: [
                {
                    key: '/sales',
                    icon: <DollarOutlined />,
                    label: 'Sales',
                },
                {
                    key: '/customers',
                    icon: <UserSwitchOutlined />,
                    label: 'Customers',
                },
                {
                    key: '/quick-sale',
                    icon: <ShoppingCartOutlined />,
                    label: 'Quick Sale',
                },
            ],
        },
        {
            key: 'financial',
            icon: <FileTextOutlined />,
            label: 'Financial Management',
            children: [
                {
                    key: '/bills',
                    icon: <FileProtectOutlined />,
                    label: 'Bills & Payments',
                },
                {
                    key: '/reports',
                    icon: <BarChartOutlined />,
                    label: 'Reports',
                },
            ],
        },
        {
            key: 'reports',
            icon: <PieChartOutlined />,
            label: 'Analytics & Reports',
            children: [
                {
                    key: '/reports/summary',
                    icon: <BarChartOutlined />,
                    label: 'Sales Summary',
                },
                {
                    key: '/reports/comparison',
                    icon: <LineChartOutlined />,
                    label: 'Comparison',
                },
                {
                    key: '/reports/stock-movement',
                    icon: <ContainerOutlined />,
                    label: 'Stock Movement',
                },
                {
                    key: '/reports/low-stock',
                    icon: <AlertOutlined />,
                    label: 'Low Stock Report',
                },
            ],
        },
    ];

    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            className="bg-white border-r border-gray-200"
            style={{
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                zIndex: 1000
            }}
            width={280}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200" style={{ height: '64px' }}>
                <div className="flex items-center">
                    <h1 className={`text-lg font-bold text-gray-800 ${collapsed ? 'hidden' : 'block'}`}>
                        Inventory Manager
                    </h1>
                </div>
                <Button
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={() => onCollapse(!collapsed)}
                    className="text-gray-600 hover:text-gray-800"
                />
            </div>

            {/* Menu - Takes remaining space */}
            <div style={{ height: 'calc(100vh - 192px)', overflowY: 'auto' }}>
                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={handleMenuClick}
                    className="border-0"
                    style={{
                        height: '100%',
                        textAlign: 'left'
                    }}
                />
            </div>

            {/* Sync section - Above user section */}
            <div className="p-4 border-t border-gray-200" style={{ height: '64px' }}>
                <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>

                    <SyncButton
                        size="small"
                        type="primary"
                        showText={!collapsed}
                        className="flex-1"
                    />
                </div>
            </div>

            {/* User section - Fixed at bottom */}
            <div className="p-4 border-t border-gray-200" style={{ height: '64px' }}>
                <Dropdown
                    menu={{ items: userMenuItems }}
                    placement="topRight"
                    trigger={['click']}
                >
                    <div className={`flex items-center cursor-pointer ${collapsed ? 'justify-center' : 'justify-between'}`}>
                        <div className="flex items-center">
                            <Avatar
                                icon={<UserOutlined />}
                                className="bg-blue-500"
                                size={32}
                            />
                            {!collapsed && (
                                <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-800">
                                        {user?.name || 'User'}
                                    </div>
                                    <div className="text-xs text-gray-500 capitalize">
                                        {user?.role || 'user'}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Dropdown>
            </div>
        </Sider>
    );
};

export default Sidebar; 