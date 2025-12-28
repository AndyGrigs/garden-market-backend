# Cloudinary Integration Setup Guide

## What has been configured

✅ Cloudinary npm packages installed
✅ Cloudinary configuration file created
✅ Upload controller updated to use Cloudinary
✅ Automatic fallback to local storage if Cloudinary is not configured

## How to get your Cloudinary credentials

1. **Sign up for Cloudinary** (if you haven't already):
   - Go to https://cloudinary.com/
   - Click "Sign Up" and create a free account
   - The free tier includes:
     - 25 GB storage
     - 25 GB monthly bandwidth
     - 25,000 monthly transformations

2. **Get your credentials**:
   - After signing in, go to your Dashboard
   - You'll see your credentials at the top:
     - Cloud Name
     - API Key
     - API Secret

3. **Update your .env file**:
   Replace the placeholder values with your actual credentials:
   ```env
   CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
   CLOUDINARY_API_KEY=your_actual_api_key
   CLOUDINARY_API_SECRET=your_actual_api_secret
   ```

## How it works

### Automatic Storage Selection
The system automatically chooses between Cloudinary and local storage:
- **If Cloudinary credentials are configured**: Images are uploaded to Cloudinary
- **If Cloudinary credentials are NOT configured**: Images are saved locally in the `uploads/` folder

### Image Upload
When uploading images:
- **Cloudinary**: Returns a full URL (e.g., `https://res.cloudinary.com/your-cloud/image/upload/v123456/garden-market/image.jpg`)
- **Local**: Returns a relative path (e.g., `/uploads/1234567890.jpg`)

### Image Optimization
Cloudinary automatically:
- Optimizes image quality
- Limits image dimensions to 1200x1200 (maintaining aspect ratio)
- Stores images in the `garden-market` folder

### Image Deletion
The delete functionality works with both:
- Cloudinary URLs (full URLs with `cloudinary.com`)
- Local file paths (relative paths with `/uploads/`)

## Testing

1. **Start your server**:
   ```bash
   npm run dev
   ```

2. **Test image upload**:
   Use the `/upload` endpoint to upload an image. If Cloudinary is configured, you'll receive a Cloudinary URL in the response.

3. **Verify in Cloudinary Dashboard**:
   - Go to https://cloudinary.com/console/media_library
   - You should see your images in the `garden-market` folder

## Benefits of using Cloudinary

✅ **No server storage needed** - Images are stored in the cloud
✅ **Fast CDN delivery** - Images are served from the nearest CDN location
✅ **Automatic optimization** - Images are automatically compressed and optimized
✅ **Image transformations** - Resize, crop, and transform images on-the-fly
✅ **Backup & reliability** - Your images are automatically backed up
✅ **Scalability** - Handle unlimited traffic without server load

## Migration from local storage to Cloudinary

If you have existing images in the `uploads/` folder, you can:
1. Configure Cloudinary credentials
2. Upload new images (they will go to Cloudinary)
3. Gradually migrate old images by re-uploading them through your admin panel

## Troubleshooting

### Images still saving locally?
- Check that your `.env` file has valid Cloudinary credentials
- Restart your server after updating `.env`
- Check the console for any Cloudinary connection errors

### Delete not working?
- For Cloudinary images, ensure the public_id is correct
- Check that your API Secret is correctly configured

### Need help?
- Cloudinary Documentation: https://cloudinary.com/documentation
- Cloudinary Support: https://support.cloudinary.com/
