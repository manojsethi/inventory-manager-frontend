import React from 'react';
import { Button, message } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services';

interface LogoutButtonProps {
    type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
    size?: 'large' | 'middle' | 'small';
    className?: string;
    children?: React.ReactNode;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
    type = 'default',
    size = 'middle',
    className = '',
    children = 'Logout'
}) => {
    const navigate = useNavigate();
    const { setUser } = useAuth();

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

    return (
        <Button
            type={type}
            size={size}
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            className={className}
        >
            {children}
        </Button>
    );
};

export default LogoutButton; 