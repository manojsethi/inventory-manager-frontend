import React from 'react';
import { Form, Input, Button, Card, Typography, Divider, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services';

const { Title, Text } = Typography;

const Login: React.FC = () => {
    const { setUser, setLoading, loading } = useAuth();

    const onFinish = async (values: { email: string; password: string }) => {
        try {
            setLoading(true);
            const response = await authService.login(values);
            setUser(response.data?.user);
            message.success('Login successful!');
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Login failed';
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-lg">
                <div className="text-center mb-8">
                    <Title level={2} className="text-gray-800 mb-2">
                        Inventory Manager
                    </Title>
                    <Text type="secondary">Sign in to your account</Text>
                </div>

                <Form
                    name="login"
                    onFinish={onFinish}
                    autoComplete="off"
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please input your email!' },
                            { type: 'email', message: 'Please enter a valid email!' },
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined className="text-gray-400" />}
                            placeholder="Enter your email"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[
                            { required: true, message: 'Please input your password!' },
                            { min: 6, message: 'Password must be at least 6 characters!' },
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="text-gray-400" />}
                            placeholder="Enter your password"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            className="w-full h-12 text-base font-medium"
                        >
                            Sign In
                        </Button>
                    </Form.Item>
                </Form>

                <Divider>
                    <Text type="secondary">Demo Credentials</Text>
                </Divider>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <Text className="text-sm">
                        <strong>Email:</strong> admin@inventory.com<br />
                        <strong>Password:</strong> admin123456
                    </Text>
                </div>
            </Card>
        </div>
    );
};

export default Login; 