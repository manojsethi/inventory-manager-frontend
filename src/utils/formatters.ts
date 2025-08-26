/**
 * Utility functions for formatting data
 */

export interface CurrencyFormatOptions {
    type?: 'money' | 'number';
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    locale?: string;
}

export interface Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

/**
 * Formats a number with optional rupee symbol for currency
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted number string
 */
export const formatNumber = (
    amount: number,
    options: CurrencyFormatOptions = {}
): string => {
    const {
        type = 'money',
        minimumFractionDigits = 2,
        maximumFractionDigits = 2,
        locale = 'en-IN'
    } = options;

    const formattedNumber = new Intl.NumberFormat(locale, {
        minimumFractionDigits,
        maximumFractionDigits
    }).format(amount);

    return type === 'money' ? `₹ ${formattedNumber}` : formattedNumber;
};

/**
 * Formats a number with Indian locale (comma separators) - basic formatting
 * @param value - The number to format
 * @param options - Formatting options
 * @returns Formatted number string
 */
export const formatBasicNumber = (
    value: number,
    options: { minimumFractionDigits?: number; maximumFractionDigits?: number } = {}
): string => {
    const { minimumFractionDigits = 0, maximumFractionDigits = 2 } = options;

    return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits,
        maximumFractionDigits
    }).format(value);
};

/**
 * Formats a percentage value
 * @param value - The percentage value (0-100)
 * @param options - Formatting options
 * @returns Formatted percentage string
 */
export const formatPercentage = (
    value: number,
    options: { minimumFractionDigits?: number; maximumFractionDigits?: number } = {}
): string => {
    const { minimumFractionDigits = 0, maximumFractionDigits = 2 } = options;

    return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits,
        maximumFractionDigits,
        style: 'percent'
    }).format(value / 100);
};

/**
 * Formats a date string to a readable format
 * @param dateString - The date string to format
 * @param options - Formatting options
 * @returns Formatted date string
 */
export const formatDate = (
    dateString: string,
    options: {
        year?: 'numeric' | '2-digit';
        month?: 'long' | 'short' | 'numeric' | '2-digit';
        day?: 'numeric' | '2-digit';
        locale?: string;
    } = {}
): string => {
    const {
        year = 'numeric',
        month = 'long',
        day = 'numeric',
        locale = 'en-US'
    } = options;

    return new Date(dateString).toLocaleDateString(locale, {
        year,
        month,
        day
    });
};

/**
 * Formats an address object to a readable string
 * @param address - The address object to format
 * @returns Formatted address string
 */
export const formatAddress = (address: Address): string => {
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
}; 