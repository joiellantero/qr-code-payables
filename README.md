# QR Codes for Payables

## Step 1: Customization

### Step 1.0 Clone the repository

### Step 1.1: Updating the images

1. Go to `src/Images.tsx` to change the QR image
   1. Create or edit your qr code as you like then upload the image in your cloud storage.
   2. If you want to hide your URLs to your QR codes in your source code, follow the steps below.

         > Note that these links will be revealed once the webapp is deployed (can be seen in inspect element). Saving the links in an `.env` file is simply so that the URLs are not directly exposed and are excluded when people fork your repository.

       1. Create a `.env` file in your root directory (where `package.json` is located).
       2. Make the images publicly available then copy and paste the URLs in the `.env` file similar to the format below:
          ```
          ...
          REACT_APP_LINK0=https://yourcloudstorage.com/image0
          REACT_APP_LINK1=https://yourcloudstorage.com/image1
          ...
          ```
          > Note that the variable name should start with "REACT_APP_"
   3. If you won't hide your URLs in your source code, follow the step below.
       1. Make the images publicly available then copy and paste the URLs in the `Image.tsx` file similar to the format below:
       ```js
       {
           id: 0,
           url: https://yourcloudstorage.com/image0,
       },
       ...
       ```

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
4. AWS Amplify
5. AWS S3

> Don't forget to add your environment variables in your chosen host if you have chosen to hide your URLs in your code.