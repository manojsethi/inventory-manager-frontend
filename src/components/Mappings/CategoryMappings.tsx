import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    Table,
    Card,
    Button,
    Space,
    Tag,
    Typography,
    message,
    Popconfirm,
    Row,
    Col,
    Statistic,
    Tabs,
    Image,
    Tooltip,
} from 'antd';
import {
    PlusOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
    UserOutlined,
    BankOutlined
} from '@ant-design/icons';
import {
    supplierCategoryService,
    companyCategoryService
} from '../../services';
import type { SupplierCategory, CompanyCategory } from '../../types';
import MappingForms from './MappingForms';

const { Title, Text } = Typography;

interface CategoryMappingsProps {
    categoryId: string;
    categoryName: string;
}

const CategoryMappings: React.FC<CategoryMappingsProps> = ({ categoryId, categoryName }) => {
    const [supplierMappings, setSupplierMappings] = useState<SupplierCategory[]>([]);
    const [companyMappings, setCompanyMappings] = useState<CompanyCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('suppliers');

    // Modal states
    const [mappingModalVisible, setMappingModalVisible] = useState(false);
    const [mappingType, setMappingType] = useState<'supplier-category' | 'company-category'>('supplier-category');
    const [editingMapping, setEditingMapping] = useState<any>(null);

    const fetchMappings = useCallback(async () => {
        try {
            setLoading(true);
            const [supplierData, companyData] = await Promise.all([
                supplierCategoryService.getByCategory(categoryId),
                companyCategoryService.getByCategory(categoryId)
            ]);
            setSupplierMappings(supplierData);
            setCompanyMappings(companyData);
        } catch (err) {
            message.error(err instanceof Error ? err.message : 'Failed to fetch mappings');
        } finally {
            setLoading(false);
        }
    }, [categoryId]);

    useEffect(() => {
        fetchMappings();
    }, [fetchMappings]);

    const handleDeleteSupplierMapping = async (id: string) => {
        try {
            await supplierCategoryService.delete(id);
            message.success('Supplier mapping deleted successfully');
            fetchMappings();
        } catch (err) {
            message.error(err instanceof Error ? err.message : 'Failed to delete supplier mapping');
        }
    };

    const handleDeleteCompanyMapping = async (id: string) => {
        try {
            await companyCategoryService.delete(id);
            message.success('Company mapping deleted successfully');
            fetchMappings();
        } catch (err) {
            message.error(err instanceof Error ? err.message : 'Failed to delete company mapping');
        }
    };

    const handleAddMapping = (type: 'supplier-category' | 'company-category') => {
        setMappingType(type);
        setEditingMapping(null);
        setMappingModalVisible(true);
    };

    const handleEditMapping = (mapping: any, type: 'supplier-category' | 'company-category') => {
        setMappingType(type);
        setEditingMapping(mapping);
        setMappingModalVisible(true);
    };

    const handleMappingSuccess = () => {
        fetchMappings();
    };

    const handleMappingCancel = () => {
        setMappingModalVisible(false);
        setEditingMapping(null);
    };

    const supplierColumns = [
        {
            title: 'Supplier',
            key: 'supplier',
            render: (record: SupplierCategory) => (
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserOutlined className="text-blue-600" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>
                            {record.supplierId.name}
                        </div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {record.supplierId.contactPerson}
                        </Text>
                    </div>
                </div>
            ),
        },
        {
            title: 'Contact Info',
            key: 'contact',
            render: (record: SupplierCategory) => (
                <div>
                    <div style={{ fontSize: '12px' }}>
                        <Text strong>Email:</Text> {record.supplierId.email}
                    </div>
                    <div style={{ fontSize: '12px' }}>
                        <Text strong>Phone:</Text> {record.supplierId.phone}
                    </div>
                </div>
            ),
            width: 200,
        },
        {
            title: 'Notes',
            key: 'notes',
            render: (record: SupplierCategory) => (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                    {record.notes || 'No notes'}
                </Text>
            ),
            width: 150,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record: SupplierCategory) => (
                <Space size="small">
                    <Link to={`/suppliers/${record.supplierId._id}`}>
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            size="small"
                            title="View Supplier"
                        />
                    </Link>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        size="small"
                        title="Edit Mapping"
                        onClick={() => handleEditMapping(record, 'supplier-category')}
                    />
                    <Popconfirm
                        title="Delete Mapping"
                        description="Are you sure you want to remove this supplier from the category?"
                        onConfirm={() => handleDeleteSupplierMapping(record._id)}
                        okText="Yes"
                        cancelText="No"
                        icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                    >
                        <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            size="small"
                            danger
                            title="Remove Mapping"
                        />
                    </Popconfirm>
                </Space>
            ),
            width: 120,
        },
    ];

    const companyColumns = [
        {
            title: 'Company',
            key: 'company',
            render: (record: CompanyCategory) => (
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                        {record.companyId.logo ? (
                            <Image
                                src={record.companyId.logo}
                                alt={record.companyId.name}
                                width={40}
                                height={40}
                                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                                style={{ borderRadius: '6px' }}
                            />
                        ) : (
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <BankOutlined className="text-green-600" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>
                            {record.companyId.name}
                        </div>
                        <Tag color={record.companyId.isActive ? 'green' : 'red'}>
                            {record.companyId.isActive ? 'Active' : 'Inactive'}
                        </Tag>
                    </div>
                </div>
            ),
        },
        {
            title: 'Notes',
            key: 'notes',
            render: (record: CompanyCategory) => (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                    {record.notes || 'No notes'}
                </Text>
            ),
            width: 200,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record: CompanyCategory) => (
                <Space size="small">
                    <Link to={`/companies/${record.companyId._id}`}>
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            size="small"
                            title="View Company"
                        />
                    </Link>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        size="small"
                        title="Edit Mapping"
                        onClick={() => handleEditMapping(record, 'company-category')}
                    />
                    <Popconfirm
                        title="Delete Mapping"
                        description="Are you sure you want to remove this company from the category?"
                        onConfirm={() => handleDeleteCompanyMapping(record._id)}
                        okText="Yes"
                        cancelText="No"
                        icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                    >
                        <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            size="small"
                            danger
                            title="Remove Mapping"
                        />
                    </Popconfirm>
                </Space>
            ),
            width: 120,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Statistics */}
            <Row gutter={16}>
                <Col xs={24} sm={12}>
                    <Card>
                        <Statistic
                            title="Supplier Mappings"
                            value={supplierMappings.length}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12}>
                    <Card>
                        <Statistic
                            title="Company Mappings"
                            value={companyMappings.length}
                            prefix={<BankOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Mappings Tabs */}
            <Card>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={[
                        {
                            key: 'suppliers',
                            label: (
                                <span>
                                    <UserOutlined />
                                    Supplier Mappings ({supplierMappings.length})
                                </span>
                            ),
                            children: (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Title level={4} style={{ margin: 0 }}>
                                            Suppliers in {categoryName}
                                        </Title>
                                        <Tooltip title="Add supplier mapping">
                                            <Button
                                                type="primary"
                                                icon={<PlusOutlined />}
                                                size="small"
                                                onClick={() => handleAddMapping('supplier-category')}
                                            >
                                                Add Supplier
                                            </Button>
                                        </Tooltip>
                                    </div>
                                    <Table
                                        columns={supplierColumns}
                                        dataSource={supplierMappings}
                                        rowKey="_id"
                                        loading={loading}
                                        pagination={{
                                            pageSize: 10,
                                            showSizeChanger: true,
                                            showQuickJumper: true,
                                            showTotal: (total, range) =>
                                                `${range[0]}-${range[1]} of ${total} suppliers`,
                                        }}
                                        size="small"
                                    />
                                </div>
                            ),
                        },
                        {
                            key: 'companies',
                            label: (
                                <span>
                                    <BankOutlined />
                                    Company Mappings ({companyMappings.length})
                                </span>
                            ),
                            children: (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Title level={4} style={{ margin: 0 }}>
                                            Companies in {categoryName}
                                        </Title>
                                        <Tooltip title="Add company mapping">
                                            <Button
                                                type="primary"
                                                icon={<PlusOutlined />}
                                                size="small"
                                                onClick={() => handleAddMapping('company-category')}
                                            >
                                                Add Company
                                            </Button>
                                        </Tooltip>
                                    </div>
                                    <Table
                                        columns={companyColumns}
                                        dataSource={companyMappings}
                                        rowKey="_id"
                                        loading={loading}
                                        pagination={{
                                            pageSize: 10,
                                            showSizeChanger: true,
                                            showQuickJumper: true,
                                            showTotal: (total, range) =>
                                                `${range[0]}-${range[1]} of ${total} companies`,
                                        }}
                                        size="small"
                                    />
                                </div>
                            ),
                        },
                    ]}
                />
            </Card>

            {/* Mapping Form Modal */}
            <MappingForms
                visible={mappingModalVisible}
                onCancel={handleMappingCancel}
                onSuccess={handleMappingSuccess}
                mappingType={mappingType}
                entityId={categoryId}
                entityName={categoryName}
                existingMapping={editingMapping}
                existingMappings={mappingType === 'supplier-category' ? supplierMappings : companyMappings}
            />
        </div>
    );
};

export default CategoryMappings; 