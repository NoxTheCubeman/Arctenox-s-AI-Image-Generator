<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## Prerequisites

- Node.js
- Google Gemini API Key

## How It Works

This application connects to the Google Gemini API using an API key. There are two ways to provide a key:

1.  **Application Default Key (Recommended for Local):** A pre-configured API key can be provided as an environment variable (`VITE_API_KEY`) during the build process. This is ideal for deploying the application to a static hosting service where the key is kept secure on the server.
2.  **User-Provided Key in Vercel (Optional):** Users can optionally provide their own Gemini API key via the "Manage API Key" button in the application header. This key is stored securely in the browser's local storage and is never sent to any server other than Google's.

**Key Precedence:** If a user provides their own key, it will be used for all API requests. If the user-provided key is removed, the application will fall back to using nothing.

## How to run it in Vercel

1. Paste this into your URL: https://arctenox-s-image-generator.vercel.app

## Running Locally

1.  **Install dependencies:**
    `npm install`
2.  **Create an environment file:**
    Create a file named `.env.local` in the root of the project and add your API key:
    ```
    VITE_API_KEY="YOUR_GEMINI_API_KEY_HERE"
    ```
    *This file is ignored by Git, so your key will not be committed.*
3.  **Run the development server:**
    `npm run dev`
    
    The Vite development server will automatically load the `VITE_API_KEY` from your `.env.local` file.

## Deploying

You can deploy this project to any static hosting service like Vercel, Netlify, or GitHub Pages. During the build process, you must provide the `VITE_API_KEY` as an environment variable in your hosting provider's settings.
