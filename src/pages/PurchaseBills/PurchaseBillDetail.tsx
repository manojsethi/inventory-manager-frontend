import React, { useState, useEffect } from 'react';
import {
    Card,
    Row,
    Col,
    Typography,
    Button,
    Badge,
    Descriptions,
    Table,
    Space,
    Image,
    Breadcrumb,
    message,
    Popconfirm,
} from 'antd';
import {
    ArrowLeftOutlined,
    EditOutlined,
    DeleteOutlined,
    CheckCircleOutlined,
    EyeOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { purchaseBillService } from '../../services';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface PurchaseBillDetailProps { }

const PurchaseBillDetail: React.FC<PurchaseBillDetailProps> = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [bill, setBill] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchBillDetail();
        }
    }, [id]);

    const fetchBillDetail = async () => {
        try {
            setLoading(true);
            const response = await purchaseBillService.getById(id!);
            setBill(response);
        } catch (error) {
            message.error('Failed to fetch purchase bill details');
            navigate('/purchase-bills');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsDone = async () => {
        try {
            await purchaseBillService.markAsDone(id!);
            message.success('Purchase bill marked as done');
            fetchBillDetail(); // Refresh the data
        } catch (error) {
            message.error('Failed to mark purchase bill as done');
        }
    };

    const handleDelete = async () => {
        try {
            await purchaseBillService.delete(id!);
            message.success('Purchase bill deleted successfully');
            navigate('/purchase-bills');
        } catch (error) {
            message.error('Failed to delete purchase bill');
        }
    };

    const itemColumns = [
        {
            title: 'Product',
            dataIndex: 'productId',
            key: 'productId',
            render: (productId: any) => (
                <span className="font-medium">{productId?.name || '-'}</span>
            ),
        },
        {
            title: 'Variant',
            dataIndex: 'variantId',
            key: 'variantId',
            render: (variantId: any) => (
                <span className="text-gray-600">{variantId?.name || '-'}</span>
            ),
        },
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
            render: (text: string) => (
                <span className="font-mono text-sm">{text || '-'}</span>
            ),
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (quantity: number) => (
                <span className="font-medium">{quantity}</span>
            ),
        },
        {
            title: 'Unit Price',
            dataIndex: 'unitPrice',
            key: 'unitPrice',
            render: (price: number) => (
                <span className="font-medium">₹{price.toFixed(2)}</span>
            ),
        },
        {
            title: 'Total Amount',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (amount: number) => (
                <span className="font-semibold text-green-600">₹{amount.toFixed(2)}</span>
            ),
        },
        {
            title: 'Notes',
            dataIndex: 'notes',
            key: 'notes',
            render: (notes: string) => (
                <span className="text-gray-600">{notes || '-'}</span>
            ),
        },
    ];

    if (loading) {
        return (
            <div className="p-6">
                <div className="text-center">Loading...</div>
            </div>
        );
    }

    if (!bill) {
        return (
            <div className="p-6">
                <div className="text-center">Purchase bill not found</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-6">
                <Breadcrumb.Item>
                    <div onClick={() => navigate('/purchase-bills')} className="p-0 cursor-pointer text-blue-600">
                        Purchase Bills
                    </div>
                </Breadcrumb.Item>
                <Breadcrumb.Item className="text-gray-600">Bill Details</Breadcrumb.Item>
            </Breadcrumb>

            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <Title level={2} className="mb-2">
                            Purchase Bill Details
                        </Title>

                    </div>
                    <Space>
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate('/purchase-bills')}
                        >
                            Back to Bills
                        </Button>
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => navigate(`/purchase-bills/edit/${id}`)}
                        >
                            Edit Bill
                        </Button>
                        {bill.status === 'draft' && (
                            <Button
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                onClick={handleMarkAsDone}
                            >
                                Mark as Done
                            </Button>
                        )}
                        <Popconfirm
                            title="Delete Purchase Bill"
                            description="Are you sure you want to delete this purchase bill? This action cannot be undone."
                            onConfirm={handleDelete}
                            okText="Yes, Delete"
                            cancelText="Cancel"
                            okType="danger"
                        >
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                            >
                                Delete
                            </Button>
                        </Popconfirm>
                    </Space>
                </div>
            </div>

            {/* Bill Information */}
            <Card className="mb-6">
                <Row gutter={24}>
                    <Col span={12}>
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Bill Number">
                                <Text strong>{bill.billNumber}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Supplier Bill Reference">
                                <Text>{bill.supplierBillNumber || '-'}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Bill Date">
                                <Text>{dayjs(bill.billDate).format('DD/MM/YYYY')}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Status">
                                <Badge
                                    status={bill.status === 'done' ? 'success' : 'processing'}
                                    text={bill.status === 'done' ? 'Done' : 'Draft'}
                                />
                            </Descriptions.Item>
                        </Descriptions>
                    </Col>
                    <Col span={12}>
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Supplier">
                                <Text strong>{bill.supplierId?.name || '-'}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Supplier Phone">
                                <Text>{bill.supplierId?.phone || '-'}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Supplier Email">
                                <Text>{bill.supplierId?.email || '-'}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Created At">
                                <Text>{dayjs(bill.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
                            </Descriptions.Item>
                        </Descriptions>
                    </Col>
                </Row>
            </Card>

            {/* Bill Items */}
            <Card className="mb-6">
                <Title level={4} className="mb-4">Bill Items</Title>
                <Table
                    columns={itemColumns}
                    dataSource={bill.items || []}
                    rowKey="_id"
                    pagination={false}
                    size="small"
                />
            </Card>

            {/* Bill Summary */}
            <Card className="mb-6">
                <Title level={4} className="mb-4">Bill Summary</Title>
                <Row gutter={24}>
                    <Col span={8}>
                        <div className="text-center p-4 border rounded">
                            <div className="text-lg font-semibold text-gray-600">Subtotal</div>
                            <div className="text-2xl font-bold text-blue-600">
                                ₹{(bill.subtotal || 0).toFixed(2)}
                            </div>
                        </div>
                    </Col>
                    <Col span={8}>
                        <div className="text-center p-4 border rounded">
                            <div className="text-lg font-semibold text-gray-600">Tax Amount</div>
                            <div className="text-2xl font-bold text-orange-600">
                                ₹{(bill.taxAmount || 0).toFixed(2)}
                            </div>
                        </div>
                    </Col>
                    <Col span={8}>
                        <div className="text-center p-4 border rounded">
                            <div className="text-lg font-semibold text-gray-600">Total Amount</div>
                            <div className="text-2xl font-bold text-green-600">
                                ₹{(bill.totalAmount || 0).toFixed(2)}
                            </div>
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Notes */}
            {bill.notes && (
                <Card className="mb-6">
                    <Title level={4} className="mb-4">Notes</Title>
                    <Text>{bill.notes}</Text>
                </Card>
            )}

            {/* Attachments */}
            {bill.attachments && bill.attachments.length > 0 && (
                <Card className="mb-6">
                    <Title level={4} className="mb-4">Attachments</Title>
                    <div className="flex flex-wrap gap-4">
                        {bill.attachments.map((attachment: string, index: number) => (
                            <div key={index} className="border rounded p-2">
                                <Text className="text-sm">{attachment}</Text>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default PurchaseBillDetail;
