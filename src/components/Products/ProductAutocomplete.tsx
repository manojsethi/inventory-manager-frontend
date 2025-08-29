import React, { useState, useEffect, useRef } from 'react';
import { AutoComplete, Input, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { productService, type Product } from '../../services';
import debounce from 'lodash/debounce';

interface ProductAutocompleteProps {
    value?: string;
    onChange?: (value: string, product?: Product) => void;
    placeholder?: string;
    disabled?: boolean;
    style?: React.CSSProperties;
}

interface ProductOption {
    value: string;
    label: string;
    product: Product;
}

const ProductAutocomplete: React.FC<ProductAutocompleteProps> = ({
    value,
    onChange,
    placeholder = "Search products by name...",
    disabled = false,
    style
}) => {
    const [options, setOptions] = useState<ProductOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchValue, setSearchValue] = useState(value || '');

    // Debounced search function
    const debouncedSearch = useRef(
        debounce(async (query: string) => {
            if (query.length < 2) {
                setOptions([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const products = await productService.searchProducts(query, 10);

                const productOptions: ProductOption[] = products.map(product => ({
                    value: product.name,
                    label: `${product.name} (${product.productBrand?.name || 'No Brand'})`,
                    product
                }));

                setOptions(productOptions);
            } catch (error) {
                console.error('Error searching products:', error);
                setOptions([]);
            } finally {
                setLoading(false);
            }
        }, 300)
    ).current;

    useEffect(() => {
        if (searchValue) {
            debouncedSearch(searchValue);
        } else {
            setOptions([]);
        }
    }, [searchValue, debouncedSearch]);

    const handleSearch = (inputValue: string) => {
        setSearchValue(inputValue);
    };

    const handleSelect = (selectedValue: string, option: any) => {
        const selectedProduct = option.product;
        setSearchValue(selectedValue);

        if (onChange) {
            onChange(selectedValue, selectedProduct);
        }
    };

    const handleChange = (inputValue: string) => {
        setSearchValue(inputValue);

        if (onChange) {
            onChange(inputValue);
        }
    };

    return (
        <AutoComplete
            value={searchValue}
            options={options}
            onSearch={handleSearch}
            onSelect={handleSelect}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            style={style}
            notFoundContent={loading ? <Spin size="small" /> : null}
            filterOption={false} // Disable built-in filtering since we're doing server-side search
        >
            <Input
                prefix={<SearchOutlined />}
                allowClear
                size="middle"
            />
        </AutoComplete>
    );
};

export default ProductAutocomplete;
