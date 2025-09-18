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
    SaveOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import type { Supplier, Product } from '../../types';
import { uploadService } from '../../services/uploadService';
import { ImageType } from '../../types';
import { purchaseBillService, supplierService, productService } from '../../services';
import dayjs from 'dayjs';
import ProductAutocomplete from '../../components/Products/ProductAutocomplete';
import VariantSelector from '../../components/Products/VariantSelector';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const EditPurchaseBill: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [form] = Form.useForm();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(false);
    const [billLoading, setBillLoading] = useState(true);
    const [items, setItems] = useState<any[]>([]);
    const [attachments, setAttachments] = useState<string[]>([]);


    useEffect(() => {
        if (id) {
            fetchSuppliers();
            fetchBillData();
        }
    }, [id]);

    const fetchSuppliers = async () => {
        try {
            const response = await supplierService.getAll({ limit: 1000 });
            setSuppliers(response.data);
        } catch (err) {
            message.error('Failed to fetch suppliers');
        }
    };

    const fetchBillData = async () => {
        try {
            setBillLoading(true);
            const billData = await purchaseBillService.getById(id!);

            // Set form values
            form.setFieldsValue({
                billNumber: billData.billNumber,
                supplierBillNumber: billData.supplierBillNumber,
                supplierId: billData.supplierId?._id,
                billDate: dayjs(billData.billDate),
                status: billData.status,
                subtotal: billData.subtotal,
                taxAmount: billData.taxAmount,
                discountAmount: billData.discountAmount,
                totalAmount: billData.totalAmount,
                notes: billData.notes,
            });

            // Fetch product data for each item and set items
            const formattedItems = await Promise.all(
                (billData.items || []).map(async (item: any) => {
                    let selectedProduct = null;
                    let productName = '';

                    // Fetch product data if productId exists
                    if (item.productId) {
                        try {
                            const productId = typeof item.productId === 'string' ? item.productId : item.productId._id;
                            const productData = await productService.getById(productId);
                            selectedProduct = productData;
                            productName = productData.name;
                        } catch (error) {
                            console.error('Failed to fetch product:', error);
                            productName = item.productName || '';
                        }
                    }

                    return {
                        productName: productName,
                        selectedProduct: selectedProduct,
                        selectedVariant: item.variantId?._id ? item.variantId : (typeof item.variantId === 'string' ? { _id: item.variantId, sku: item.sku } : null),
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.totalAmount || (item.quantity * item.unitPrice),
                        notes: item.notes || '',
                    };
                })
            );

            setItems(formattedItems);
            setAttachments(billData.attachments || []);

            // Calculate initial totals after items are set
            setTimeout(() => {
                const subtotal = formattedItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
                const taxAmount = billData.taxAmount || 0;
                const discountAmount = billData.discountAmount || 0;
                const totalAmount = subtotal + taxAmount - discountAmount;

                form.setFieldsValue({
                    subtotal,
                    taxAmount,
                    discountAmount,
                    totalAmount,
                });
            }, 100);
        } catch (err) {
            message.error('Failed to fetch purchase bill data');
            navigate('/purchase-bills');
        } finally {
            setBillLoading(false);
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

    const handleQuantityChange = (index: number, value: number | null) => {
        const newItems = [...items];
        newItems[index] = {
            ...newItems[index],
            quantity: value || 0,
            totalPrice: (value || 0) * newItems[index].unitPrice
        };
        setItems(newItems);
        calculateTotals(newItems);
    };

    const handleUnitPriceChange = (index: number, value: number | null) => {
        const newItems = [...items];
        newItems[index] = {
            ...newItems[index],
            unitPrice: value || 0,
            totalPrice: newItems[index].quantity * (value || 0)
        };
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
            unitPrice: variant.currentCost || variant.currentCost || 0,
            totalPrice: newItems[index].quantity * (variant.currentCost || variant.currentCost || 0),
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
            setAttachments([...attachments, uploadedImage.url]);
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
                items: items.map(item => ({
                    productId: item.selectedProduct?._id || '',
                    variantId: item.selectedVariant?._id || '',
                    sku: item.selectedVariant?.sku || '',
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    totalAmount: item.totalPrice,
                    notes: item.notes,
                })),
                images: attachments,
            };
            await purchaseBillService.update(id!, formData);
            message.success('Purchase bill updated successfully');
            navigate('/purchase-bills');
        } catch (err) {
            message.error(err instanceof Error ? err.message : 'Failed to update purchase bill');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/purchase-bills');
    };

    if (billLoading) {
        return (
            <div className="p-6">
                <div className="text-center">Loading...</div>
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
                <Breadcrumb.Item>Edit Purchase Bill</Breadcrumb.Item>
            </Breadcrumb>

            {/* Header */}
            <div className="mb-6">
                <Title level={2} className="mb-2">
                    Edit Purchase Bill
                </Title>
                <p className="text-gray-600">
                    Update purchase bill details and items
                </p>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
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
                                name="supplierBillNumber"
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
                                        onChange={(value) => handleQuantityChange(index, value)}
                                        min={1}
                                        className="w-full"
                                    />
                                </Col>
                                <Col span={3}>
                                    <div className="text-xs text-gray-500 mb-1 text-left">Unit Price</div>
                                    <InputNumber
                                        placeholder="Unit Price"
                                        value={item.unitPrice}
                                        onChange={(value) => handleUnitPriceChange(index, value)}
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
                                        const totalAmount = subtotal + (value || 0) - discountAmount;
                                        form.setFieldsValue({ totalAmount });
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
                                        const totalAmount = subtotal + taxAmount - (value || 0);
                                        form.setFieldsValue({ totalAmount });
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
                        <div className="mt-2 grid grid-cols-3 gap-3">
                            {attachments.map((attachment, index) => (
                                <div key={index} className="relative group border rounded overflow-hidden">
                                    <img src={attachment} alt={`attachment-${index}`} className="w-full h-24 object-cover" />
                                    <Popconfirm
                                        title="Remove Attachment"
                                        description="Are you sure you want to remove this attachment?"
                                        onConfirm={() => handleRemoveAttachment(index)}
                                        okText="Yes, Remove"
                                        cancelText="Cancel"
                                        okType="danger"
                                    >
                                        <button
                                            type="button"
                                            className="absolute top-1 right-1 bg-white/80 text-red-600 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100"
                                        >
                                            Remove
                                        </button>
                                    </Popconfirm>
                                </div>
                            ))}
                        </div>
                    </Form.Item>
                </Card>

                <div className="flex justify-end space-x-4">
                    <Button onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                        Update Purchase Bill
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default EditPurchaseBill;
