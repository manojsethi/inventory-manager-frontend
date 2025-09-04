/**
 * Phone number validation utility using libphonenumber-js
 *
 * This module provides a function to validate phone numbers using the libphonenumber-js library,
 * which implements Google's libphonenumber validation rules for international phone numbers.
 */
import { parsePhoneNumberFromString } from 'libphonenumber-js';

/**
 * Validates if a string is a properly formatted phone number
 *
 * Uses the libphonenumber-js library to parse and validate phone numbers
 * according to international standards.
 *
 * @param {string} value - The phone number to validate
 * @returns {boolean} True if the phone number is valid, false otherwise
 */
const ValidatePhoneNumber = (value: string): boolean => {
    if (!value || value.trim() === '') return false;

    let parsedPhoneNumber = parsePhoneNumberFromString(value);

    if (parsedPhoneNumber !== undefined && parsedPhoneNumber !== null) {
        if (parsedPhoneNumber.isValid()) {
            return true;
        } else return false;
    }

    return false;
};

export default ValidatePhoneNumber;
