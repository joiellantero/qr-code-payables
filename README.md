# QR Codes for Payables

## Customization

### Updating the images

1. Go to `src/Images.tsx` to change the QR image
   1. Create or edit your qr code as you like then upload the image in your cloud storage.
   2. Make the images publicly available then copy and paste the URLs in `Images.tsx`.
2. Go to `public/index.html` and change the text enclosed in the `<title>` tag to your preferred name.

### Adding/subtracting cards

1. Edit `Images.tsx` by adding or removing the similar code snippet as shown in the example below.
   ```js
   {
       id: 3,
       url: 'https://yourcloudstorage.com/yourimage',
   },
   ```