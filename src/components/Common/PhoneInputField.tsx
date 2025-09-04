import React from 'react';
import { Form, message } from 'antd';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import ValidatePhoneNumber from '../../utils/ValidatePhoneNumber';

interface PhoneInputFieldProps {
    name?: string;
    placeholder?: string;
    country?: string;
    disabled?: boolean;
    className?: string;
    inputStyle?: React.CSSProperties;
    buttonStyle?: React.CSSProperties;
    onChange?: (value: string) => void;
    initialValue?: string;
    value?: string; // Controlled value
}

const PhoneInputField: React.FC<PhoneInputFieldProps> = ({
    name,
    placeholder = "Enter phone number",
    country = 'in',
    className = "",
    inputStyle = {},
    onChange,
    value
}) => {

    const defaultInputStyle = {
        width: '100%',
        border: '1px solid #e9edf4',
        fontSize: '14px',
        ...inputStyle
    };

    return (
        <PhoneInput
            specialLabel=""

            country={country}
            inputClass={`ant-input ${className}`}
            inputStyle={defaultInputStyle}
            placeholder={placeholder}
            value={value}
            onChange={(value, countryData, event, formattedValue) => {
                if (onChange) {
                    onChange(formattedValue);
                }
            }}
        />
    );
};

// Export validation rules that can be used externally
export const getPhoneInputValidationRules = (required: boolean = false) => [
    {
        required: required,
        message: 'Phone number is required',
    },
    {
        min: 5,
        message: 'Phone number is too short',
    },
    {
        validator: async (rule: any, value: string) => {
            if (!value || value.trim() === '') {
                return await Promise.resolve();
            }

            // Validate the phone number (should already be formatted)
            if (ValidatePhoneNumber(value)) {
                return await Promise.resolve();
            } else {
                return await Promise.reject(
                    Error('Phone number is not in correct format')
                );
            }
        },
    },
];

export default PhoneInputField;
