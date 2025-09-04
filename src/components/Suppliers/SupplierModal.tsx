import React from 'react';
import {
    Modal,
    Form,
    Input,
    Button,
    Row,
    Col,
    Switch,
    Divider,
    Typography,
} from 'antd';
import type { Supplier } from '../../types';
import PhoneInputField, { getPhoneInputValidationRules } from '../Common/PhoneInputField';

const { Title } = Typography;
const { TextArea } = Input;

interface SupplierModalProps {
    open: boolean;
    editingSupplier: Supplier | null;
    loading: boolean;
    onCancel: () => void;
    onSubmit: (values: any) => Promise<void>;
}

const SupplierModal: React.FC<SupplierModalProps> = ({
    open,
    editingSupplier,
    loading,
    onCancel,
    onSubmit,
}) => {
    const [form] = Form.useForm();

    // Set form values when editingSupplier changes
    React.useEffect(() => {
        if (editingSupplier) {
            form.setFieldsValue({
                name: editingSupplier.name,
                contactPerson: editingSupplier.contactPerson,
                email: editingSupplier.email,
                phone: editingSupplier.phone,
                address: editingSupplier.address,
                taxId: editingSupplier.taxId,
                notes: editingSupplier.notes,
                isActive: editingSupplier.isActive,
            });
        } else {
            form.resetFields();
        }
    }, [editingSupplier, form]);

    const handleSubmit = async (values: any) => {
        await onSubmit(values);
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={800}
            destroyOnHidden
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    isActive: true,
                }}
            >
                {/* Basic Information */}
                <Title level={4}>Basic Information</Title>
                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="name"
                            label="Supplier Name"
                            rules={[
                                { required: true, message: 'Please enter supplier name' },
                                { min: 2, message: 'Name must be at least 2 characters' },
                                { max: 100, message: 'Name cannot exceed 100 characters' }
                            ]}
                        >
                            <Input placeholder="Enter supplier name" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="contactPerson"
                            label="Contact Person"
                            rules={[
                                { required: true, message: 'Please enter contact person' },
                                { min: 2, message: 'Contact person must be at least 2 characters' },
                                { max: 50, message: 'Contact person cannot exceed 50 characters' }
                            ]}
                        >
                            <Input placeholder="Enter contact person name" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: 'Please enter email address' },
                                { type: 'email', message: 'Please enter a valid email address' }
                            ]}
                        >
                            <Input placeholder="Enter email address" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="phone"
                            label="Phone"
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

                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="taxId"
                            label="Tax ID"
                        >
                            <Input placeholder="Enter tax ID (optional)" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="isActive"
                            label="Status"
                            valuePropName="checked"
                        >
                            <Switch
                                checkedChildren="Active"
                                unCheckedChildren="Inactive"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Address Information */}
                <Divider />
                <Title level={4}>Address Information</Title>
                <Row gutter={16}>
                    <Col xs={24}>
                        <Form.Item
                            name={['address', 'street']}
                            label="Street Address"
                            rules={[
                                { required: true, message: 'Please enter street address' }
                            ]}
                        >
                            <Input placeholder="Enter street address" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} sm={8}>
                        <Form.Item
                            name={['address', 'city']}
                            label="City"
                            rules={[
                                { required: true, message: 'Please enter city' }
                            ]}
                        >
                            <Input placeholder="Enter city" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Form.Item
                            name={['address', 'state']}
                            label="State/Province"
                            rules={[
                                { required: true, message: 'Please enter state/province' }
                            ]}
                        >
                            <Input placeholder="Enter state/province" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Form.Item
                            name={['address', 'zipCode']}
                            label="ZIP/Postal Code"
                            rules={[
                                { required: true, message: 'Please enter ZIP/postal code' }
                            ]}
                        >
                            <Input placeholder="Enter ZIP/postal code" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24}>
                        <Form.Item
                            name={['address', 'country']}
                            label="Country"
                            rules={[
                                { required: true, message: 'Please enter country' }
                            ]}
                        >
                            <Input placeholder="Enter country" />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Notes */}
                <Divider />
                <Title level={4}>Additional Information</Title>
                <Form.Item
                    name="notes"
                    label="Notes"
                >
                    <TextArea
                        rows={4}
                        placeholder="Enter any additional notes about this supplier"
                        maxLength={500}
                        showCount
                    />
                </Form.Item>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                    <Button onClick={handleCancel} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                    >
                        {editingSupplier ? 'Update Supplier' : 'Create Supplier'}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default SupplierModal;
