import React from 'react';
import {
    Modal,
    Form,
    Input,
    Button,
    DatePicker,
    Table,
    InputNumber,
    Typography,
    Row,
    Col,
    message,
} from 'antd';
import dayjs from 'dayjs';

const { Text } = Typography;
const { TextArea } = Input;

interface ReturnItem {
    variantId?: string;
    sku: string;
    name: string;
    quantity: number;
    unitPrice: number;
    unitCost: number;
    totalPrice: number;
    notes?: string;
    returnReason?: string;
    maxReturnableQuantity: number;
}

interface ReturnItemsModalProps {
    open: boolean;
    returnItems: ReturnItem[];
    loading: boolean;
    onCancel: () => void;
    onSubmit: (values: any) => Promise<void>;
    onQuantityChange: (index: number, quantity: number) => void;
    onReasonChange: (index: number, reason: string) => void;
    onNotesChange: (index: number, notes: string) => void;
}

const ReturnItemsModal: React.FC<ReturnItemsModalProps> = ({
    open,
    returnItems,
    loading,
    onCancel,
    onSubmit,
    onQuantityChange,
    onReasonChange,
    onNotesChange,
}) => {
    const [form] = Form.useForm();

    // Set initial form values when modal opens
    React.useEffect(() => {
        if (open) {
            form.setFieldsValue({
                dateOfReturn: dayjs(),
                note: ''
            });
        }
    }, [open, form]);

    const handleSubmit = async (values: any) => {
        const itemsToReturn = returnItems.filter(item => item.quantity > 0);

        if (itemsToReturn.length === 0) {
            message.error('Please select at least one item to return');
            return;
        }

        await onSubmit(values);
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title="Return Items"
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={1000}
            destroyOnHidden
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="dateOfReturn"
                            label="Date of Return"
                            rules={[
                                { required: true, message: 'Please select return date' }
                            ]}
                        >
                            <DatePicker
                                style={{ width: '100%' }}
                                format="DD/MM/YYYY"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="note"
                            label="Return Note"
                        >
                            <TextArea
                                rows={3}
                                placeholder="General note about this return..."
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <div className="mb-4">
                    <Text strong>Select Items to Return:</Text>
                    <Text type="secondary" className="ml-2">
                        (Only items that can be returned are shown)
                    </Text>
                </div>

                <Table
                    dataSource={returnItems}
                    columns={[
                        {
                            title: 'Product',
                            key: 'product',
                            render: (_, record) => (
                                <div>
                                    <div className="font-medium">{record.name}</div>
                                    <div className="text-sm text-gray-500">SKU: {record.sku}</div>
                                </div>
                            ),
                        },
                        {
                            title: 'Max Returnable',
                            key: 'maxReturnable',
                            render: (_, record) => (
                                <Text>{record.maxReturnableQuantity}</Text>
                            ),
                        },
                        {
                            title: 'Return Quantity',
                            key: 'returnQuantity',
                            render: (_, record, index) => (
                                <InputNumber
                                    value={record.quantity}
                                    onChange={(value) => onQuantityChange(index, value || 0)}
                                    min={0}
                                    max={record.maxReturnableQuantity}
                                    style={{ width: '100%' }}
                                />
                            ),
                        },
                        {
                            title: 'Unit Price',
                            key: 'unitPrice',
                            render: (_, record) => (
                                <Text>₹{record.unitPrice.toFixed(2)}</Text>
                            ),
                        },
                        {
                            title: 'Total Price',
                            key: 'totalPrice',
                            render: (_, record) => (
                                <Text strong>₹{record.totalPrice.toFixed(2)}</Text>
                            ),
                        },
                        {
                            title: 'Return Reason',
                            key: 'returnReason',
                            render: (_, record, index) => (
                                <Input
                                    value={record.returnReason}
                                    onChange={(e) => onReasonChange(index, e.target.value)}
                                    placeholder="Reason for return"
                                />
                            ),
                        },
                        {
                            title: 'Notes',
                            key: 'notes',
                            render: (_, record, index) => (
                                <Input
                                    value={record.notes}
                                    onChange={(e) => onNotesChange(index, e.target.value)}
                                    placeholder="Item notes"
                                />
                            ),
                        },
                    ]}
                    pagination={false}
                    rowKey={(record, index) => index?.toString() || '0'}
                    size="small"
                />

                <div className="flex justify-end space-x-2 mt-4">
                    <Button onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                    >
                        Process Return
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default ReturnItemsModal;
