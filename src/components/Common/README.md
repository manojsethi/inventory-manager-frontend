# ImageWithFallback Component

A reusable image component with consistent styling, fallback handling, and aspect ratio preservation.

## Features

- **Consistent Styling**: Predefined styles for different use cases
- **Fallback Images**: Built-in fallback images for each variant
- **Aspect Ratio Preservation**: Maintains image proportions
- **Size Presets**: Common size options (small, medium, large, custom)
- **Variant Support**: Different styles for logos, products, avatars, and banners
- **Preview Support**: Optional image preview functionality

## Usage

```tsx
import { ImageWithFallback } from '../../components/Common';

// Basic usage
<ImageWithFallback
    src={imageUrl}
    alt="Description"
    size="medium"
    variant="logo"
/>

// With custom dimensions
<ImageWithFallback
    src={imageUrl}
    alt="Description"
    width={100}
    height={120}
    variant="product"
    showPreview={true}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | - | Image source URL |
| `alt` | `string` | - | Alt text for accessibility |
| `size` | `'small' \| 'medium' \| 'large' \| 'custom'` | `'medium'` | Predefined size preset |
| `variant` | `'logo' \| 'product' \| 'avatar' \| 'banner'` | `'logo'` | Style variant |
| `width` | `number \| string` | - | Custom width (when size='custom') |
| `height` | `number \| string` | - | Custom height (when size='custom') |
| `showPreview` | `boolean` | `false` | Enable image preview |
| `className` | `string` | `''` | Additional CSS classes |
| `style` | `object` | - | Additional inline styles |

## Size Presets

- **small**: 40x40px
- **medium**: 80x80px  
- **large**: 120x120px
- **custom**: Use width/height props

## Variants

### Logo
- Rounded corners (8px)
- `objectFit: contain`
- Light border
- Light background

### Product
- Rounded corners (8px)
- `objectFit: contain`
- Medium border
- Light background

### Avatar
- Circular (50% border-radius)
- `objectFit: cover`
- Medium border
- Light background

### Banner
- Slightly rounded corners (4px)
- `objectFit: cover`
- Light border
- Light background

## Examples

```tsx
// Company logo in table
<ImageWithFallback
    src={company.logo}
    alt={company.name}
    size="small"
    variant="logo"
    showPreview={false}
/>

// Product image with preview
<ImageWithFallback
    src={product.images[0]}
    alt={product.name}
    size="medium"
    variant="product"
    showPreview={true}
/>

// User avatar
<ImageWithFallback
    src={user.avatar}
    alt={user.name}
    size="small"
    variant="avatar"
    showPreview={false}
/>

// Custom size banner
<ImageWithFallback
    src={banner.url}
    alt="Banner"
    width="100%"
    height={200}
    variant="banner"
    showPreview={true}
/>
``` 