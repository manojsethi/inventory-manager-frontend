import React, { useState, useEffect } from 'react';
import {
    Card,
    Typography,
    Row,
    Col,
    Button,
    Space,
    Table,
    Tag,
    Badge,
    Descriptions,
    Divider,
    message,
    Spin,
    Breadcrumb,
    Image,
    Tooltip,
} from 'antd';
import {
    ArrowLeftOutlined,
    EditOutlined,
    PrinterOutlined,
    DownloadOutlined,
    UserOutlined,
    DollarOutlined,
    CalendarOutlined,
    FileTextOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { saleBillService, SaleBill } from '../../services/saleBillService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const SaleBillDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [saleBill, setSaleBill] = useState<SaleBill | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadSaleBill();
        }
    }, [id]);

    const loadSaleBill = async () => {
        try {
            setLoading(true);
            const data = await saleBillService.getById(id!);
            setSaleBill(data);
        } catch (error) {
            message.error('Failed to load sale bill details');
            navigate('/sale-bills');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsCancelled = async () => {
        if (!saleBill) return;

        try {
            await saleBillService.update(saleBill._id, { status: 'cancelled' });
            message.success('Sale bill marked as cancelled');
            loadSaleBill(); // Reload to get updated data
        } catch (error: any) {
            message.error(error.response?.data?.error || 'Failed to update sale bill status');
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <Spin size="large" />
                </div>
            </div>
        );
    }

    if (!saleBill) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <Title level={3}>Sale bill not found</Title>
                    <Button onClick={() => navigate('/sale-bills')}>Back to Sale Bills</Button>
                </div>
            </div>
        );
    }

    // Table columns for items
    const itemColumns = [
        {
            title: 'Product',
            key: 'product',
            render: (record: any) => (
                <div>
                    <div className="font-medium">{record.name}</div>
                    <div className="text-sm text-gray-500">SKU: {record.sku}</div>
                </div>
            ),
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (quantity: number) => (
                <Text>{quantity}</Text>
            ),
        },
        {
            title: 'Unit Price',
            dataIndex: 'unitPrice',
            key: 'unitPrice',
            render: (price: number) => (
                <Text>₹{(price || 0).toFixed(2)}</Text>
            ),
        },
        {
            title: 'Total Price',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            render: (total: number) => (
                <Text strong>₹{(total || 0).toFixed(2)}</Text>
            ),
        },
        {
            title: 'Notes',
            dataIndex: 'notes',
            key: 'notes',
            render: (notes: string) => (
                <Text type="secondary">{notes || '-'}</Text>
            ),
        },
    ];

    return (
        <div className="p-6">
            <div className="mb-6">
                <Breadcrumb
                    items={[
                        {
                            title: (
                                <span
                                    className="text-blue-600 cursor-pointer"
                                    onClick={() => navigate('/sale-bills')}
                                >
                                    Sale Bills
                                </span>
                            ),
                        },
                        {
                            title: <span className="text-gray-600">Sale Bill Details</span>,
                        },
                    ]}
                    className="mb-4"
                />

                <div className="flex justify-between items-center mb-4">
                    <div>
                        <Title level={2} className="mb-2">
                            Sale Bill: {saleBill.billNumber}
                        </Title>
                        <div className="flex items-center space-x-4 text-gray-600">
                            <div className="flex items-center">
                                <CalendarOutlined className="mr-1" />
                                <Text>{dayjs(saleBill.billDate).format('DD/MM/YYYY')}</Text>
                            </div>
                            <div className="flex items-center">
                                <UserOutlined className="mr-1" />
                                <Text>{saleBill.createdBy.name}</Text>
                            </div>
                        </div>
                    </div>
                    <Space>
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => navigate(`/sale-bills/edit/${saleBill._id}`)}
                        >
                            Edit
                        </Button>
                        <Button
                            icon={<PrinterOutlined />}
                            onClick={() => window.print()}
                        >
                            Print
                        </Button>
                        <Button
                            icon={<DownloadOutlined />}
                        >
                            Download
                        </Button>
                    </Space>
                </div>
            </div>

            <Row gutter={24}>
                <Col span={16}>
                    {/* Customer Information */}
                    <Card title="Customer Information" className="mb-6">
                        <Descriptions column={2}>
                            <Descriptions.Item label="Customer Name">
                                <div className="flex items-center">
                                    <UserOutlined className="mr-2 text-blue-600" />
                                    <Text strong>{saleBill.customer.name}</Text>
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item label="Phone">
                                <Text>{saleBill.customer.phone || '-'}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Email">
                                <Text>{saleBill.customer.email || '-'}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Status">
                                <Badge
                                    status={saleBill.status === 'paid' ? 'success' : 'default'}
                                    text={saleBill.status === 'paid' ? 'Paid' : 'Cancelled'}
                                />
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    {/* Bill Items */}
                    <Card title="Bill Items" className="mb-6">
                        <Table
                            columns={itemColumns}
                            dataSource={saleBill.items}
                            rowKey={(record, index) => index?.toString() || '0'}
                            pagination={false}
                            size="small"
                        />
                    </Card>

                    {/* Return Records */}
                    {saleBill.returnRecords && saleBill.returnRecords.length > 0 && (
                        <Card title="Return Records" className="mb-6">
                            {saleBill.returnRecords.map((returnRecord, recordIndex) => (
                                <React.Fragment key={recordIndex}>
                                    <div className="border rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="flex items-center space-x-4">
                                                <Text strong>Return #{recordIndex + 1}</Text>
                                                <Text type="secondary">
                                                    {dayjs(returnRecord.dateOfReturn).format('DD/MM/YYYY')}
                                                </Text>
                                                {returnRecord.processedBy && (
                                                    <Text type="secondary">
                                                        by {returnRecord.processedBy.name}
                                                    </Text>
                                                )}
                                            </div>
                                            {returnRecord.note && (
                                                <Text type="secondary">{returnRecord.note}</Text>
                                            )}
                                        </div>

                                        <Table
                                            columns={[
                                                {
                                                    title: 'Product',
                                                    key: 'product',
                                                    render: (_, record: any) => (
                                                        <div>
                                                            <div className="font-medium">{record.name}</div>
                                                            <div className="text-sm text-gray-500">SKU: {record.sku}</div>
                                                        </div>
                                                    ),
                                                },
                                                {
                                                    title: 'Quantity',
                                                    dataIndex: 'quantity',
                                                    key: 'quantity',
                                                    render: (quantity: number) => (
                                                        <Text>{quantity}</Text>
                                                    ),
                                                },
                                                {
                                                    title: 'Unit Price',
                                                    dataIndex: 'unitPrice',
                                                    key: 'unitPrice',
                                                    render: (price: number) => (
                                                        <Text>₹{(price || 0).toFixed(2)}</Text>
                                                    ),
                                                },
                                                {
                                                    title: 'Total Price',
                                                    dataIndex: 'totalPrice',
                                                    key: 'totalPrice',
                                                    render: (total: number) => (
                                                        <Text strong>₹{(total || 0).toFixed(2)}</Text>
                                                    ),
                                                },
                                                {
                                                    title: 'Notes',
                                                    dataIndex: 'notes',
                                                    key: 'notes',
                                                    render: (notes: string) => (
                                                        <Text type="secondary">{notes || '-'}</Text>
                                                    ),
                                                },
                                            ]}
                                            dataSource={returnRecord.items}
                                            rowKey={(record, index) => `${recordIndex}-${index}`}
                                            pagination={false}
                                            size="small"
                                        />
                                    </div>
                                    {recordIndex < (saleBill.returnRecords?.length || 0) - 1 && (
                                        <Divider className="my-6" />
                                    )}
                                </React.Fragment>
                            ))}
                        </Card>
                    )}

                    {/* Payment Information */}
                    {saleBill.paymentMethod && (
                        <Card title="Payment Information" className="mb-6">
                            <Descriptions column={2}>
                                <Descriptions.Item label="Payment Method">
                                    <Tag color="blue">{saleBill.paymentMethod.toUpperCase()}</Tag>
                                </Descriptions.Item>
                                {saleBill.paymentReference && (
                                    <Descriptions.Item label="Payment Reference">
                                        <Text>{saleBill.paymentReference}</Text>
                                    </Descriptions.Item>
                                )}
                            </Descriptions>
                        </Card>
                    )}

                    {/* Notes */}
                    {saleBill.notes && (
                        <Card title="Notes" className="mb-6">
                            <Text>{saleBill.notes}</Text>
                        </Card>
                    )}

                    {/* Attachments */}
                    {saleBill.images && saleBill.images.length > 0 && (
                        <Card title="Attachments" className="mb-6">
                            <div className="flex space-x-4">
                                {saleBill.images.map((image, index) => (
                                    <div key={index} className="relative">
                                        <Image
                                            src={image}
                                            alt={`Attachment ${index + 1}`}
                                            width={100}
                                            height={100}
                                            className="object-cover rounded border"
                                        />
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </Col>

                <Col span={8}>
                    {/* Bill Summary */}
                    <Card title="Bill Summary" className="mb-6">
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <Text>Subtotal:</Text>
                                <Text>₹{saleBill.subtotal.toFixed(2)}</Text>
                            </div>

                            {saleBill.taxAmount && saleBill.taxAmount > 0 && (
                                <div className="flex justify-between">
                                    <Text>Tax Amount:</Text>
                                    <Text>₹{saleBill.taxAmount.toFixed(2)}</Text>
                                </div>
                            )}

                            {saleBill.shippingAmount && saleBill.shippingAmount > 0 && (
                                <div className="flex justify-between">
                                    <Text>Shipping Amount:</Text>
                                    <Text>₹{saleBill.shippingAmount.toFixed(2)}</Text>
                                </div>
                            )}

                            <Divider />

                            <div className="flex justify-between text-lg">
                                <Text strong>Total Amount:</Text>
                                <Text strong className="text-green-600">
                                    ₹{saleBill.totalAmount.toFixed(2)}
                                </Text>
                            </div>

                            {saleBill.realEffectiveTotalAmount && saleBill.realEffectiveTotalAmount !== saleBill.totalAmount && (
                                <div className="flex justify-between text-lg">
                                    <Text strong>Real Effective Total:</Text>
                                    <Text strong className="text-blue-600">
                                        ₹{saleBill.realEffectiveTotalAmount.toFixed(2)}
                                    </Text>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Bill Information */}
                    <Card title="Bill Information" className="mb-6">
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Bill Number">
                                <Text strong>{saleBill.billNumber}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Bill Date">
                                <Text>{dayjs(saleBill.billDate).format('DD/MM/YYYY')}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Created By">
                                <Text>{saleBill.createdBy.name}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Created At">
                                <Text>{dayjs(saleBill.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Last Updated">
                                <Text>{dayjs(saleBill.updatedAt).format('DD/MM/YYYY HH:mm')}</Text>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    {/* Actions */}
                    <Card title="Actions">
                        <div className="space-y-2">
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={() => navigate(`/sale-bills/edit/${saleBill._id}`)}
                                block
                            >
                                Edit Sale Bill
                            </Button>

                            {saleBill.status === 'paid' && (
                                <Button
                                    danger
                                    onClick={handleMarkAsCancelled}
                                    block
                                >
                                    Mark as Cancelled
                                </Button>
                            )}

                            <Button
                                icon={<PrinterOutlined />}
                                onClick={() => window.print()}
                                block
                            >
                                Print Bill
                            </Button>

                            <Button
                                icon={<DownloadOutlined />}
                                block
                            >
                                Download PDF
                            </Button>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default SaleBillDetail;
