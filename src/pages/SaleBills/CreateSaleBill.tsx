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
import { useNavigate } from 'react-router-dom';
import { saleBillService, CreateSaleBillRequest } from '../../services/saleBillService';
import ProductAutocomplete from '../../components/Products/ProductAutocomplete';
import VariantSelector from '../../components/Products/VariantSelector';
import dayjs from 'dayjs';

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
        const newSubtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
        setSubtotal(newSubtotal);

        const taxAmount = form.getFieldValue('taxAmount') || 0;
        const shippingAmount = form.getFieldValue('shippingAmount') || 0;
        setTotalAmount(newSubtotal + taxAmount + shippingAmount);
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
                    <Row gutter={24}>
                        <Col span={16}>
                            <Card title="Sale Bill Details" className="mb-6">
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Bill Number"
                                        >
                                            <Input
                                                value={billNumber}
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
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Form.Item
                                    label="Customer"
                                    required
                                >
                                    <div className="space-y-2">
                                        <Select
                                            showSearch
                                            placeholder="Search customer by name or phone"
                                            value={selectedCustomer ? `${selectedCustomer.name} ${selectedCustomer.phone}` : undefined}
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
                                        >
                                            {customers.map(customer => (
                                                <Option key={customer._id} value={customer._id} label={`${customer.name} ${customer.phone}`}>
                                                    {customer.name} {customer.phone}
                                                </Option>
                                            ))}
                                        </Select>
                                        {selectedCustomer && (
                                            <div className="p-3 bg-blue-50 rounded border">
                                                <div className="flex items-center">
                                                    <UserOutlined className="mr-2 text-blue-600" />
                                                    <div>
                                                        <div className="font-medium">{selectedCustomer.name}</div>
                                                        {selectedCustomer.phone && (
                                                            <div className="text-sm text-gray-500">{selectedCustomer.phone}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Form.Item>
                            </Card>

                            <Card title="Bill Items" className="mb-6">
                                <div className="mb-4">
                                    <Button
                                        type="dashed"
                                        icon={<PlusOutlined />}
                                        onClick={handleAddItem}
                                        block
                                    >
                                        Add Item
                                    </Button>
                                </div>

                                {items.map((item, index) => (
                                    <div key={index} className="border rounded-lg p-4 mb-4">
                                        <div className="flex justify-between items-start mb-4">
                                            <Text strong>Item {index + 1}</Text>
                                            <Popconfirm
                                                title="Remove Item"
                                                description="Are you sure you want to remove this item?"
                                                onConfirm={() => handleRemoveItem(index)}
                                                okText="Yes"
                                                cancelText="No"
                                            >
                                                <Button
                                                    type="text"
                                                    icon={<DeleteOutlined />}
                                                    danger
                                                    size="small"
                                                />
                                            </Popconfirm>
                                        </div>

                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Form.Item
                                                    label="Product"
                                                    required
                                                >
                                                    <ProductAutocomplete
                                                        onChange={(value, product) => product && handleProductSelect(product, index)}
                                                        style={{ width: '100%' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item
                                                    label="Variant"
                                                >
                                                    <VariantSelector
                                                        product={item.productId ? { _id: item.productId } as any : null}
                                                        onChange={(variantId, variant) => handleVariantSelect(variant, index)}
                                                        style={{ width: '100%' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Row gutter={16}>
                                            <Col span={8}>
                                                <Form.Item
                                                    label="SKU"
                                                >
                                                    <Input
                                                        value={item.sku}
                                                        disabled
                                                        className="bg-gray-50"
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={8}>
                                                <Form.Item
                                                    label="Quantity"
                                                    required
                                                >
                                                    <InputNumber
                                                        value={item.quantity}
                                                        onChange={(value) => handleQuantityChange(value || 1, index)}
                                                        min={1}
                                                        style={{ width: '100%' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={8}>
                                                <Form.Item
                                                    label="Unit Price"
                                                    required
                                                >
                                                    <InputNumber
                                                        value={item.unitPrice}
                                                        onChange={(value) => handleUnitPriceChange(value || 0, index)}
                                                        min={0}
                                                        prefix="₹"
                                                        style={{ width: '100%' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Form.Item
                                                    label="Total Price"
                                                >
                                                    <InputNumber
                                                        value={item.totalPrice}
                                                        disabled
                                                        prefix="₹"
                                                        style={{ width: '100%' }}
                                                        className="bg-gray-50"
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item
                                                    label="Notes"
                                                >
                                                    <Input
                                                        value={item.notes}
                                                        onChange={(e) => {
                                                            const newItems = [...items];
                                                            newItems[index].notes = e.target.value;
                                                            setItems(newItems);
                                                        }}
                                                        placeholder="Optional notes"
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </div>
                                ))}
                            </Card>
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
        </div>
    );
};

export default CreateSaleBill;
