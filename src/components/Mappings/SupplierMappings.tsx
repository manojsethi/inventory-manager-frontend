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
    BankOutlined,
    ShoppingOutlined,
    RiseOutlined
} from '@ant-design/icons';
import {
    supplierCategoryService,
    supplierCompanyService
} from '../../services';
import type { SupplierCategory, SupplierCompany } from '../../types';
import MappingForms from './MappingForms';
import { formatNumber } from '../../utils/formatters';
import { ImageWithFallback } from '../Common';

const { Title, Text } = Typography;

interface SupplierMappingsProps {
    supplierId: string;
    supplierName: string;
}

const SupplierMappings: React.FC<SupplierMappingsProps> = ({ supplierId, supplierName }) => {
    const [categoryMappings, setCategoryMappings] = useState<SupplierCategory[]>([]);
    const [companyMappings, setCompanyMappings] = useState<SupplierCompany[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('categories');

    // Modal states
    const [mappingModalVisible, setMappingModalVisible] = useState(false);
    const [mappingType, setMappingType] = useState<'supplier-category' | 'supplier-company'>('supplier-category');
    const [editingMapping, setEditingMapping] = useState<any>(null);

    const fetchMappings = useCallback(async () => {
        try {
            setLoading(true);
            const [categoryData, companyData] = await Promise.all([
                supplierCategoryService.getBySupplier(supplierId),
                supplierCompanyService.getBySupplier(supplierId)
            ]);
            setCategoryMappings(categoryData);
            setCompanyMappings(companyData);
        } catch (err) {
            message.error(err instanceof Error ? err.message : 'Failed to fetch mappings');
        } finally {
            setLoading(false);
        }
    }, [supplierId]);

    useEffect(() => {
        fetchMappings();
    }, [fetchMappings]);

    const handleDeleteCategoryMapping = async (id: string) => {
        try {
            await supplierCategoryService.delete(id);
            message.success('Category mapping deleted successfully');
            fetchMappings();
        } catch (err) {
            message.error(err instanceof Error ? err.message : 'Failed to delete category mapping');
        }
    };

    const handleDeleteCompanyMapping = async (id: string) => {
        try {
            await supplierCompanyService.delete(id);
            message.success('Company mapping deleted successfully');
            fetchMappings();
        } catch (err) {
            message.error(err instanceof Error ? err.message : 'Failed to delete company mapping');
        }
    };

    const handleAddMapping = (type: 'supplier-category' | 'supplier-company') => {
        setMappingType(type);
        setEditingMapping(null);
        setMappingModalVisible(true);
    };

    const handleEditMapping = (mapping: any, type: 'supplier-category' | 'supplier-company') => {
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
            render: (record: SupplierCategory) => (
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
            render: (record: SupplierCategory) => (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                    {record.notes || 'No notes'}
                </Text>
            ),
            width: 200,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record: SupplierCategory) => (
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
                        onClick={() => handleEditMapping(record, 'supplier-category')}
                    />
                    <Popconfirm
                        title="Delete Mapping"
                        description="Are you sure you want to remove this category from the supplier?"
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

    const companyColumns = [
        {
            title: 'Company',
            key: 'company',
            render: (record: SupplierCompany) => (
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                        {record.companyId.logo ? (
                            <ImageWithFallback
                                src={record.companyId.logo}
                                alt={record.companyId.name}
                                size="medium"
                                variant="logo"
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
            title: 'Margin Tiers',
            key: 'marginTiers',
            render: (record: SupplierCompany) => (
                <div className="space-y-1">
                    {record.marginTiers.slice(0, 2).map((tier, index) => (
                        <div key={index} style={{ fontSize: '11px' }}>
                            <Text type="secondary">
                                ₹{tier.minAmount.toLocaleString()}+: {tier.marginPercentage}%
                            </Text>
                        </div>
                    ))}
                    {record.marginTiers.length > 2 && (
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                            +{record.marginTiers.length - 2} more tiers
                        </Text>
                    )}
                </div>
            ),
            width: 120,
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
                        onClick={() => handleEditMapping(record, 'supplier-company')}
                    />
                    <Popconfirm
                        title="Delete Mapping"
                        description="Are you sure you want to remove this company from the supplier?"
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

    // Calculate statistics
    const totalOrders = companyMappings.reduce((sum, mapping) => sum + mapping.totalOrders, 0);
    const totalValue = companyMappings.reduce((sum, mapping) => sum + mapping.totalValue, 0);

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
                            title="Company Mappings"
                            value={companyMappings.length}
                            prefix={<BankOutlined />}
                            valueStyle={{ color: '#52c41a' }}
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
                            valueStyle={{ color: '#fa8c16' }}
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
                                            Categories for {supplierName}
                                        </Title>
                                        <Tooltip title="Add category mapping">
                                            <Button
                                                type="primary"
                                                icon={<PlusOutlined />}
                                                size="small"
                                                onClick={() => handleAddMapping('supplier-category')}
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
                                            Companies for {supplierName}
                                        </Title>
                                        <Tooltip title="Add company mapping">
                                            <Button
                                                type="primary"
                                                icon={<PlusOutlined />}
                                                size="small"
                                                onClick={() => handleAddMapping('supplier-company')}
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
                entityId={supplierId}
                entityName={supplierName}
                existingMapping={editingMapping}
                existingMappings={mappingType === 'supplier-category' ? categoryMappings : companyMappings}
            />
        </div>
    );
};

export default SupplierMappings; 