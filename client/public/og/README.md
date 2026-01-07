# Open Graph Images

This directory contains Open Graph (OG) images for social media sharing.

## Image Specifications

- **Dimensions**: 1200x630px (recommended for optimal display across platforms)
- **Format**: PNG or JPG
- **File Size**: Aim for under 1MB for faster loading

## File Organization

- `default.png` - Default OG image used site-wide
- Custom images can be added per page/post as needed

## Usage

Reference OG images in your SEO component:

```typescript
<SEO 
  ogImage="/og/your-image.png"
  // ... other props
/>
```

Or use the default from `client/src/lib/seo/defaults.ts`:

```typescript
export const DEFAULT_SEO = {
  ogImage: "/og/default.png"
}
```

## Image Fallback

If a specific OG image doesn't exist, the system will fall back to the default image (`/og/default.png`).

## Creating OG Images

When creating new OG images:
1. Use 1200x630px dimensions
2. Include your logo/branding
3. Use readable text (min 40px font size)
4. Keep important content in the center "safe zone" (avoid edges)
5. Test on multiple platforms (Twitter, LinkedIn, Facebook)

## Current Images

- `default.png` - Main site OG image (consciousness-bridging theme)
