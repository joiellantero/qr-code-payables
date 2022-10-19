# QR Codes for Payables

## Step 1: Customization

### Step 1.1: Updating the images

1. Go to `src/Images.tsx` to change the QR image
   1. Create or edit your qr code as you like then upload the image in your cloud storage.
   2. Create a `.env` file in your root directory (where `package.json` is located).
   3. Make the images publicly available then copy and paste the URLs in the `.env` file similar to the format below:
      ```
      REACT_APP_LINK0=https://yourcloudstorage.com/image0
      REACT_APP_LINK1=https://yourcloudstorage.com/image1
      ...
      ```
      > Note that the variable name should start with "REACT_APP_"
2. Go to `public/index.html` and change the text enclosed in the `<title>` tag to your preferred name.

### Step 1.2: Adding/subtracting cards

1. Edit `Images.tsx` by adding or removing the similar code snippet as shown in the example below.
   ```js
   {
       id: 2,
       url: process.env.REACT_APP_LINK2,
   },
   ```

## Step 2: Testing it out

1. Open your terminal and locate the directory of the project then run `npm i` to install the dependencies.
2. Run `npm run start` to deploy locally.

## Step 3: Deploy it online

### Suggestions:

1. Vercel: [View documentation](https://vercel.com/docs/concepts/deployments/overview)
2. Netlify
3. Heroku