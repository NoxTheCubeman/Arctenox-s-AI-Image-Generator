<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## Prerequisites

- Node.js

## How It Works

This application runs entirely in your browser and connects to the Google Gemini API. It uses an API key provided via an environment variable.

- **For local development**, the key is loaded from a `.env.local` file (see "Running Locally").
- **For deployment**, the key (`VITE_API_KEY`) should be set as a secure environment variable in your hosting provider's build settings.

## Running Locally

1.  **Install dependencies:**
    `npm install`

2.  **Set up your API Key:**
    - Create a new file in the root of the project named `.env.local`.
    - Add the following line to this file, replacing `YOUR_GEMINI_API_KEY_HERE` with your actual Google Gemini API key:
      ```
      VITE_API_KEY="YOUR_GEMINI_API_KEY_HERE"
      ```
    - The `.env.local` file is ignored by git, so your key will remain private.

3.  **Run the development server:**
    `npm run dev`

## Deploying

You can deploy this project to any static hosting service like Vercel, Netlify, or GitHub Pages. No server-side configuration is needed beyond providing the `VITE_API_KEY` environment variable to the build process.