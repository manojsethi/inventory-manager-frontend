import React, { useState } from 'react';
import { Modal, Form, Input, Button, message, Row, Col, Select } from 'antd';
import { customerService } from '../../services/customerService';
import PhoneInputField, { getPhoneInputValidationRules } from './PhoneInputField';
import type { Customer } from '../../types/customer';

const { TextArea } = Input;
const { Option } = Select;

interface AddCustomerModalProps {
    open: boolean;
    onCancel: () => void;
    onCustomerAdded: (customer: any) => void;
    editingCustomer?: Customer | null;
    showOptionalFields?: boolean; // New prop to show/hide non-required fields
    title?: string; // Custom title for the modal
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
    open,
    onCancel,
    onCustomerAdded,
    editingCustomer = null,
    showOptionalFields = true,
    title
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // Set form values when editingCustomer changes
    React.useEffect(() => {
        if (editingCustomer) {
            form.setFieldsValue({
                name: editingCustomer.name,
                email: editingCustomer.email,
                phone: editingCustomer.phone,
                address: editingCustomer.address,
                isActive: editingCustomer.isActive,
            });
        } else {
            form.resetFields();
        }
    }, [editingCustomer, form]);

    const handleSubmit = async (values: any) => {
        try {
            setLoading(true);

            if (editingCustomer) {
                // Update existing customer
                const updatedCustomer = await customerService.update(editingCustomer._id, values);
                message.success('Customer updated successfully');
                onCustomerAdded(updatedCustomer);
            } else {
                // Create new customer
                const newCustomer = await customerService.create(values);
                message.success('Customer added successfully');
                onCustomerAdded(newCustomer);
            }

            form.resetFields();
            onCancel();
        } catch (error: any) {
            message.error(error.response?.data?.error || 'Failed to save customer');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    const modalTitle = title || (editingCustomer ? 'Edit Customer' : 'Add New Customer');
    const submitButtonText = editingCustomer ? 'Update Customer' : 'Add Customer';

    return (
        <Modal
            title={modalTitle}
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={600}
            destroyOnHidden
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{ isActive: true }}
            >
                <Row gutter={16}>
                    <Col span={12}>
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
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="phone"
                            label="Phone Number"
                            rules={getPhoneInputValidationRules()}
                        >
                            <PhoneInputField
                                placeholder="Enter phone number"
                                onChange={(value) => {
                                    form.setFieldsValue({ phone: value });
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {showOptionalFields && (
                    <>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="email"
                                    label="Email"
                                    rules={[
                                        { type: 'email', message: 'Please enter a valid email' },
                                    ]}
                                >
                                    <Input placeholder="Enter email address" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="isActive"
                                    label="Status"
                                    valuePropName="checked"
                                >
                                    <Select>
                                        <Option value={true}>Active</Option>
                                        <Option value={false}>Inactive</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name="address"
                            label="Address"
                        >
                            <TextArea
                                rows={3}
                                placeholder="Enter address"
                            />
                        </Form.Item>

                        <Form.Item
                            name="notes"
                            label="Notes"
                        >
                            <TextArea
                                rows={2}
                                placeholder="Enter any additional notes"
                            />
                        </Form.Item>
                    </>
                )}

                <div className="flex justify-end space-x-2">
                    <Button onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                    >
                        {submitButtonText}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default AddCustomerModal;
