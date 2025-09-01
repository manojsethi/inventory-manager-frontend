import React, { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Button,
    Card,
    Row,
    Col,
    Typography,
    message,
    Space,
    Divider,
    Select,
    InputNumber,
    DatePicker,
    Modal,
    Spin,
    Table,
    Popconfirm,
    Tooltip,
    Upload,
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    SaveOutlined,
    ArrowLeftOutlined,
    UserOutlined,
    SearchOutlined,
    UploadOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { saleBillService, SaleBill, UpdateSaleBillRequest } from '../../services/saleBillService';
import ProductAutocomplete from '../../components/Products/ProductAutocomplete';
import VariantSelector from '../../components/Products/VariantSelector';
import dayjs from 'dayjs';
import { uploadService, ImageType } from '../../services/uploadService';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface Customer {
    _id: string;
    name: string;
    phone?: string;
    email?: string;
}

interface SaleBillItem {
    productId?: string;
    variantId?: string;
    sku: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
}

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

const EditSaleBill: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [saleBill, setSaleBill] = useState<SaleBill | null>(null);
    const [items, setItems] = useState<SaleBillItem[]>([]);
    const [subtotal, setSubtotal] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);

    // Customer search states
    const [customerSearchText, setCustomerSearchText] = useState('');
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customerSearchLoading, setCustomerSearchLoading] = useState(false);

    // Add customer modal states
    const [isAddCustomerModalVisible, setIsAddCustomerModalVisible] = useState(false);
    const [newCustomerForm] = Form.useForm();
    const [addingCustomer, setAddingCustomer] = useState(false);

    // Return items states
    const [isReturnModalVisible, setIsReturnModalVisible] = useState(false);
    const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
    const [returnForm] = Form.useForm();
    const [processingReturn, setProcessingReturn] = useState(false);

    // Images state
    const [images, setImages] = useState<string[]>([]);

    // Upload attachment (same approach as purchase bills)
    const handleAttachmentUpload = async (file: File) => {
        try {
            const uploadedImage = await uploadService.uploadSingle(file, ImageType.SALE_BILL);
            setImages(prev => [...prev, uploadedImage.url]);
            return false; // prevent antd from auto-uploading
        } catch (error) {
            message.error('Failed to upload attachment');
            return false;
        }
    };

    const handleRemoveAttachment = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
    };

    // Load sale bill data
    useEffect(() => {
        if (id) {
            loadSaleBill();
        }
    }, [id]);

    // Calculate totals when items change
    useEffect(() => {
        const newSubtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
        setSubtotal(newSubtotal);

        const taxAmount = form.getFieldValue('taxAmount') || 0;
        const shippingAmount = form.getFieldValue('shippingAmount') || 0;
        setTotalAmount(newSubtotal + taxAmount + shippingAmount);
    }, [items, form]);

    // Track current status for read-only state
    const [currentStatus, setCurrentStatus] = useState<string>('paid');

    const loadSaleBill = async () => {
        try {
            setLoading(true);
            const data = await saleBillService.getById(id!);
            setSaleBill(data);

            // Set customer
            setSelectedCustomer(data.customer);
            setCustomerSearchText(data.customer.name);

            // Set items
            const formattedItems: SaleBillItem[] = data.items.map((item: any) => ({
                productId: item.productId?._id || item.productId,
                variantId: item.variantId?._id || item.variantId,
                sku: item.sku,
                name: item.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
                notes: item.notes,
            }));
            setItems(formattedItems);

            // Set form values
            form.setFieldsValue({
                billDate: dayjs(data.billDate),
                customer: data.customer._id,
                taxAmount: data.taxAmount || 0,
                shippingAmount: data.shippingAmount || 0,
                notes: data.notes,
                paymentMethod: data.paymentMethod,
                paymentReference: data.paymentReference,
                status: data.status,
            });

            // Set initial status
            setCurrentStatus(data.status);

            // Set initial images
            setImages(data.images || []);

            // Calculate initial totals
            const newSubtotal = formattedItems.reduce((sum, item) => sum + item.totalPrice, 0);
            setSubtotal(newSubtotal);
            setTotalAmount(newSubtotal + (data.taxAmount || 0) + (data.shippingAmount || 0));

        } catch (error) {
            message.error('Failed to load sale bill');
            navigate('/sale-bills');
        } finally {
            setLoading(false);
        }
    };

    // Search customers
    const searchCustomers = async (query: string) => {
        if (query.length < 2) {
            setCustomers([]);
            return;
        }

        try {
            setCustomerSearchLoading(true);
            const results = await saleBillService.searchCustomers(query, 10);
            setCustomers(results);
        } catch (error) {
            message.error('Failed to search customers');
        } finally {
            setCustomerSearchLoading(false);
        }
    };

    // Handle customer search input change
    const handleCustomerSearchChange = (value: string) => {
        setCustomerSearchText(value);
        searchCustomers(value);
    };

    // Handle customer selection
    const handleCustomerSelect = (customerId: string) => {
        const customer = customers.find(c => c._id === customerId);
        if (customer) {
            setSelectedCustomer(customer);
            setCustomerSearchText(customer.name);
            form.setFieldsValue({ customer: customer._id });
        }
    };

    // Add new customer
    const handleAddCustomer = async (values: { name: string; phone: string }) => {
        try {
            setAddingCustomer(true);
            const newCustomer = await saleBillService.createCustomer(values);

            // Set the new customer as selected
            setSelectedCustomer(newCustomer);
            setCustomerSearchText(newCustomer.name);
            form.setFieldsValue({ customer: newCustomer._id });

            setIsAddCustomerModalVisible(false);
            newCustomerForm.resetFields();
            message.success('Customer added successfully');
        } catch (error: any) {
            message.error(error.response?.data?.error || 'Failed to add customer');
        } finally {
            setAddingCustomer(false);
        }
    };

    // Add item to sale bill
    const handleAddItem = () => {
        const newItem: SaleBillItem = {
            sku: '',
            name: '',
            quantity: 1,
            unitPrice: 0,
            totalPrice: 0,
        };
        setItems([...items, newItem]);
    };

    // Remove item from sale bill
    const handleRemoveItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    // Handle product selection
    const handleProductSelect = (product: any, index: number) => {
        const newItems = [...items];
        newItems[index] = {
            ...newItems[index],
            productId: product._id,
            name: product.name,
            sku: product.sku || '',
        };
        setItems(newItems);
    };

    // Handle variant selection
    const handleVariantSelect = (variant: any, index: number) => {
        const newItems = [...items];
        newItems[index] = {
            ...newItems[index],
            variantId: variant._id,
            sku: variant.sku,
            name: `${newItems[index].name} - ${variant.name}`,
            unitPrice: variant.currentPrice || 0,
            totalPrice: (variant.currentPrice || 0) * newItems[index].quantity,
        };
        setItems(newItems);
    };

    // Handle quantity change
    const handleQuantityChange = (value: number, index: number) => {
        const newItems = [...items];
        newItems[index] = {
            ...newItems[index],
            quantity: value,
            totalPrice: value * newItems[index].unitPrice,
        };
        setItems(newItems);
    };

    // Handle unit price change
    const handleUnitPriceChange = (value: number, index: number) => {
        const newItems = [...items];
        newItems[index] = {
            ...newItems[index],
            unitPrice: value,
            totalPrice: value * newItems[index].quantity,
        };
        setItems(newItems);
    };

    // Handle tax/shipping amount change
    const handleAmountChange = () => {
        const taxAmount = form.getFieldValue('taxAmount') || 0;
        const shippingAmount = form.getFieldValue('shippingAmount') || 0;
        setTotalAmount(subtotal + taxAmount + shippingAmount);
    };

    // Handle open return modal
    const handleOpenReturnModal = () => {
        // Calculate max returnable quantities for each item
        const returnableItems: ReturnItem[] = items.map(item => {
            // Calculate how much has already been returned for this SKU
            const alreadyReturned = saleBill?.returnRecords?.reduce((total: number, record: any) => {
                const returnedItem = record.items.find((ri: any) => ri.sku === item.sku);
                return total + (returnedItem?.quantity || 0);
            }, 0) || 0;

            const maxReturnableQuantity = item.quantity - alreadyReturned;

            return {
                variantId: item.variantId,
                sku: item.sku,
                name: item.name,
                quantity: 0, // Start with 0
                unitPrice: item.unitPrice,
                unitCost: 0, // Default cost, will be updated from backend
                totalPrice: 0,
                notes: '',
                returnReason: '',
                maxReturnableQuantity: Math.max(0, maxReturnableQuantity)
            };
        }).filter(item => item.maxReturnableQuantity > 0); // Only show items that can be returned

        setReturnItems(returnableItems);
        returnForm.setFieldsValue({
            dateOfReturn: dayjs(),
            note: ''
        });
        setIsReturnModalVisible(true);
    };

    // Handle return quantity change
    const handleReturnQuantityChange = (index: number, quantity: number) => {
        const newReturnItems = [...returnItems];
        newReturnItems[index] = {
            ...newReturnItems[index],
            quantity: quantity,
            totalPrice: quantity * newReturnItems[index].unitPrice
        };
        setReturnItems(newReturnItems);
    };

    // Handle return reason change
    const handleReturnReasonChange = (index: number, reason: string) => {
        const newReturnItems = [...returnItems];
        newReturnItems[index] = {
            ...newReturnItems[index],
            returnReason: reason
        };
        setReturnItems(newReturnItems);
    };

    // Handle return notes change
    const handleReturnNotesChange = (index: number, notes: string) => {
        const newReturnItems = [...returnItems];
        newReturnItems[index] = {
            ...newReturnItems[index],
            notes: notes
        };
        setReturnItems(newReturnItems);
    };

    // Handle return submission
    const handleReturnSubmit = async (values: any) => {
        const itemsToReturn = returnItems.filter(item => item.quantity > 0);

        if (itemsToReturn.length === 0) {
            message.error('Please select at least one item to return');
            return;
        }

        try {
            setProcessingReturn(true);
            const returnData = {
                dateOfReturn: values.dateOfReturn.toDate(),
                note: values.note,
                items: itemsToReturn.map(item => ({
                    variantId: item.variantId,
                    sku: item.sku,
                    name: item.name,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    unitCost: item.unitCost,
                    notes: item.notes,
                    returnReason: item.returnReason
                }))
            };

            await saleBillService.addReturnItems(id!, returnData);
            message.success('Return items processed successfully');
            setIsReturnModalVisible(false);
            loadSaleBill(); // Reload to get updated data
        } catch (error: any) {
            message.error(error.response?.data?.error || 'Failed to process return items');
        } finally {
            setProcessingReturn(false);
        }
    };

    // Submit form
    const handleSubmit = async (values: any) => {
        if (items.length === 0) {
            message.error('Please add at least one item');
            return;
        }

        if (!selectedCustomer) {
            message.error('Please select a customer');
            return;
        }

        try {
            setLoading(true);
            debugger;
            const saleBillData: UpdateSaleBillRequest = {
                customer: selectedCustomer._id,
                billDate: values.billDate.toDate(),
                items: items.map(item => ({
                    variantId: item.variantId,
                    sku: item.sku,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    notes: item.notes,
                })),
                taxAmount: values.taxAmount,
                shippingAmount: values.shippingAmount,
                notes: values.notes,
                paymentMethod: values.paymentMethod,
                paymentReference: values.paymentReference,
                status: values.status,
                images: images,
            };

            await saleBillService.update(id!, saleBillData);
            message.success('Sale bill updated successfully');
            navigate('/sale-bills');
        } catch (error: any) {
            message.error(error.response?.data?.error || 'Failed to update sale bill');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !saleBill) {
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

    return (
        <div className="p-6">
            <div className="mb-6">
                <div className="flex items-center mb-4">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/sale-bills')}
                        className="mr-4"
                    >
                        Back
                    </Button>
                    <Title level={2} className="mb-0">
                        Edit Sale Bill: {saleBill.billNumber}
                    </Title>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Row gutter={24}>
                        <Col span={16}>
                            <Card title="Sale Bill Details" className="mb-6">
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Bill Number"
                                        >
                                            <Input
                                                value={saleBill.billNumber}
                                                disabled
                                                className="bg-gray-50"
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            name="billDate"
                                            label="Bill Date"
                                            rules={[
                                                { required: true, message: 'Please select bill date' }
                                            ]}
                                        >
                                            <DatePicker
                                                style={{ width: '100%' }}
                                                format="DD/MM/YYYY"
                                                disabled
                                                className="bg-gray-50"
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Customer"
                                            required
                                        >
                                            <div className="space-y-2">
                                                <Select
                                                    showSearch
                                                    placeholder="Search customer by name or phone"
                                                    value={selectedCustomer ? `${selectedCustomer.name} - ${selectedCustomer.phone}` : undefined}
                                                    onSearch={handleCustomerSearchChange}
                                                    onChange={handleCustomerSelect}
                                                    loading={customerSearchLoading}
                                                    filterOption={false}
                                                    notFoundContent={
                                                        customerSearchText.length >= 2 ? (
                                                            <div className="disabled">
                                                                <Text type="secondary">No customers found</Text>
                                                                <Button
                                                                    type="link"
                                                                    size="small"
                                                                    onClick={() => setIsAddCustomerModalVisible(true)}
                                                                >
                                                                    Add New Customer
                                                                </Button>
                                                            </div>
                                                        ) : null
                                                    }
                                                    optionLabelProp="label"
                                                    disabled
                                                    className="bg-gray-50"
                                                >
                                                    {customers.map(customer => (
                                                        <Option key={customer._id} value={customer._id} label={`${customer.name} ${customer.phone}`}>
                                                            {customer.name} {customer.phone}
                                                        </Option>
                                                    ))}
                                                </Select>

                                            </div>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            name="status"
                                            label="Status"
                                        >
                                            <Select onChange={(value) => setCurrentStatus(value)}>
                                                <Option value="paid">Paid</Option>
                                                <Option value="cancelled">Cancelled</Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>

                            <Card title="Bill Items" className="mb-6">
                                {currentStatus === 'paid' && (
                                    <div className="flex justify-end mb-4">
                                        <Button
                                            type="primary"
                                            icon={<PlusOutlined />}
                                            onClick={handleOpenReturnModal}
                                        >
                                            Return Items
                                        </Button>
                                    </div>
                                )}

                                <Table
                                    dataSource={items}
                                    columns={[
                                        {
                                            title: 'Product',
                                            key: 'product',
                                            render: (_, record, index) => {
                                                const isBillPaid = currentStatus === 'paid';
                                                return (
                                                    <div>
                                                        {isBillPaid ? (
                                                            <div>
                                                                <div className="font-medium">{record.name}</div>
                                                                <div className="text-sm text-gray-500">SKU: {record.sku}</div>
                                                            </div>
                                                        ) : (
                                                            <ProductAutocomplete
                                                                onChange={(value, product) => product && handleProductSelect(product, index)}
                                                                style={{ width: '100%' }}
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            },
                                        },
                                        {
                                            title: 'Quantity',
                                            key: 'quantity',
                                            render: (_, record, index) => {
                                                const isBillPaid = currentStatus === 'paid';
                                                return (
                                                    <div>
                                                        {isBillPaid ? (
                                                            <Text>{record.quantity}</Text>
                                                        ) : (
                                                            <InputNumber
                                                                value={record.quantity}
                                                                onChange={(value) => handleQuantityChange(value || 1, index)}
                                                                min={1}
                                                                style={{ width: '100%' }}
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            },
                                        },
                                        {
                                            title: 'Unit Price',
                                            key: 'unitPrice',
                                            render: (_, record, index) => {
                                                const isBillPaid = currentStatus === 'paid';
                                                return (
                                                    <div>
                                                        {isBillPaid ? (
                                                            <Text>₹{record.unitPrice.toFixed(2)}</Text>
                                                        ) : (
                                                            <InputNumber
                                                                value={record.unitPrice}
                                                                onChange={(value) => handleUnitPriceChange(value || 0, index)}
                                                                min={0}
                                                                prefix="₹"
                                                                style={{ width: '100%' }}
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            },
                                        },
                                        {
                                            title: 'Total Price',
                                            key: 'totalPrice',
                                            render: (_, record) => (
                                                <Text strong>₹{record.totalPrice.toFixed(2)}</Text>
                                            ),
                                        },
                                        {
                                            title: 'Notes',
                                            key: 'notes',
                                            render: (_, record) => (
                                                <Text type="secondary">{record.notes || '-'}</Text>
                                            ),
                                        },

                                    ]}
                                    pagination={false}
                                    rowKey={(record, index) => index?.toString() || '0'}
                                    size="small"
                                />
                            </Card>

                            {/* Return Records */}
                            {saleBill?.returnRecords && saleBill.returnRecords.length > 0 && (
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
                        </Col>

                        <Col span={8}>
                            <Card title="Bill Summary" className="mb-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <Text>Subtotal:</Text>
                                        <Text strong>₹{subtotal.toFixed(2)}</Text>
                                    </div>

                                    <Form.Item
                                        name="taxAmount"
                                        label="Tax Amount"
                                    >
                                        <InputNumber
                                            min={0}
                                            prefix="₹"
                                            style={{ width: '100%' }}
                                            onChange={() => handleAmountChange()}
                                            disabled
                                            className="bg-gray-50"
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        name="shippingAmount"
                                        label="Shipping Amount"
                                    >
                                        <InputNumber
                                            min={0}
                                            prefix="₹"
                                            style={{ width: '100%' }}
                                            onChange={() => handleAmountChange()}
                                            disabled
                                            className="bg-gray-50"
                                        />
                                    </Form.Item>

                                    <Divider />

                                    <div className="flex justify-between text-lg">
                                        <Text strong>Total Amount:</Text>
                                        <Text strong className="text-green-600">
                                            ₹{totalAmount.toFixed(2)}
                                        </Text>
                                    </div>

                                    {saleBill?.realEffectiveTotalAmount && saleBill.realEffectiveTotalAmount !== totalAmount && (
                                        <div className="flex justify-between text-lg">
                                            <Text strong>Real Effective Total:</Text>
                                            <Text strong className="text-blue-600">
                                                ₹{saleBill.realEffectiveTotalAmount.toFixed(2)}
                                            </Text>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            <Card title="Payment Details" className="mb-6">
                                <Form.Item
                                    name="paymentMethod"
                                    label="Payment Method"
                                >
                                    <Select>
                                        <Option value="cash">Cash</Option>
                                        <Option value="card">Card</Option>
                                        <Option value="upi">UPI</Option>
                                        <Option value="bank_transfer">Bank Transfer</Option>
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    name="paymentReference"
                                    label="Payment Reference"
                                >
                                    <Input placeholder="Transaction ID, reference number, etc." />
                                </Form.Item>
                            </Card>

                            <Card title="Additional Information">
                                <Form.Item
                                    name="notes"
                                    label="Notes"
                                >
                                    <TextArea
                                        rows={4}
                                        placeholder="Any additional notes..."
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="images"
                                    label="Attachments"
                                >
                                    <Upload
                                        beforeUpload={handleAttachmentUpload}
                                        showUploadList={false}
                                        accept="image/*,.pdf,.doc,.docx"
                                    >
                                        <Button icon={<UploadOutlined />}>Upload Attachment</Button>
                                    </Upload>
                                    <div className="mt-2 grid grid-cols-3 gap-3">
                                        {images.map((url, index) => (
                                            <div key={index} className="relative group border rounded overflow-hidden">
                                                <img src={url} alt={`attachment-${index}`} className="w-full h-24 object-cover" />
                                                <button
                                                    type="button"
                                                    className="absolute top-1 right-1 bg-white/80 text-red-600 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100"
                                                    onClick={() => handleRemoveAttachment(index)}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </Form.Item>
                            </Card>
                        </Col>
                    </Row>

                    <div className="flex justify-end space-x-4">
                        <Button
                            onClick={() => navigate('/sale-bills')}
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
                            Update Sale Bill
                        </Button>
                    </div>
                </Form>
            </div>

            {/* Add Customer Modal */}
            <Modal
                title="Add New Customer"
                open={isAddCustomerModalVisible}
                onCancel={() => {
                    setIsAddCustomerModalVisible(false);
                    newCustomerForm.resetFields();
                }}
                footer={null}
                width={500}
                destroyOnClose
            >
                <Form
                    form={newCustomerForm}
                    layout="vertical"
                    onFinish={handleAddCustomer}
                >
                    <Form.Item
                        name="name"
                        label="Customer Name"
                        rules={[
                            { required: true, message: 'Please enter customer name' },
                            { min: 2, message: 'Name must be at least 2 characters' },
                        ]}
                    >
                        <Input placeholder="Enter customer name" />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        label="Phone Number"
                        rules={[
                            { required: true, message: 'Please enter phone number' },
                            { pattern: /^[0-9+\-\s()]*$/, message: 'Please enter a valid phone number' },
                        ]}
                    >
                        <Input placeholder="Enter phone number" />
                    </Form.Item>

                    <div className="flex justify-end space-x-2">
                        <Button
                            onClick={() => {
                                setIsAddCustomerModalVisible(false);
                                newCustomerForm.resetFields();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={addingCustomer}
                        >
                            Add Customer
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* Return Items Modal */}
            <Modal
                title="Return Items"
                open={isReturnModalVisible}
                onCancel={() => {
                    setIsReturnModalVisible(false);
                    returnForm.resetFields();
                }}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <Form
                    form={returnForm}
                    layout="vertical"
                    onFinish={handleReturnSubmit}
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
                                        onChange={(value) => handleReturnQuantityChange(index, value || 0)}
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
                                        onChange={(e) => handleReturnReasonChange(index, e.target.value)}
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
                                        onChange={(e) => handleReturnNotesChange(index, e.target.value)}
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
                        <Button
                            onClick={() => {
                                setIsReturnModalVisible(false);
                                returnForm.resetFields();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={processingReturn}
                        >
                            Process Return
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default EditSaleBill;
