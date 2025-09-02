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
    TagsOutlined,
    UserOutlined,
    ShoppingOutlined,
    RiseOutlined
} from '@ant-design/icons';
import {
    companyCategoryService,
    supplierCompanyService
} from '../../services';
import type { CompanyCategory, SupplierCompany } from '../../types';
import MappingForms from './MappingForms';
import { formatNumber } from '../../utils/formatters';

const { Title, Text } = Typography;

interface CompanyMappingsProps {
    companyId: string;
    companyName: string;
}

const CompanyMappings: React.FC<CompanyMappingsProps> = ({ companyId, companyName }) => {
    const [categoryMappings, setCategoryMappings] = useState<CompanyCategory[]>([]);
    const [supplierMappings, setSupplierMappings] = useState<SupplierCompany[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('categories');

    // Modal states
    const [mappingModalVisible, setMappingModalVisible] = useState(false);
    const [mappingType, setMappingType] = useState<'company-category' | 'supplier-company'>('company-category');
    const [editingMapping, setEditingMapping] = useState<any>(null);

    const fetchMappings = useCallback(async () => {
        try {
            setLoading(true);
            const [categoryData, supplierData] = await Promise.all([
                companyCategoryService.getByCompany(companyId),
                supplierCompanyService.getByCompany(companyId)
            ]);
            setCategoryMappings(categoryData);
            setSupplierMappings(supplierData);
        } catch (err) {
            message.error(err instanceof Error ? err.message : 'Failed to fetch mappings');
        } finally {
            setLoading(false);
        }
    }, [companyId]);

    useEffect(() => {
        fetchMappings();
    }, [fetchMappings]);

    const handleDeleteCategoryMapping = async (id: string) => {
        try {
            await companyCategoryService.delete(id);
            message.success('Category mapping deleted successfully');
            fetchMappings();
        } catch (err) {
            message.error(err instanceof Error ? err.message : 'Failed to delete category mapping');
        }
    };

    const handleDeleteSupplierMapping = async (id: string) => {
        try {
            await supplierCompanyService.delete(id);
            message.success('Supplier mapping deleted successfully');
            fetchMappings();
        } catch (err) {
            message.error(err instanceof Error ? err.message : 'Failed to delete supplier mapping');
        }
    };

    const handleAddMapping = (type: 'company-category' | 'supplier-company') => {
        setMappingType(type);
        setEditingMapping(null);
        setMappingModalVisible(true);
    };

    const handleEditMapping = (mapping: any, type: 'company-category' | 'supplier-company') => {
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

    const categoryColumns = [
        {
            title: 'Category',
            key: 'category',
            render: (record: CompanyCategory) => (
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                        {record.categoryId.logo ? (
                            <Image
                                src={record.categoryId.logo}
                                alt={record.categoryId.name}
                                width={40}
                                height={40}
                                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                                style={{ borderRadius: '6px' }}
                            />
                        ) : (
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <TagsOutlined className="text-blue-600" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>
                            {record.categoryId.name}
                        </div>
                        {record.categoryId.description && (
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                {record.categoryId.description}
                            </Text>
                        )}
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
                    <Link to={`/categories/${record.categoryId._id}`}>
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            size="small"
                            title="View Category"
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
                        description="Are you sure you want to remove this category from the company?"
                        onConfirm={() => handleDeleteCategoryMapping(record._id)}
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

    const supplierColumns = [
        {
            title: 'Supplier',
            key: 'supplier',
            render: (record: SupplierCompany) => (
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <UserOutlined className="text-orange-600" />
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
            render: (record: SupplierCompany) => (
                <div>
                    <div style={{ fontSize: '12px' }}>
                        <Text strong>Email:</Text> {record.supplierId.email}
                    </div>
                    <div style={{ fontSize: '12px' }}>
                        <Text strong>Phone:</Text> {record.supplierId.phone}
                    </div>
                </div>
            ),
            width: 180,
        },
        {
            title: 'Performance',
            key: 'performance',
            render: (record: SupplierCompany) => (
                <div className="space-y-2">
                    <div style={{ fontSize: '12px' }}>
                        <Text strong>Orders:</Text> {record.totalOrders}
                    </div>
                    <div style={{ fontSize: '12px' }}>
                        <Text strong>Value:</Text> {formatNumber(record.totalValue)}
                    </div>
                    <div style={{ fontSize: '12px' }}>
                        <Text strong>Avg Margin:</Text> {record.averageMargin.toFixed(1)}%
                    </div>
                </div>
            ),
            width: 150,
        },
        {
            title: 'Status',
            key: 'status',
            render: (record: SupplierCompany) => (
                <Tag color={record.isActive ? 'green' : 'red'}>
                    {record.isActive ? 'Active' : 'Inactive'}
                </Tag>
            ),
            width: 80,
        },
        {
            title: 'Notes',
            key: 'notes',
            render: (record: SupplierCompany) => (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                    {record.notes || 'No notes'}
                </Text>
            ),
            width: 150,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record: SupplierCompany) => (
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
                        onClick={() => handleEditMapping(record, 'supplier-company')}
                    />
                    <Popconfirm
                        title="Delete Mapping"
                        description="Are you sure you want to remove this supplier from the company?"
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

    // Calculate statistics
    const totalOrders = supplierMappings.reduce((sum, mapping) => sum + mapping.totalOrders, 0);
    const totalValue = supplierMappings.reduce((sum, mapping) => sum + mapping.totalValue, 0);

    return (
        <div className="space-y-6">
            {/* Statistics */}
            <Row gutter={16}>
                <Col xs={24} sm={6}>
                    <Card>
                        <Statistic
                            title="Category Mappings"
                            value={categoryMappings.length}
                            prefix={<TagsOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card>
                        <Statistic
                            title="Supplier Mappings"
                            value={supplierMappings.length}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#fa8c16' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card>
                        <Statistic
                            title="Total Orders"
                            value={totalOrders}
                            prefix={<ShoppingOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card>
                        <Statistic
                            title="Total Value"
                            value={totalValue}
                            prefix={<RiseOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                            formatter={(value) => formatNumber(Number(value))}
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
                            key: 'categories',
                            label: (
                                <span>
                                    <TagsOutlined />
                                    Category Mappings ({categoryMappings.length})
                                </span>
                            ),
                            children: (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Title level={4} style={{ margin: 0 }}>
                                            Categories for {companyName}
                                        </Title>
                                        <Tooltip title="Add category mapping">
                                            <Button
                                                type="primary"
                                                icon={<PlusOutlined />}
                                                size="small"
                                                onClick={() => handleAddMapping('company-category')}
                                            >
                                                Add Category
                                            </Button>
                                        </Tooltip>
                                    </div>
                                    <Table
                                        columns={categoryColumns}
                                        dataSource={categoryMappings}
                                        rowKey="_id"
                                        loading={loading}
                                        pagination={{
                                            pageSize: 10,
                                            showSizeChanger: true,
                                            showQuickJumper: true,
                                            showTotal: (total, range) =>
                                                `${range[0]}-${range[1]} of ${total} categories`,
                                        }}
                                        size="small"
                                    />
                                </div>
                            ),
                        },
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
                                            Suppliers for {companyName}
                                        </Title>
                                        <Tooltip title="Add supplier mapping">
                                            <Button
                                                type="primary"
                                                icon={<PlusOutlined />}
                                                size="small"
                                                onClick={() => handleAddMapping('supplier-company')}
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
                    ]}
                />
            </Card>

            {/* Mapping Form Modal */}
            <MappingForms
                visible={mappingModalVisible}
                onCancel={handleMappingCancel}
                onSuccess={handleMappingSuccess}
                mappingType={mappingType}
                entityId={companyId}
                entityName={companyName}
                existingMapping={editingMapping}
                existingMappings={mappingType === 'company-category' ? categoryMappings : supplierMappings}
            />
        </div>
    );
};

export default CompanyMappings; 