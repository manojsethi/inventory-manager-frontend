import React, { useState } from 'react';
import { Layout } from 'antd';
import Sidebar from './Sidebar';

const { Content } = Layout;

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <Layout className="min-h-screen">
            <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
            <Layout
                className="min-h-screen"
                style={{
                    marginLeft: collapsed ? '80px' : '280px',
                    transition: 'margin-left 0.2s'
                }}
            >
                <Content className="bg-gray-50 p-6 overflow-auto">
                    <div className="bg-white rounded-lg shadow-sm p-6 min-h-full">
                        {children}
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout; 