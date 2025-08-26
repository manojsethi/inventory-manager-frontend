import React, { useState } from 'react';
import { Button, message, Tooltip, Modal } from 'antd';
import { SyncOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { syncService, type SyncResponse } from '../services';

interface SyncButtonProps {
    size?: 'small' | 'middle' | 'large';
    type?: 'text' | 'link' | 'default' | 'primary' | 'dashed';
    showText?: boolean;
    className?: string;
}

const SyncButton: React.FC<SyncButtonProps> = ({
    size = 'small',
    type = 'default',
    showText = true,
    className = ''
}) => {
    const [loading, setLoading] = useState(false);
    const [lastSync, setLastSync] = useState<string | null>(null);

    const handleSync = async () => {
        Modal.confirm({
            title: 'Sync Counts',
            content: 'This will synchronize all entity counts with the backend. Continue?',
            okText: 'Sync Now',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    setLoading(true);
                    const response: SyncResponse = await syncService.syncCounts();

                    if (response.success) {
                        message.success(response.message || 'Counts synchronized successfully!');
                        setLastSync(new Date().toISOString());

                        // Show detailed results
                        if (response.data?.updatedCounts) {
                            const counts = response.data.updatedCounts;
                            Modal.success({
                                title: 'Sync Completed',
                                content: (
                                    <div>
                                        <p>✅ All counts have been synchronized:</p>
                                        <ul style={{ marginTop: 8 }}>
                                            <li>Products: {counts.products}</li>
                                            <li>Categories: {counts.categories}</li>
                                            <li>Suppliers: {counts.suppliers}</li>
                                            <li>Companies: {counts.companies}</li>
                                        </ul>
                                        <p style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                                            Last sync: {new Date(response.data.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                ),
                                okText: 'OK'
                            });
                        }
                    } else {
                        message.error(response.message || 'Sync failed');
                    }
                } catch (error) {
                    message.error(error instanceof Error ? error.message : 'Sync failed');
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const getButtonContent = () => {
        if (loading) {
            return (
                <>
                    <SyncOutlined spin />
                    {showText && <span style={{ marginLeft: 4 }}>Syncing...</span>}
                </>
            );
        }

        if (lastSync) {
            return (
                <>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    {showText && <span style={{ marginLeft: 4 }}>Synced</span>}
                </>
            );
        }

        return (
            <>
                <SyncOutlined />
                {showText && <span style={{ marginLeft: 4 }}>Sync Counts</span>}
            </>
        );
    };

    const getTooltipTitle = () => {
        if (loading) return 'Syncing counts...';
        if (lastSync) return `Last synced: ${new Date(lastSync).toLocaleString()}`;
        return 'Synchronize entity counts with backend';
    };

    return (
        <Tooltip title={getTooltipTitle()}>
            <Button
                type={type}
                size={size}
                icon={getButtonContent()}
                onClick={handleSync}
                disabled={loading}
                className={className}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            />
        </Tooltip>
    );
};

export default SyncButton; 