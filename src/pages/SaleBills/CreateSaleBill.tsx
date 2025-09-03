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
    Select,
    InputNumber,
    DatePicker,
    Modal,
    Popconfirm,
    Divider,
    Upload,
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    SaveOutlined,
    ArrowLeftOutlined,
    UserOutlined,
    UploadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { saleBillService } from '../../services/saleBillService';
import type { CreateSaleBillRequest } from '../../types/saleBill';
import type { SaleBillItem } from '../../types/saleBill';
import type { SaleBillCustomer as Customer } from '../../types/saleBill';
import ProductAutocomplete from '../../components/Products/ProductAutocomplete';
import VariantSelector from '../../components/Products/VariantSelector';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Types centralized in services; using imports above

const CreateSaleBill: React.FC = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [billNumber, setBillNumber] = useState('');
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

    // Load next bill number
    useEffect(() => {
        const loadNextBillNumber = async () => {
            try {
                const nextNumber = await saleBillService.getNextBillNumber();
                setBillNumber(nextNumber);
            } catch (error) {
                message.error('Failed to load bill number');
            }
        };
        loadNextBillNumber();
    }, []);

    // Calculate totals when items change
    useEffect(() => {
        const newSubtotal = Math.round((items.reduce((sum, item) => sum + item.totalPrice, 0)) * 100) / 100;
        setSubtotal(newSubtotal);

        const taxAmount = form.getFieldValue('taxAmount') || 0;
        const shippingAmount = form.getFieldValue('shippingAmount') || 0;
        setTotalAmount(Math.round((newSubtotal + taxAmount + shippingAmount) * 100) / 100);
    }, [items, form]);

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
            unitCost: 0,
            totalPrice: 0,
            totalCost: 0,
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
            totalPrice: Math.round(((variant.currentPrice || 0) * newItems[index].quantity) * 100) / 100,
        };
        setItems(newItems);
    };

    // Handle quantity change
    const handleQuantityChange = (value: number, index: number) => {
        const newItems = [...items];
        newItems[index] = {
            ...newItems[index],
            quantity: value,
            totalPrice: Math.round((value * newItems[index].unitPrice) * 100) / 100,
        };
        setItems(newItems);
    };

    // Handle unit price change
    const handleUnitPriceChange = (value: number, index: number) => {
        const newItems = [...items];
        newItems[index] = {
            ...newItems[index],
            unitPrice: value,
            totalPrice: Math.round((value * newItems[index].quantity) * 100) / 100,
        };
        setItems(newItems);
    };

    // Handle tax/shipping amount change
    const handleAmountChange = () => {
        const taxAmount = form.getFieldValue('taxAmount') || 0;
        const shippingAmount = form.getFieldValue('shippingAmount') || 0;
        setTotalAmount(Math.round((subtotal + taxAmount + shippingAmount) * 100) / 100);
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
            const saleBillData: CreateSaleBillRequest = {
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
                images: values.images,
            };

            await saleBillService.create(saleBillData);
            message.success('Sale bill created successfully');
            navigate('/sale-bills');
        } catch (error: any) {
            message.error(error.response?.data?.error || 'Failed to create sale bill');
        } finally {
            setLoading(false);
        }
    };

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
                        Create Sale Bill
                    </Title>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        billDate: dayjs(),
                        taxAmount: 0,
                        shippingAmount: 0,
                        paymentMethod: 'cash',
                    }}
                >
                    <Row gutter={24} className="mb-6">
                        <Col span={8}>
                            <Card title="Sale Bill Details" className="h-full">
                                <Form.Item
                                    label="Bill Number"
                                >
                                    <Input
                                        value={billNumber}
                                        disabled
                                        className="bg-gray-50"
                                    />
                                </Form.Item>

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
                                    />
                                </Form.Item>

                                <Form.Item
                                    label="Customer"
                                    required
                                >
                                    <div className="space-y-2">
                                        <Select
                                            showSearch
                                            placeholder="Search customer by name or phone"
                                            value={selectedCustomer ? selectedCustomer._id : undefined}
                                            onSearch={handleCustomerSearchChange}
                                            onChange={handleCustomerSelect}
                                            loading={customerSearchLoading}
                                            filterOption={false}
                                            notFoundContent={
                                                customerSearchText.length >= 2 ? (
                                                    <div className="p-2">
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
                                            dropdownStyle={{ minWidth: '300px' }}
                                            labelInValue={false}
                                            className="text-left"
                                        >
                                            {customers.map(customer => (
                                                <Option key={customer._id} value={customer._id} label={`${customer.name} - Phone: ${customer.phone}`}>
                                                    <div className="flex justify-between items-center">
                                                        <span>{customer.name}</span>
                                                        <span className="text-blue-600 font-semibold">Phone: {customer.phone}</span>
                                                    </div>
                                                </Option>
                                            ))}
                                        </Select>
                                    </div>
                                </Form.Item>
                            </Card>
                        </Col>

                        <Col span={8}>
                            <Card title="Bill Summary" className="h-full">
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
                                        />
                                    </Form.Item>

                                    <Divider />

                                    <div className="flex justify-between text-lg">
                                        <Text strong>Total Amount:</Text>
                                        <Text strong className="text-green-600">
                                            ₹{totalAmount.toFixed(2)}
                                        </Text>
                                    </div>
                                </div>
                            </Card>
                        </Col>

                        <Col span={8}>
                            <Card title="Payment Details" className="h-full">
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
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col span={24}>
                            <Card title="Bill Items" className="mb-6">
                                <div className="mb-4">
                                    <Button
                                        type="dashed"
                                        icon={<PlusOutlined />}
                                        onClick={handleAddItem}
                                    >
                                        Add Item
                                    </Button>
                                </div>

                                {items.map((item, index) => (
                                    <Card key={index} size="small" className="mb-4">
                                        <Row gutter={16} align="middle">
                                            <Col span={7}>
                                                <div className="text-xs text-gray-500 mb-1 text-left">Product</div>
                                                <ProductAutocomplete
                                                    onChange={(value, product) => product && handleProductSelect(product, index)}
                                                    placeholder="Search product by name..."
                                                    style={{ width: '100%' }}
                                                />
                                            </Col>
                                            <Col span={7}>
                                                <div className="text-xs text-gray-500 mb-1 text-left">Variant</div>
                                                <VariantSelector
                                                    value={item.variantId}
                                                    onChange={(variantId, variant) => handleVariantSelect(variant, index)}
                                                    product={item.productId ? { _id: item.productId } as any : null}
                                                    placeholder="Select variant..."
                                                    style={{ width: '100%' }}
                                                />
                                            </Col>
                                            <Col span={3}>
                                                <div className="text-xs text-gray-500 mb-1 text-left">Quantity</div>
                                                <InputNumber
                                                    placeholder="Qty"
                                                    value={item.quantity}
                                                    onChange={(value) => handleQuantityChange(value || 1, index)}
                                                    min={1}
                                                    className="w-full"
                                                />
                                            </Col>
                                            <Col span={3}>
                                                <div className="text-xs text-gray-500 mb-1 text-left">Unit Price</div>
                                                <InputNumber
                                                    placeholder="Unit Price"
                                                    value={item.unitPrice}
                                                    onChange={(value) => handleUnitPriceChange(value || 0, index)}
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
                                                    value={Math.round(item.totalPrice * 100) / 100}
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
                                                    onChange={(e) => {
                                                        const newItems = [...items];
                                                        newItems[index].notes = e.target.value;
                                                        setItems(newItems);
                                                    }}
                                                />
                                            </Col>
                                        </Row>
                                    </Card>
                                ))}
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
                                        listType="picture-card"
                                        maxCount={5}
                                        beforeUpload={() => false}
                                    >
                                        <div>
                                            <UploadOutlined />
                                            <div style={{ marginTop: 8 }}>Upload</div>
                                        </div>
                                    </Upload>
                                </Form.Item>
                            </Card>
                        </Col>
                    </Row>

                    <div className="flex justify-end space-x-4 mt-4">
                        <Button
                            onClick={() => navigate('/sale-bills')}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            htmlType="submit"
                            loading={loading}
                        >
                            Create Sale Bill
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
                destroyOnHidden
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
        </div>
    );
};

export default CreateSaleBill;
