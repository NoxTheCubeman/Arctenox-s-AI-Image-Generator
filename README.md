<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## Prerequisites

- Node.js

## How It Works

This application runs entirely in your browser and connects to the Google Gemini API. It requires a pre-configured API key to be available as an environment variable (`API_KEY`) during the build process. The application is designed to be deployed to a static hosting service where this key is securely provided.

## Running Locally

1.  **Install dependencies:**
    `npm install`
2.  **Run the development server:**
    `npm run dev`
    
    *Note: An `API_KEY` environment variable containing a valid Google Gemini API key must be available to the Vite development server for the application to function.*

## Deploying

You can deploy this project to any static hosting service like Vercel by pasting this in your url: `arctenox-s-image-generator.vercel.app`. No server-side configuration is needed beyond providing the `API_KEY` environment variable to the build process.
