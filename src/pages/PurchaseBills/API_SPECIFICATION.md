# Product Search API Specification

## Overview
Simplified two-step product search and selection system for purchase bills:
1. **Search Products**: Get basic product info (name, brand, description)
2. **Get Variants**: Fetch variants for selected product

## Endpoint 1: `GET /api/products/search`

### Purpose
Search for products by name with basic information for the purchase bills form.

### Request Parameters
- `q` (string, required): Search query (minimum 2 characters)
- `limit` (number, optional): Maximum number of results (default: 10)

### Example Request
```
GET /api/products/search?q=iphone&limit=10
```

### Response Format
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "product_id",
        "name": "iPhone 14 Pro",
        "description": "Latest iPhone model",
        "brand": {
          "_id": "brand_id",
          "name": "Apple",
          "logo": "logo_url"
        }
      }
    ]
  },
  "message": "Products found successfully"
}
```

### Search Logic Requirements

1. **Minimum Query Length**: Only search if query is 2 or more characters
2. **Search Field**: Search in product name only
3. **Case Insensitive**: Search should be case-insensitive
4. **Partial Matching**: Support partial matching (e.g., "iph" should match "iPhone")
5. **Active Products Only**: Only return active products
6. **Limit Results**: Respect the limit parameter
7. **Basic Info Only**: Return only essential product information

### Example Search Queries
- `q=iphone` → Should match "iPhone 14 Pro", "iPhone 13", etc.
- `q=apple` → Should match products with "Apple" in name
- `q=phone` → Should match "iPhone", "Samsung Phone", etc.

## Endpoint 2: `GET /api/products/:productId/variants`

### Purpose
Get all active variants for a selected product.

### Request Parameters
- `productId` (string, required): Product ID from search results

### Example Request
```
GET /api/products/product_id/variants
```

### Response Format
```json
{
  "success": true,
  "data": {
    "variants": [
      {
        "_id": "variant_id",
        "sku": "PHONE-APPLE-001",
        "name": "iPhone 14 Pro 128GB",
        "currentPrice": 999.99,
        "currentCost": 800.00,
        "isActive": true
      },
      {
        "_id": "variant_id_2",
        "sku": "PHONE-APPLE-002",
        "name": "iPhone 14 Pro 256GB",
        "currentPrice": 1099.99,
        "currentCost": 900.00,
        "isActive": true
      }
    ]
  }
}
```

### Variant Selection Logic

1. **Active Variants Only**: Only return active variants
2. **Complete Info**: Return all variant details needed for purchase bills
3. **Cost Information**: Include current cost for purchase calculations
4. **SKU Information**: Include SKU for easy identification

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Query must be at least 2 characters long"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Product not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to search products"
}
```

## Implementation Notes

1. **Database Query**: Use MongoDB regex patterns for name search
2. **Indexing**: Ensure proper indexes on `name` and `isActive` fields
3. **Performance**: Simple queries for fast response times
4. **Security**: Sanitize search input to prevent injection attacks

## Frontend Integration

### Step 1: Product Search
The frontend will:
1. Call search API when user types 2+ characters
2. Debounce requests (300ms delay)
3. Display results in autocomplete dropdown
4. Show product name and brand in format: "Product Name (Brand)"

### Step 2: Variant Selection
The frontend will:
1. Call variants API when user selects a product
2. Display variants in selection modal/dropdown
3. Show variant name, SKU, and cost information
4. Allow user to select variant and add to purchase bill

### Example Frontend Flow
```typescript
// 1. Search products
const searchProducts = async (query: string) => {
    const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}&limit=10`);
    const data = await response.json();
    return data.data.products;
};

// 2. Get variants for selected product
const getVariants = async (productId: string) => {
    const response = await fetch(`/api/products/${productId}/variants`);
    const data = await response.json();
    return data.data.variants;
};

// 3. Add to purchase bill
const addToPurchaseBill = (variant: any) => {
    const item = {
        sku: variant.sku,
        quantity: 1,
        unitPrice: variant.currentCost,
        notes: variant.name
    };
    // Add to purchase bill items
};
```

## Benefits of This Approach

### Performance
- **Fast Search**: Only fetches basic product info
- **Lazy Loading**: Variants loaded only when needed
- **Small Payload**: Minimal data transfer
- **Efficient Queries**: Simple, indexed searches

### User Experience
- **Quick Results**: Fast product search
- **Progressive Disclosure**: Show variants only when product selected
- **Clean Interface**: Less overwhelming for users
- **Better Performance**: Faster page loads

### Scalability
- **Separate Concerns**: Product search vs variant selection
- **Caching Friendly**: Can cache product list separately
- **API Efficiency**: Only load what's needed
- **Future Proof**: Easy to add more features
