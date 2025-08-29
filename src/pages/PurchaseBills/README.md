# Purchase Bills Feature

## Overview
The Purchase Bills feature allows users to create, manage, and track purchase bills from suppliers. This includes creating bills, adding items, managing attachments, and tracking payment status.

## Features

### 🎯 Core Functionality
- **Create Purchase Bills**: Generate new purchase bills with automatic bill number generation
- **Edit Bills**: Modify existing purchase bills
- **Bill Items Management**: Add/remove items with quantity and pricing
- **Automatic Calculations**: Subtotal, tax, discount, and total amounts
- **File Attachments**: Upload and manage bill attachments (images, PDFs, documents)
- **Status Management**: Track bills as Draft or Done
- **Supplier Integration**: Link bills to suppliers from the system

### 🔍 Search & Filtering
- **Search**: Search bills by bill number, supplier name, or other details
- **Status Filter**: Filter by Draft or Done status
- **Supplier Filter**: Filter bills by specific supplier
- **Date Range Filter**: Filter bills by bill date range
- **Pagination**: Efficient data loading with pagination

### 📊 Data Management
- **CRUD Operations**: Full Create, Read, Update, Delete functionality
- **Validation**: Form validation for required fields
- **Error Handling**: User-friendly error messages
- **Loading States**: Proper loading indicators

## File Structure

```
src/pages/PurchaseBills/
├── PurchaseBills.tsx          # Main purchase bills page
├── PurchaseBillModal.tsx      # Create/Edit modal component
├── index.ts                   # Export file
└── README.md                  # This documentation
```

## API Integration

### Endpoints Used
- `GET /api/purchase-bills/next-number` - Get next bill number
- `GET /api/purchase-bills` - Get all purchase bills with filtering
- `POST /api/purchase-bills` - Create new purchase bill
- `GET /api/purchase-bills/:id` - Get purchase bill by ID
- `PUT /api/purchase-bills/:id` - Update purchase bill
- `DELETE /api/purchase-bills/:id` - Delete purchase bill
- `POST /api/purchase-bills/:id/mark-done` - Mark bill as done

### Data Types
```typescript
interface PurchaseBill {
    _id: string;
    billNumber: string;
    supplierId: string;
    supplierName: string;
    billDate: string;
    dueDate: string;
    items: PurchaseBillItem[];
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    status: 'draft' | 'done';
    notes?: string;
    attachments?: string[];
}
```

## Usage

### Navigation
1. Navigate to **Financial Management** → **Purchase Bills** in the sidebar
2. The main purchase bills page will display all bills in a table format

### Creating a New Bill
1. Click **"Create Purchase Bill"** button
2. The system will automatically generate the next bill number
3. Fill in the required fields:
   - **Supplier**: Select from dropdown
   - **Bill Date**: Choose bill date
   - **Due Date**: Choose payment due date
   - **Status**: Draft or Done
4. Add bill items:
   - Click **"Add Item"** button
   - Fill in Product ID, Product Name, Quantity, Unit Price
   - Add optional notes for each item
5. Review calculated totals (Subtotal, Tax, Discount, Total)
6. Add optional notes and attachments
7. Click **"Create"** to save

### Editing a Bill
1. Click the **Edit** icon on any bill row
2. Modify the required fields
3. Add/remove items as needed
4. Update attachments if required
5. Click **"Update"** to save changes

### Marking as Done
1. For draft bills, click the **"Mark as Done"** icon
2. This will trigger stock movements in the backend
3. The bill status will change to "Done"

### Deleting a Bill
1. Click the **Delete** icon on any bill row
2. Confirm the deletion in the popup dialog
3. The bill will be permanently removed

## Technical Details

### State Management
- Uses React hooks for local state management
- Form state managed by Ant Design Form
- Modal state for create/edit operations
- Pagination state for table data

### File Upload
- Supports multiple file types (images, PDFs, documents)
- Uses the upload service with `ImageType.PURCHASE_BILL`
- Files are stored in the `images/purchase_bill` folder

### Validation
- Required field validation
- Date validation
- Numeric validation for amounts
- Form-level validation before submission

### Error Handling
- API error handling with user-friendly messages
- Network error handling
- Form validation error display
- Loading state management

## Future Enhancements

### Potential Improvements
- **Product Integration**: Connect with product service for item selection
- **Payment Tracking**: Add payment status and due date tracking
- **Notifications**: Implement due date reminders
- **Reporting**: Add purchase bill reports and analytics
- **Bulk Operations**: Support for bulk import/export
- **Email Integration**: Send bills via email
- **Print/PDF**: Generate printable bill formats

### Integration Points
- **Inventory System**: Stock updates when bills are marked as done
- **Supplier Management**: Enhanced supplier information display
- **Financial Reports**: Integration with financial reporting system
- **Audit Trail**: Track changes and modifications

## Troubleshooting

### Common Issues
1. **Bill Number Generation Fails**: Check backend API connectivity
2. **File Upload Issues**: Verify upload service configuration
3. **Form Validation Errors**: Ensure all required fields are filled
4. **Loading Issues**: Check network connectivity and API endpoints

### Debug Information
- Check browser console for JavaScript errors
- Verify API endpoint responses
- Check network tab for failed requests
- Validate form data before submission
