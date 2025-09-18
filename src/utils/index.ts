import { ATTRIBUTE_FIELD_TYPES, AttributeFieldType } from '../constants/attributeConfigs';

export { axiosInstance as axios, clearCallbacks, setLogoutCallback } from './axiosInstance';
export type { LogoutFunction } from './axiosInstance';

/**
 * Generate available attributes from ATTRIBUTE_FIELD_TYPES
 * This eliminates the need to pass availableAttributes as props everywhere
 */
export const getAvailableAttributes = () => {
    return Object.entries(ATTRIBUTE_FIELD_TYPES).map(([key, label]) => ({
        _id: key,
        name: key.toLowerCase().replace(/_/g, ''),
        displayName: label,
        fieldType: key as AttributeFieldType
    }));
};

