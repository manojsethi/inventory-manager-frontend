import React from 'react';
import { ColorPicker, Form, Input } from 'antd';

interface ColorFieldProps {
    formPath?: (string | number)[];
}

const ColorField: React.FC<ColorFieldProps> = ({ formPath }) => {
    const [form] = Form.useForm();

    return (
        <div className="flex items-center space-x-2">
            <Form.Item name={formPath} noStyle>
                <Input
                    placeholder="#000000"
                    readOnly
                    className="w-24"
                />
            </Form.Item>
            <ColorPicker
                format="hex"
                onChange={(color, hex) => {
                    // Update the input field with hex value
                    form.setFieldValue(formPath, hex);
                }}
            />
        </div>
    );
};

export default ColorField;
