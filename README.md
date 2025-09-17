<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## Prerequisites

- Node.js
- Google Gemini API

Download Node.js here at the official site: https://nodejs.org/en/download

Get your Google Gemini API Key here at the official site: https://aistudio.google.com/apikey

## How It Works

This application connects to the Google Gemini API using an API key. There are two ways to provide a key:

1.  **Application Default Key (Recommended for Local):** A pre-configured API key can be provided as an environment variable (`VITE_API_KEY`) during the build process. This is ideal for deploying the application to a static hosting service where the key is kept secure on the server.
2.  **User-Provided Key in Vercel (Optional):** Users can optionally provide their own Gemini API key via the "Manage API Key" button in the application header. This key is stored securely in the browser's local storage and is never sent to any server other than Google's.

**Key Precedence:** If a user provides their own key, it will be used for all API requests. If the user-provided key is removed, the application will fall back to using nothing.

## How to run it in Vercel

1. Paste this into your URL: https://arctenox-s-image-generator.vercel.app
2. Top right click Manage API Key, and enter the API key and click save
3. Your ready to go once you've done these two things.

Note: Imagen 4.0 might not work due to your billing on your Google Gemini API Key, it's not a app/bug issue.

## Running Locally

1.  **Install dependencies:**
    `npm install`
2.  **Create an environment file:**
    Create a file named `.env.local` in the root of the project and add your API key:
    ```
    GEMINI_API_KEY=PLACEHOLDER_API_KEY"
    ```
    *This file is ignored by Git, so your key will not be committed.*
3.  **Run the development server:**
    `npm run dev`
    
    The Vite development server will automatically load the `VITE_API_KEY` from your `.env.local` file.

To change the theme of the app both Local and on Vercel/Statc Hosts you can click these things on the top right and it should save to your session, the theme you have selected and the theme you made additionally you can import and export custom themes in the manage themes:

<img width="283" height="395" alt="image" src="https://github.com/user-attachments/assets/c8d6b8ab-2ac6-4873-9b51-420d22516b5c" />

## How to run ComfyUI (Local)
1. You should not be clicking run ComfyUI in the ComfyUI Embed but yoou should be clicking these to run ComfyUI with the style emulators or to bring the images to the app:
  
   <img width="344" height="38" alt="image" src="https://github.com/user-attachments/assets/16022bb6-50fb-40de-af5f-1552f8f5cd65" />

4. To use a workflow to use in the background you should be going here:
  
   <img width="438" height="190" alt="image" src="https://github.com/user-attachments/assets/783bfa83-ed5c-4693-a5e7-c76ad3db271d" />

5. To add a workflow click manage and it will bring up a panel that should look like:"
  
<img width="877" height="822" alt="image" src="https://github.com/user-attachments/assets/dce72841-5f5f-49ee-9f0c-5b06cac12718" />

Everything else should be self explainatory if you click manage on any of the areas, it should add a panel like with the one above the select checkpoint which allows you to hide selectable models so you only see the ones you want to see in the app.

Additionally, due to bug issues you cannot open or close this ComfyUI Embed, I tried to vibe code that feature in and it did not like it, the full embed you can open/close, this is the embed im talking about:

<img width="873" height="679" alt="image" src="https://github.com/user-attachments/assets/7906628d-cb58-4489-af4d-d3bb4ba94e4a" />

You can however change it's size on the Y-Axis (Up-and-Down).

## Developer Notes

This will eventually be deployed to static hosting service like Netlify. I will also add Gemini 2.5 Pro and other paid google img gen models at a later date into this. Also there's a fun little easter egg in the app have fun looking for it, shouldn't be too hard, the Easter Eggs are more aligned better if your zoomed out by %80.
