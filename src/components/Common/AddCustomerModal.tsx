import React, { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { customerService } from '../../services/customerService';
import PhoneInputField, { getPhoneInputValidationRules } from './PhoneInputField';

interface AddCustomerModalProps {
    open: boolean;
    onCancel: () => void;
    onCustomerAdded: (customer: any) => void;
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
    open,
    onCancel,
    onCustomerAdded
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values: { name: string; phone: string }) => {
        try {
            setLoading(true);
            const newCustomer = await customerService.create(values);
            message.success('Customer added successfully');
            onCustomerAdded(newCustomer);
            form.resetFields();
            onCancel();
        } catch (error: any) {
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title="Add New Customer"
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={500}
            destroyOnHidden
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
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
                    rules={getPhoneInputValidationRules(true)}
                >
                    <PhoneInputField
                        placeholder="Enter phone number"
                        onChange={(value) => {
                            form.setFieldsValue({ phone: value });
                        }}
                    />
                </Form.Item>

                <div className="flex justify-end space-x-2">
                    <Button onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                    >
                        Add Customer
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default AddCustomerModal;
