// Attribute Field Types Enum
export enum AttributeFieldType {
    TEXT = 'text',
    TEXTAREA = 'textarea',
    RANGE = 'range',
    COLOR = 'color',
    BOOLEAN = 'boolean',
    NUMBER = 'number',
    NUMBER_WITH_UNIT = 'number_with_unit',
    TEXT_WITH_UNIT = 'text_with_unit',
    DATE = 'date',
    EMAIL = 'email',
    URL = 'url',
    PHONE = 'phone',
    DIMENSION_2D = 'dimension2d',
    DIMENSION_3D = 'dimension3d',
    WEIGHT = 'weight',
    VOLUME = 'volume',
    AREA = 'area',
    DURATION = 'duration',
    SIZE = 'size'
}

// Unit definitions
export interface UnitDefinition {
    unit: string;
    plural: string;
    label: string;
}

// Unit objects for different measurement types
export const WeightUnits: Record<string, UnitDefinition> = {
    GRAM: { unit: 'g', plural: 'gms', label: 'Gram' },
    KILOGRAM: { unit: 'kg', plural: 'kgs', label: 'Kilogram' },
    MILLIGRAM: { unit: 'mg', plural: 'mgs', label: 'Milligram' },
    POUND: { unit: 'lb', plural: 'lbs', label: 'Pound' },
    OUNCE: { unit: 'oz', plural: 'ozs', label: 'Ounce' },
    TON: { unit: 'ton', plural: 'tons', label: 'Ton' },
    // Indian units
    TOLLA: { unit: 'tolla', plural: 'tollas', label: 'Tolla' },
    CHHATAK: { unit: 'chhatak', plural: 'chhataks', label: 'Chhatak' },
    SEER: { unit: 'seer', plural: 'seers', label: 'Seer' },
    MAUND: { unit: 'maund', plural: 'maunds', label: 'Maund' }
};

export const LengthUnits: Record<string, UnitDefinition> = {
    MILLIMETER: { unit: 'mm', plural: 'mms', label: 'Millimeter' },
    CENTIMETER: { unit: 'cm', plural: 'cms', label: 'Centimeter' },
    METER: { unit: 'm', plural: 'ms', label: 'Meter' },
    KILOMETER: { unit: 'km', plural: 'kms', label: 'Kilometer' },
    INCH: { unit: 'in', plural: 'ins', label: 'Inch' },
    FOOT: { unit: 'ft', plural: 'fts', label: 'Foot' },
    YARD: { unit: 'yd', plural: 'yds', label: 'Yard' },
    MILE: { unit: 'mi', plural: 'mis', label: 'Mile' },
    // Indian units
    ANGUL: { unit: 'angul', plural: 'anguls', label: 'Angul' },
    HATH: { unit: 'hath', plural: 'haths', label: 'Hath' },
    GAZ: { unit: 'gaz', plural: 'gazs', label: 'Gaz' },
    KOS: { unit: 'kos', plural: 'koss', label: 'Kos' }
};

export const VolumeUnits: Record<string, UnitDefinition> = {
    MILLILITER: { unit: 'ml', plural: 'mls', label: 'Milliliter' },
    LITER: { unit: 'l', plural: 'ls', label: 'Liter' },
    CUBIC_METER: { unit: 'm³', plural: 'm³s', label: 'Cubic Meter' },
    CUBIC_CENTIMETER: { unit: 'cm³', plural: 'cm³s', label: 'Cubic Centimeter' },
    GALLON: { unit: 'gal', plural: 'gals', label: 'Gallon' },
    QUART: { unit: 'qt', plural: 'qts', label: 'Quart' },
    PINT: { unit: 'pt', plural: 'pts', label: 'Pint' },
    CUP: { unit: 'cup', plural: 'cups', label: 'Cup' },
    // Indian units
    PAO: { unit: 'pao', plural: 'paos', label: 'Pao' },
    CHHATAK: { unit: 'chhatak', plural: 'chhataks', label: 'Chhatak' },
    SEER: { unit: 'seer', plural: 'seers', label: 'Seer' },
    MAUND: { unit: 'maund', plural: 'maunds', label: 'Maund' }
};

