<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## Prerequisites

- Node.js
- A Google Gemini API Key

## How It Works

This application runs entirely in your browser. To use it, you must provide your own Google Gemini API key. The key is stored securely in your browser's local storage and is never sent to any server other than the official Google AI API endpoints.

## Running Locally

1.  **Install dependencies:**
    `npm install`
2.  **Run the development server:**
    `npm run dev`
3.  **Provide your API Key:** Open the application in your browser, click the "Manage API Key" button in the header, and enter your Gemini API key.

## Deploying

You can deploy this project to any static hosting service like Vercel, Netlify, or GitHub Pages. No server-side configuration is needed. After deploying, users will be required to enter their own API key to use the service, just like in the local setup.