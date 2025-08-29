import React, { useState, useEffect } from 'react';
import {
    Card,
    Form,
    Row,
    Col,
    Input,
    Select,
    DatePicker,
    InputNumber,
    Button,
    Upload,
    message,
    Popconfirm,
    Typography,
    Breadcrumb,
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    UploadOutlined,
    ArrowLeftOutlined,
    SaveOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { type Supplier, type Product } from '../../services';
import { ImageType, uploadService } from '../../services/uploadService';
import { purchaseBillService, supplierService } from '../../services';
import dayjs from 'dayjs';
import ProductAutocomplete from '../../components/Products/ProductAutocomplete';
import VariantSelector from '../../components/Products/VariantSelector';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CreatePurchaseBill: React.FC = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<any[]>([]);
    const [attachments, setAttachments] = useState<string[]>([]);
    const [, setBillNumber] = useState<string>('');

    // Variant selection state (for future use if needed)
    // const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    useEffect(() => {
        fetchSuppliers();
        fetchNextBillNumber();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const response = await supplierService.getAll({ limit: 1000 });
            setSuppliers(response.data);
        } catch (err) {
            message.error('Failed to fetch suppliers');
        }
    };

    const fetchNextBillNumber = async () => {
        try {
            const nextNumber = await purchaseBillService.getNextBillNumber();
            setBillNumber(nextNumber);
            form.setFieldsValue({
                billNumber: nextNumber,
                billDate: dayjs(),
                dueDate: dayjs().add(30, 'days'),
                status: 'draft',
            });
        } catch (err) {
            message.error('Failed to get next bill number');
        }
    };

    const handleAddItem = () => {
        const newItem = {
            productName: '',
            selectedProduct: null as Product | null,
            selectedVariant: null as any,
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

    const handleProductSelect = (index: number, productName: string, product?: Product) => {
        const newItems = [...items];
        newItems[index] = {
            ...newItems[index],
            productName,
            selectedProduct: product,
            selectedVariant: null, // Reset variant when product changes
        };
        setItems(newItems);
    };

    const handleVariantSelect = (index: number, variantId: string, variant: any) => {
        const newItems = [...items];
        newItems[index] = {
            ...newItems[index],
            selectedVariant: variant,
            unitPrice: variant.currentCost || variant.costPrice || 0,
        };
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

    const handleSubmit = async (values: any) => {
        try {
            setLoading(true);
            const formData = {
                ...values,
                billDate: values.billDate.format('YYYY-MM-DD'),
                dueDate: values.dueDate.format('YYYY-MM-DD'),
                items: items.map(item => ({
                    productId: item.selectedProduct?._id || '',
                    variantId: item.selectedVariant?._id || '',
                    sku: item.selectedVariant?.sku || '',
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    totalAmount: item.totalPrice,
                    notes: item.notes,
                })),
                attachments,
            };

            await purchaseBillService.create(formData);
            message.success('Purchase bill created successfully');
            navigate('/purchase-bills');
        } catch (err) {
            message.error(err instanceof Error ? err.message : 'Failed to create purchase bill');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/purchase-bills');
    };

    return (
        <div className="p-6">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-6">
                <Breadcrumb.Item>
                    <Button type="link" onClick={() => navigate('/purchase-bills')} className="p-0">
                        Purchase Bills
                    </Button>
                </Breadcrumb.Item>
                <Breadcrumb.Item>Create Purchase Bill</Breadcrumb.Item>
            </Breadcrumb>

            {/* Header */}
            <div className="mb-6">
                <Title level={2} className="mb-2">
                    Create Purchase Bill
                </Title>
                <p className="text-gray-600">
                    Create a new purchase bill for your supplier
                </p>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    status: 'draft',
                    items: [],
                    subtotal: 0,
                    taxAmount: 0,
                    discountAmount: 0,
                    totalAmount: 0,
                }}
            >
                <Card className="mb-6">
                    <Title level={4} className="mb-4">Bill Details</Title>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="billNumber"
                                label="Bill Number"
                                rules={[{ required: true, message: 'Please enter bill number' }]}
                            >
                                <Input disabled />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="supplierBillReference"
                                label="Supplier Bill Reference"
                                rules={[{ required: true, message: 'Please enter supplier bill reference' }]}
                            >
                                <Input placeholder="Enter supplier's bill reference number" />
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
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="billDate"
                                label="Bill Date"
                                rules={[{ required: true, message: 'Please select bill date' }]}
                            >
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="dueDate"
                                label="Due Date"
                                rules={[{ required: true, message: 'Please select due date' }]}
                            >
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="status"
                                label="Status"
                            >
                                <Select>
                                    <Option value="draft">Draft</Option>
                                    <Option value="done">Done</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                <Card className="mb-6">
                    <Title level={4} className="mb-4">Bill Items</Title>

                    <div className="mb-4">
                        <Button type="dashed" onClick={handleAddItem} icon={<PlusOutlined />}>
                            Add Item
                        </Button>
                    </div>

                    {items.map((item, index) => (
                        <Card key={index} size="small" className="mb-4">
                            <Row gutter={16} align="middle">
                                <Col span={7}>
                                    <div className="text-xs text-gray-500 mb-1 text-left">Product</div>
                                    <ProductAutocomplete
                                        value={item.productName}
                                        onChange={(productName, product) => handleProductSelect(index, productName, product)}
                                        placeholder="Search product by name..."
                                        style={{ width: '100%' }}
                                    />
                                </Col>
                                <Col span={7}>
                                    <div className="text-xs text-gray-500 mb-1 text-left">Variant</div>
                                    <VariantSelector
                                        value={item.selectedVariant?._id}
                                        onChange={(variantId, variant) => handleVariantSelect(index, variantId, variant)}
                                        product={item.selectedProduct}
                                        placeholder="Select variant..."
                                        style={{ width: '100%' }}
                                    />
                                </Col>
                                <Col span={3}>
                                    <div className="text-xs text-gray-500 mb-1 text-left">Quantity</div>
                                    <InputNumber
                                        placeholder="Qty"
                                        value={item.quantity}
                                        onChange={(value) => handleItemChange(index, 'quantity', value)}
                                        min={1}
                                        className="w-full"
                                    />
                                </Col>
                                <Col span={3}>
                                    <div className="text-xs text-gray-500 mb-1 text-left">Unit Price</div>
                                    <InputNumber
                                        placeholder="Unit Price"
                                        value={item.unitPrice}
                                        onChange={(value) => handleItemChange(index, 'unitPrice', value)}
                                        min={0}
                                        step={0.01}
                                        prefix="₹"
                                        className="w-full"
                                    />
                                </Col>
                                <Col span={3}>
                                    <div className="text-xs text-gray-500 mb-1 text-left">Total</div>
                                    <InputNumber
                                        placeholder="Total"
                                        value={item.totalPrice}
                                        disabled
                                        prefix="₹"
                                        className="w-full"
                                    />
                                </Col>
                                <Col span={1}>
                                    <div className="text-xs text-gray-500 mb-1">&nbsp;</div>
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
                                    <div className="text-xs text-gray-500 mb-1 text-left">Notes</div>
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
                </Card>

                <Card className="mb-6">
                    <Title level={4} className="mb-4">Additional Information</Title>

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
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={handleCancel}
                        size="large"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        htmlType="submit"
                        loading={loading}
                        size="large"
                    >
                        Create Purchase Bill
                    </Button>
                </div>
            </Form>


        </div>
    );
};

export default CreatePurchaseBill;
