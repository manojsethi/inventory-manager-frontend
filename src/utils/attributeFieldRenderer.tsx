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
export const renderAttributeField = (attribute: { fieldType: AttributeFieldType; displayName: string;[key: string]: any }, formPath: (string | number)[]) => {
    switch (attribute.fieldType) {
        case AttributeFieldType.TEXT:
            return (
                <Form.Item name={formPath} noStyle>
                    <Input placeholder={`Enter ${attribute.displayName}`} className="text-left" />
                </Form.Item>
            );

        case AttributeFieldType.TEXTAREA:
            return (
                <Form.Item name={formPath} noStyle>
                    <TextArea rows={4} placeholder={`Enter ${attribute.displayName}`} className="text-left" />
                </Form.Item>
            );

        case AttributeFieldType.NUMBER:
            return (
                <Form.Item name={formPath} noStyle>
                    <InputNumber style={{ width: '100%' }} placeholder={`Enter ${attribute.displayName}`} className="text-left" />
                </Form.Item>
            );

        case AttributeFieldType.BOOLEAN:
            return (
                <Form.Item name={formPath} noStyle valuePropName="checked">
                    <Checkbox>{attribute.displayName}</Checkbox>
                </Form.Item>
            );



        case AttributeFieldType.DATE:
            return (
                <Form.Item name={formPath} noStyle>
                    <DatePicker style={{ width: '100%' }} placeholder={`Select ${attribute.displayName}`} className="text-left" />
                </Form.Item>
            );

        case AttributeFieldType.COLOR:
            return (
                <Form.Item name={formPath} noStyle getValueFromEvent={(color) => {
                    return color ? `#${color.toHex()}` : undefined;
                }}>
                    <ColorPicker format="hex" />
                </Form.Item>
            );

        case AttributeFieldType.RANGE:
            return (
                <Space className="text-left">
                    <Form.Item name={[...formPath, 'min']} noStyle>
                        <InputNumber placeholder="Min" style={{ width: '100%' }} className="text-left" />
                    </Form.Item>
                    <span>to</span>
                    <Form.Item name={[...formPath, 'max']} noStyle>
                        <InputNumber placeholder="Max" style={{ width: '100%' }} className="text-left" />
                    </Form.Item>
                </Space>
            );



        case AttributeFieldType.DIMENSION_2D:
            return (
                <div className="space-y-2 text-left">
                    <Row gutter={8}>
                        <Col span={8}>
                            <Form.Item name={[...formPath, 'unit']} noStyle initialValue="cm">
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
                            <Form.Item name={[...formPath, 'length']} noStyle>
                                <InputNumber placeholder="Length" style={{ width: '100%' }} precision={2} className="text-left" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name={[...formPath, 'width']} noStyle>
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
                            <Form.Item name={[...formPath, 'unit']} noStyle initialValue="cm">
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
                            <Form.Item name={[...formPath, 'length']} noStyle>
                                <InputNumber placeholder="Length" style={{ width: '100%' }} precision={2} className="text-left" />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name={[...formPath, 'width']} noStyle>
                                <InputNumber placeholder="Width" style={{ width: '100%' }} precision={2} className="text-left" />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name={[...formPath, 'height']} noStyle>
                                <InputNumber placeholder="Height" style={{ width: '100%' }} precision={2} className="text-left" />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name={[...formPath, 'depth']} noStyle>
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
                            <Form.Item name={[...formPath, 'unit']} noStyle initialValue="kg">
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
                            <Form.Item name={[...formPath, 'value']} noStyle>
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
                            <Form.Item name={[...formPath, 'unit']} noStyle initialValue="l">
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
                            <Form.Item name={[...formPath, 'value']} noStyle>
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
                            <Form.Item name={[...formPath, 'unit']} noStyle initialValue="m²">
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
                            <Form.Item name={[...formPath, 'value']} noStyle>
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
                            <Form.Item name={[...formPath, 'unit']} noStyle initialValue="h">
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
                            <Form.Item name={[...formPath, 'value']} noStyle>
                                <InputNumber style={{ width: '100%' }} placeholder={`Enter ${attribute.displayName}`} precision={2} min={0} />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>
            );

        case AttributeFieldType.SIZE:
            return (
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
            );

        case AttributeFieldType.EMAIL:
            return (
                <Form.Item name={formPath} noStyle>
                    <Input type="email" placeholder={`Enter ${attribute.displayName}`} />
                </Form.Item>
            );

        case AttributeFieldType.URL:
            return (
                <Form.Item name={formPath} noStyle>
                    <Input type="url" placeholder={`Enter ${attribute.displayName}`} />
                </Form.Item>
            );

        case AttributeFieldType.PHONE:
            return (
                <Form.Item name={formPath} noStyle>
                    <Input placeholder={`Enter ${attribute.displayName}`} />
                </Form.Item>
            );

        default:
            return (
                <Form.Item name={formPath} noStyle>
                    <Input placeholder={`Enter ${attribute.displayName}`} />
                </Form.Item>
            );
    }
};