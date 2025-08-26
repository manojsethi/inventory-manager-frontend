import React from 'react';
import {
    Input,
    Select,
    InputNumber,
    Checkbox,
    DatePicker,
    ColorPicker,
    Space,
    Row,
    Col,
    Form
} from 'antd';
import {
    AttributeFieldType
} from '../constants/attributeConfigs';

const { TextArea } = Input;

const { Option } = Select;

/**
 * Renders the appropriate form field based on the attribute field type
 * @param attribute - The attribute definition containing fieldType and other properties
 * @returns React component for the form field
 */
export const renderAttributeField = (attribute: { fieldType: AttributeFieldType; displayName: string;[key: string]: any }, formPath?: (string | number)[]) => {
    console.log('🎯 renderAttributeField called with:', {
        fieldType: attribute.fieldType,
        displayName: attribute.displayName,
        formPath
    });

    if (!formPath) {
        console.warn('🎯 renderAttributeField: No formPath provided!');
        return null;
    }
    switch (attribute.fieldType) {
        case AttributeFieldType.TEXT:
            return formPath ? (
                <Form.Item name={formPath} noStyle>
                    <Input placeholder={`Enter ${attribute.displayName}`} className="text-left" />
                </Form.Item>
            ) : <Input placeholder={`Enter ${attribute.displayName}`} className="text-left" />;

        case AttributeFieldType.TEXTAREA:
            return formPath ? (
                <Form.Item name={formPath} noStyle>
                    <TextArea rows={4} placeholder={`Enter ${attribute.displayName}`} className="text-left" />
                </Form.Item>
            ) : <TextArea rows={4} placeholder={`Enter ${attribute.displayName}`} className="text-left" />;

        case AttributeFieldType.NUMBER:
            return formPath ? (
                <Form.Item name={formPath} noStyle>
                    <InputNumber style={{ width: '100%' }} placeholder={`Enter ${attribute.displayName}`} className="text-left" />
                </Form.Item>
            ) : <InputNumber style={{ width: '100%' }} placeholder={`Enter ${attribute.displayName}`} className="text-left" />;

        case AttributeFieldType.BOOLEAN:
            return formPath ? (
                <Form.Item name={formPath} noStyle valuePropName="checked">
                    <Checkbox>{attribute.displayName}</Checkbox>
                </Form.Item>
            ) : <Checkbox>{attribute.displayName}</Checkbox>;



        case AttributeFieldType.DATE:
            return formPath ? (
                <Form.Item name={formPath} noStyle>
                    <DatePicker style={{ width: '100%' }} placeholder={`Select ${attribute.displayName}`} className="text-left" />
                </Form.Item>
            ) : <DatePicker style={{ width: '100%' }} placeholder={`Select ${attribute.displayName}`} className="text-left" />;

        case AttributeFieldType.COLOR:
            return formPath ? (
                <Form.Item name={formPath} noStyle getValueFromEvent={(color) => {
                    return color ? `#${color.toHex()}` : undefined;
                }}>
                    <ColorPicker format="hex" />
                </Form.Item>
            ) : <ColorPicker format="hex" />;

        case AttributeFieldType.RANGE:
            return (
                <Space className="text-left">
                    <Form.Item name={formPath ? [...formPath, 'min'] : 'min'} noStyle>
                        <InputNumber placeholder="Min" style={{ width: '100%' }} className="text-left" />
                    </Form.Item>
                    <span>to</span>
                    <Form.Item name={formPath ? [...formPath, 'max'] : 'max'} noStyle>
                        <InputNumber placeholder="Max" style={{ width: '100%' }} className="text-left" />
                    </Form.Item>
                </Space>
            );



        case AttributeFieldType.DIMENSION_2D:
            return (
                <div className="space-y-2 text-left">
                    <Row gutter={8}>
                        <Col span={8}>
                            <Form.Item name={formPath ? [...formPath, 'unit'] : 'unit'} noStyle initialValue="cm">
                                <Select placeholder="Select unit" style={{ width: '100%' }} className="text-left">
                                    <Option value="mm">Millimeter (mm)</Option>
                                    <Option value="cm">Centimeter (cm)</Option>
                                    <Option value="m">Meter (m)</Option>
                                    <Option value="in">Inch (in)</Option>
                                    <Option value="ft">Foot (ft)</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col span={12}>
                            <Form.Item name={formPath ? [...formPath, 'length'] : 'length'} noStyle>
                                <InputNumber placeholder="Length" style={{ width: '100%' }} precision={2} className="text-left" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name={formPath ? [...formPath, 'width'] : 'width'} noStyle>
                                <InputNumber placeholder="Width" style={{ width: '100%' }} precision={2} className="text-left" />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>
            );

        case AttributeFieldType.DIMENSION_3D:
            return (
                <div className="space-y-2 text-left">
                    <Row gutter={8}>
                        <Col span={8}>
                            <Form.Item name={formPath ? [...formPath, 'unit'] : 'unit'} noStyle initialValue="cm">
                                <Select placeholder="Select unit" style={{ width: '100%' }} className="text-left">
                                    <Option value="mm">Millimeter (mm)</Option>
                                    <Option value="cm">Centimeter (cm)</Option>
                                    <Option value="m">Meter (m)</Option>
                                    <Option value="in">Inch (in)</Option>
                                    <Option value="ft">Foot (ft)</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col span={6}>
                            <Form.Item name={formPath ? [...formPath, 'length'] : 'length'} noStyle>
                                <InputNumber placeholder="Length" style={{ width: '100%' }} precision={2} className="text-left" />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name={formPath ? [...formPath, 'width'] : 'width'} noStyle>
                                <InputNumber placeholder="Width" style={{ width: '100%' }} precision={2} className="text-left" />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name={formPath ? [...formPath, 'height'] : 'height'} noStyle>
                                <InputNumber placeholder="Height" style={{ width: '100%' }} precision={2} className="text-left" />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name={formPath ? [...formPath, 'depth'] : 'depth'} noStyle>
                                <InputNumber placeholder="Depth" style={{ width: '100%' }} precision={2} className="text-left" />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>
            );

        case AttributeFieldType.WEIGHT:
            return (
                <div className="space-y-2 text-left">
                    <Row gutter={8}>
                        <Col span={8}>
                            <Form.Item name={formPath ? [...formPath, 'unit'] : 'unit'} noStyle initialValue="kg">
                                <Select placeholder="Select unit" style={{ width: '100%' }} className="text-left">
                                    <Option value="g">Gram (g)</Option>
                                    <Option value="kg">Kilogram (kg)</Option>
                                    <Option value="lb">Pound (lb)</Option>
                                    <Option value="oz">Ounce (oz)</Option>
                                    <Option value="ton">Ton (ton)</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={16}>
                            <Form.Item name={formPath ? [...formPath, 'value'] : 'value'} noStyle>
                                <InputNumber style={{ width: '100%' }} placeholder={`Enter ${attribute.displayName}`} precision={2} min={0} className="text-left" />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>
            );

        case AttributeFieldType.VOLUME:
            return (
                <div className="space-y-2 text-left">
                    <Row gutter={8}>
                        <Col span={8}>
                            <Form.Item name={formPath ? [...formPath, 'unit'] : 'unit'} noStyle initialValue="l">
                                <Select placeholder="Select unit" style={{ width: '100%' }} className="text-left">
                                    <Option value="ml">Milliliter (ml)</Option>
                                    <Option value="l">Liter (l)</Option>
                                    <Option value="m³">Cubic Meter (m³)</Option>
                                    <Option value="gal">Gallon (gal)</Option>
                                    <Option value="qt">Quart (qt)</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={16}>
                            <Form.Item name={formPath ? [...formPath, 'value'] : 'value'} noStyle>
                                <InputNumber style={{ width: '100%' }} placeholder={`Enter ${attribute.displayName}`} precision={2} min={0} className="text-left" />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>
            );

        case AttributeFieldType.AREA:
            return (
                <div className="space-y-2 text-left">
                    <Row gutter={8}>
                        <Col span={8}>
                            <Form.Item name={formPath ? [...formPath, 'unit'] : 'unit'} noStyle initialValue="m²">
                                <Select placeholder="Select unit" style={{ width: '100%' }} className="text-left">
                                    <Option value="m²">Square Meter (m²)</Option>
                                    <Option value="cm²">Square Centimeter (cm²)</Option>
                                    <Option value="ft²">Square Foot (ft²)</Option>
                                    <Option value="acre">Acre (acre)</Option>
                                    <Option value="ha">Hectare (ha)</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={16}>
                            <Form.Item name={formPath ? [...formPath, 'value'] : 'value'} noStyle>
                                <InputNumber style={{ width: '100%' }} placeholder={`Enter ${attribute.displayName}`} precision={2} min={0} className="text-left" />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>
            );

        case AttributeFieldType.DURATION:
            return (
                <div className="space-y-2">
                    <Row gutter={8}>
                        <Col span={8}>
                            <Form.Item name={formPath ? [...formPath, 'unit'] : 'unit'} noStyle initialValue="h">
                                <Select placeholder="Select unit" style={{ width: '100%' }}>
                                    <Option value="s">Second (s)</Option>
                                    <Option value="min">Minute (min)</Option>
                                    <Option value="h">Hour (h)</Option>
                                    <Option value="day">Day (day)</Option>
                                    <Option value="week">Week (week)</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={16}>
                            <Form.Item name={formPath ? [...formPath, 'value'] : 'value'} noStyle>
                                <InputNumber style={{ width: '100%' }} placeholder={`Enter ${attribute.displayName}`} precision={2} min={0} />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>
            );

        case AttributeFieldType.SIZE:
            return formPath ? (
                <Form.Item name={formPath} noStyle>
                    <Select placeholder={`Select ${attribute.displayName}`} style={{ width: '100%' }}>
                        <Option value="XS">Extra Small (XS)</Option>
                        <Option value="S">Small (S)</Option>
                        <Option value="M">Medium (M)</Option>
                        <Option value="L">Large (L)</Option>
                        <Option value="XL">Extra Large (XL)</Option>
                        <Option value="XXL">Double XL (XXL)</Option>
                    </Select>
                </Form.Item>
            ) : (
                <Select placeholder={`Select ${attribute.displayName}`} style={{ width: '100%' }}>
                    <Option value="XS">Extra Small (XS)</Option>
                    <Option value="S">Small (S)</Option>
                    <Option value="M">Medium (M)</Option>
                    <Option value="L">Large (L)</Option>
                    <Option value="XL">Extra Large (XL)</Option>
                    <Option value="XXL">Double XL (XXL)</Option>
                </Select>
            );

        case AttributeFieldType.EMAIL:
            return formPath ? (
                <Form.Item name={formPath} noStyle>
                    <Input type="email" placeholder={`Enter ${attribute.displayName}`} />
                </Form.Item>
            ) : <Input type="email" placeholder={`Enter ${attribute.displayName}`} />;

        case AttributeFieldType.URL:
            return formPath ? (
                <Form.Item name={formPath} noStyle>
                    <Input type="url" placeholder={`Enter ${attribute.displayName}`} />
                </Form.Item>
            ) : <Input type="url" placeholder={`Enter ${attribute.displayName}`} />;

        case AttributeFieldType.PHONE:
            return formPath ? (
                <Form.Item name={formPath} noStyle>
                    <Input placeholder={`Enter ${attribute.displayName}`} />
                </Form.Item>
            ) : <Input placeholder={`Enter ${attribute.displayName}`} />;

        default:
            return formPath ? (
                <Form.Item name={formPath} noStyle>
                    <Input placeholder={`Enter ${attribute.displayName}`} />
                </Form.Item>
            ) : <Input placeholder={`Enter ${attribute.displayName}`} />;
    }
};