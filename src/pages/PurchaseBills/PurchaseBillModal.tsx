import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Row,
    Col,
    Input,
    Select,
    DatePicker,
    InputNumber,
    Button,
    Divider,
    Card,
    Upload,
    message,
    Popconfirm,
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    UploadOutlined,
} from '@ant-design/icons';
import type { PurchaseBill, Supplier } from '../../types';
import { uploadService } from '../../services/uploadService';
import { ImageType } from '../../types';

const { Option } = Select;
const { TextArea } = Input;

interface PurchaseBillModalProps {
    visible: boolean;
    onCancel: () => void;
    onSubmit: (values: any) => void;
    loading: boolean;
    editingBill: PurchaseBill | null;
    suppliers: Supplier[];
    form: any;
}

const PurchaseBillModal: React.FC<PurchaseBillModalProps> = ({
    visible,
    onCancel,
    onSubmit,
    loading,
    editingBill,
    suppliers,
    form,
}) => {
    const [items, setItems] = useState<any[]>([]);
    const [attachments, setAttachments] = useState<string[]>([]);

    useEffect(() => {
        if (visible && editingBill) {
            setItems(editingBill.items || []);
            setAttachments(editingBill.attachments || []);
        } else if (visible) {
            setItems([]);
            setAttachments([]);
        }
    }, [visible, editingBill]);

    const handleAddItem = () => {
        const newItem = {
            productId: '',
            productName: '',
            quantity: 1,
            unitPrice: 0,
            totalPrice: 0,
            notes: '',
        };
        setItems([...items, newItem]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
        calculateTotals(newItems);
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };

        // Calculate total price for this item
        if (field === 'quantity' || field === 'unitPrice') {
            newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice;
        }

        setItems(newItems);
        calculateTotals(newItems);
    };

    const calculateTotals = (currentItems: any[]) => {
        const subtotal = currentItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
        const taxAmount = form.getFieldValue('taxAmount') || 0;
        const discountAmount = form.getFieldValue('discountAmount') || 0;
        const totalAmount = subtotal + taxAmount - discountAmount;

        form.setFieldsValue({
            subtotal,
            totalAmount,
        });
    };

    const handleAttachmentUpload = async (file: File) => {
        try {
            const uploadedImage = await uploadService.uploadSingle(file, ImageType.PURCHASE_BILL);
            setAttachments([...attachments, uploadedImage.key]);
            return false; // Prevent default upload behavior
        } catch (error) {
            message.error('Failed to upload attachment');
            return false;
        }
    };

    const handleRemoveAttachment = (index: number) => {
        const newAttachments = attachments.filter((_, i) => i !== index);
        setAttachments(newAttachments);
    };

    const handleFormSubmit = () => {
        form.validateFields().then((values: any) => {
            const formData = {
                ...values,
                items: items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    notes: item.notes,
                })),
                attachments,
            };
            onSubmit(formData);
        });
    };

    return (
        <Modal
            title={editingBill ? 'Edit Purchase Bill' : 'Create Purchase Bill'}
            open={visible}
            onCancel={onCancel}
            onOk={handleFormSubmit}
            confirmLoading={loading}
            width={1000}
            okText={editingBill ? 'Update' : 'Create'}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    status: 'draft',
                    items: [],
                    subtotal: 0,
                    taxAmount: 0,
                    discountAmount: 0,
                    totalAmount: 0,
                }}
            >
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            name="billNumber"
                            label="Bill Number"
                            rules={[{ required: true, message: 'Please enter bill number' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="supplierId"
                            label="Supplier"
                            rules={[{ required: true, message: 'Please select supplier' }]}
                        >
                            <Select placeholder="Select supplier">
                                {suppliers.map((supplier) => (
                                    <Option key={supplier._id} value={supplier._id}>
                                        {supplier.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="status"
                            label="Status"
                        >
                            <Select>
                                <Option value="draft">Draft</Option>
                                <Option value="paid">Paid</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="billDate"
                            label="Bill Date"
                            rules={[{ required: true, message: 'Please select bill date' }]}
                        >
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="dueDate"
                            label="Due Date"
                            rules={[{ required: true, message: 'Please select due date' }]}
                        >
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider orientation="left">Bill Items</Divider>

                <div className="mb-4">
                    <Button type="dashed" onClick={handleAddItem} icon={<PlusOutlined />}>
                        Add Item
                    </Button>
                </div>

                {items.map((item, index) => (
                    <Card key={index} size="small" className="mb-4">
                        <Row gutter={16} align="middle">
                            <Col span={6}>
                                <Input
                                    placeholder="Product ID"
                                    value={item.productId}
                                    onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                                />
                            </Col>
                            <Col span={6}>
                                <Input
                                    placeholder="Product Name"
                                    value={item.productName}
                                    onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                                />
                            </Col>
                            <Col span={3}>
                                <InputNumber
                                    placeholder="Qty"
                                    value={item.quantity}
                                    onChange={(value) => handleItemChange(index, 'quantity', value)}
                                    min={1}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                            <Col span={3}>
                                <InputNumber
                                    placeholder="Unit Price"
                                    value={item.unitPrice}
                                    onChange={(value) => handleItemChange(index, 'unitPrice', value)}
                                    min={0}
                                    step={0.01}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                            <Col span={3}>
                                <InputNumber
                                    placeholder="Total"
                                    value={item.totalPrice}
                                    disabled
                                    style={{ width: '100%' }}
                                />
                            </Col>
                            <Col span={2}>
                                <Popconfirm
                                    title="Remove Item"
                                    description="Are you sure you want to remove this item?"
                                    onConfirm={() => handleRemoveItem(index)}
                                    okText="Yes, Remove"
                                    cancelText="Cancel"
                                    okType="danger"
                                >
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                    />
                                </Popconfirm>
                            </Col>
                        </Row>
                        <Row gutter={16} className="mt-2">
                            <Col span={24}>
                                <Input
                                    placeholder="Notes (optional)"
                                    value={item.notes}
                                    onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                                />
                            </Col>
                        </Row>
                    </Card>
                ))}

                <Row gutter={16}>
                    <Col span={6}>
                        <Form.Item
                            name="subtotal"
                            label="Subtotal"
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                prefix="₹"
                                disabled
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            name="taxAmount"
                            label="Tax Amount"
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                prefix="₹"
                                min={0}
                                step={0.01}
                                onChange={(value) => {
                                    const subtotal = form.getFieldValue('subtotal') || 0;
                                    const discountAmount = form.getFieldValue('discountAmount') || 0;
                                    form.setFieldsValue({ totalAmount: subtotal + (value || 0) - discountAmount });
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            name="discountAmount"
                            label="Discount Amount"
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                prefix="₹"
                                min={0}
                                step={0.01}
                                onChange={(value) => {
                                    const subtotal = form.getFieldValue('subtotal') || 0;
                                    const taxAmount = form.getFieldValue('taxAmount') || 0;
                                    form.setFieldsValue({ totalAmount: subtotal + taxAmount - (value || 0) });
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            name="totalAmount"
                            label="Total Amount"
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                prefix="₹"
                                disabled
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="notes"
                    label="Notes"
                >
                    <TextArea rows={3} placeholder="Additional notes..." />
                </Form.Item>

                <Form.Item label="Attachments">
                    <Upload
                        beforeUpload={handleAttachmentUpload}
                        showUploadList={false}
                        accept="image/*,.pdf,.doc,.docx"
                    >
                        <Button icon={<UploadOutlined />}>Upload Attachment</Button>
                    </Upload>
                    <div className="mt-2">
                        {attachments.map((attachment, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded mb-2">
                                <span className="text-sm">{attachment}</span>
                                <Popconfirm
                                    title="Remove Attachment"
                                    description="Are you sure you want to remove this attachment?"
                                    onConfirm={() => handleRemoveAttachment(index)}
                                    okText="Yes, Remove"
                                    cancelText="Cancel"
                                    okType="danger"
                                >
                                    <Button
                                        type="text"
                                        size="small"
                                        danger
                                        icon={<DeleteOutlined />}
                                    />
                                </Popconfirm>
                            </div>
                        ))}
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default PurchaseBillModal;
