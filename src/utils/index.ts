import { ATTRIBUTE_FIELD_TYPES, AttributeFieldType } from '../constants/attributeConfigs';

export { default as axios, clearCallbacks, setLogoutCallback } from './axios';
export type { LogoutFunction } from './axios';

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