export const AreaUnits: Record<string, UnitDefinition> = {
    SQUARE_METER: { unit: 'm²', plural: 'm²s', label: 'Square Meter' },
    SQUARE_CENTIMETER: { unit: 'cm²', plural: 'cm²s', label: 'Square Centimeter' },
    SQUARE_KILOMETER: { unit: 'km²', plural: 'km²s', label: 'Square Kilometer' },
    SQUARE_INCH: { unit: 'in²', plural: 'in²s', label: 'Square Inch' },
    SQUARE_FOOT: { unit: 'ft²', plural: 'ft²s', label: 'Square Foot' },
    SQUARE_YARD: { unit: 'yd²', plural: 'yd²s', label: 'Square Yard' },
    ACRE: { unit: 'acre', plural: 'acres', label: 'Acre' },
    HECTARE: { unit: 'ha', plural: 'has', label: 'Hectare' },
    // Indian units
    BIGH: { unit: 'bigh', plural: 'bighs', label: 'Bigh' },
    KATHA: { unit: 'katha', plural: 'kathas', label: 'Katha' },
    DHUR: { unit: 'dhur', plural: 'dhurs', label: 'Dhur' },
    BISWA: { unit: 'biswa', plural: 'biswas', label: 'Biswa' }
};

export const DurationUnits: Record<string, UnitDefinition> = {
    SECOND: { unit: 's', plural: 'secs', label: 'Second' },
    MINUTE: { unit: 'min', plural: 'mins', label: 'Minute' },
    HOUR: { unit: 'h', plural: 'hrs', label: 'Hour' },
    DAY: { unit: 'day', plural: 'days', label: 'Day' },
    WEEK: { unit: 'week', plural: 'weeks', label: 'Week' },
    MONTH: { unit: 'month', plural: 'months', label: 'Month' },
    YEAR: { unit: 'year', plural: 'years', label: 'Year' }
};

// Simple field type to display name mapping
export const ATTRIBUTE_FIELD_TYPES = {
    [AttributeFieldType.TEXT]: 'Text',
    [AttributeFieldType.TEXTAREA]: 'Text Area',
    [AttributeFieldType.RANGE]: 'Range',
    [AttributeFieldType.COLOR]: 'Color',
    [AttributeFieldType.BOOLEAN]: 'Boolean',
    [AttributeFieldType.NUMBER]: 'Number',
    [AttributeFieldType.NUMBER_WITH_UNIT]: 'Number with Unit',
    [AttributeFieldType.TEXT_WITH_UNIT]: 'Text with Unit',
    [AttributeFieldType.DATE]: 'Date',
    [AttributeFieldType.EMAIL]: 'Email',
    [AttributeFieldType.URL]: 'URL',
    [AttributeFieldType.PHONE]: 'Phone',
    [AttributeFieldType.DIMENSION_2D]: '2D Dimension',
    [AttributeFieldType.DIMENSION_3D]: '3D Dimension',
    [AttributeFieldType.WEIGHT]: 'Weight',
    [AttributeFieldType.VOLUME]: 'Volume',
    [AttributeFieldType.AREA]: 'Area',
    [AttributeFieldType.DURATION]: 'Duration',
    [AttributeFieldType.SIZE]: 'Size'
};

// Utility functions
export const getAvailableUnits = (fieldType: AttributeFieldType): Record<string, UnitDefinition> => {
    switch (fieldType) {
        case AttributeFieldType.WEIGHT:
            return WeightUnits;
        case AttributeFieldType.DIMENSION_2D:
        case AttributeFieldType.DIMENSION_3D:
            return LengthUnits;
        case AttributeFieldType.VOLUME:
            return VolumeUnits;
        case AttributeFieldType.AREA:
            return AreaUnits;
        case AttributeFieldType.DURATION:
            return DurationUnits;
        default:
            return {};
    }
};

export const getFieldTypeLabel = (fieldType: AttributeFieldType): string => {
    switch (fieldType) {
        case AttributeFieldType.TEXT:
            return 'Text';
        case AttributeFieldType.RANGE:
            return 'Range';
        case AttributeFieldType.COLOR:
            return 'Color';
        case AttributeFieldType.BOOLEAN:
            return 'Boolean';
        case AttributeFieldType.NUMBER:
            return 'Number';
        case AttributeFieldType.DATE:
            return 'Date';
        case AttributeFieldType.EMAIL:
            return 'Email';
        case AttributeFieldType.URL:
            return 'URL';
        case AttributeFieldType.PHONE:
            return 'Phone';

        case AttributeFieldType.DIMENSION_2D:
            return '2D Dimension';
        case AttributeFieldType.DIMENSION_3D:
            return '3D Dimension';
        case AttributeFieldType.WEIGHT:
            return 'Weight';
        case AttributeFieldType.VOLUME:
            return 'Volume';
        case AttributeFieldType.AREA:
            return 'Area';
        case AttributeFieldType.DURATION:
            return 'Duration';
        case AttributeFieldType.SIZE:
            return 'Size';
        default:
            return fieldType;
    }
};
