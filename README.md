# Gemini API Veo 3 & Nano Banana Quickstart

A **secure, production-ready** Next.js application for creating and editing images and videos using Google's latest Gemini API models including [Veo 3](https://ai.google.dev/gemini-api/docs/video), [Imagen 4](https://ai.google.dev/gemini-api/docs/imagen), and [Gemini 2.5 Flash Image aka nano banana](https://ai.google.dev/gemini-api/docs/image-generations).

## 🎯 Quick Links

- **[⚡ QUICK START](./QUICK_START.md)** - Get running in 10 minutes
- **[🔥 Firebase Setup](./FIREBASE_SETUP_GUIDE.md)** - Complete Firebase authentication guide
- **[🚀 Deployment](./DEPLOYMENT_GUIDE.md)** - Deploy to Vercel (FREE)
- **[🔐 Security FAQ](./SECURITY_FAQ.md)** - Is my data safe on GitHub? 

<table>
  <tr>
    <td align="center">
      <img src="./public/compose.png" alt="Compose" width="300"/>
      <br/>
      <strong>Compose</strong>
    </td>
    <td align="center">
      <img src="./public/edit.png" alt="Edit" width="300"/>
      <br/>
      <strong>Edit</strong>
    </td>
    <td align="center">
      <img src="./public/video.png" alt="Video" width="300"/>
      <br/>
      <strong>Video</strong>
    </td>
  </tr>
</table>

> [!NOTE]
> If you want a full studio, consider [Google's Flow](https://labs.google/fx/tools/flow) (a professional environment for Veo/Imagen). Use this repo as a lightweight studio to learn how to build your own UI that generates content with Google's AI models via the Gemini API.

(This is not an official Google product.)

## Features

The quickstart provides a unified composer UI with different modes for content creation:

-   **Create Image**: Generate images from text prompts using **Imagen 4** or **Gemini 2.5 Flash Image**.
-   **Edit Image**: Edit an image based on a text prompt using **Gemini 2.5 Flash Image**.
-   **Compose Image**: Combine multiple images with a text prompt to create a new image using **Gemini 2.5 Flash Image**.
-   **Create Video**: Generate videos from text prompts or an initial image using **Veo 3**.

### Quick Actions & UI Features
- Seamless navigation between modes after generating content
- Download generated images & videos
- Cut videos directly in the browser to specific time ranges


## 🔐 Authentication & Security

This application uses **Firebase Authentication** to protect your API keys and ensure only authorized users can generate content. All API endpoints are secured with Firebase token verification.

### Supported Authentication Methods:
- ✅ Google OAuth
- ✅ GitHub OAuth
- ✅ Email/Password

## Getting Started: Development and Local Testing

**Quick Start:**
1. See **[FIREBASE_SETUP_GUIDE.md](./FIREBASE_SETUP_GUIDE.md)** for detailed Firebase setup
2. Copy `env.example` to `.env.local` and fill in your values
3. Run `npm install && npm run dev`

**1. Prerequisites:**

-   Node.js and npm (or yarn/pnpm)
-   **Firebase Project**: Create at [https://console.firebase.google.com/](https://console.firebase.google.com/)
-   **Gemini API Key**: Get from [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) (requires **PAID tier**)
-   **Firebase Service Account**: For server-side auth (see setup guide)

> [!WARNING]
> Google Veo 3, Imagen 4, and Gemini 2.5 Flash Image are part of the Gemini API Paid tier. You will need to be on the paid tier to use these models.

**1.5 Firebase Setup:**

📖 **See [FIREBASE_SETUP_GUIDE.md](./FIREBASE_SETUP_GUIDE.md) for complete step-by-step instructions**

Quick summary:
1. Create Firebase project
2. Enable Authentication (Google, GitHub, Email/Password)
3. Get Firebase web config
4. Generate service account JSON (for server-side auth)
5. Copy `env.example` to `.env.local` and fill in your values

**⚠️ IMPORTANT SECURITY NOTE:**
- **NEVER** commit your `.env.local` file to Git
- **NEVER** commit the service account JSON file
- The `.gitignore` is configured to protect these files
- Only `NEXT_PUBLIC_*` variables are safe to expose (they're public anyway)

**2. Install Dependencies:**

```bash
npm install
```

**3. Run Development Server:**

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:3000` to see the application.

## Project Structure

The project is a standard Next.js application with the following key directories:

-   `app/`: Contains the main application logic and pages
    -   `page.tsx`: Main page with the unified composer UI.
    -   `api/`: API routes for different operations
        -   `imagen/generate/`: Image generation with Imagen 4
        -   `gemini/generate/`: Image generation with Gemini 2.5 Flash Image
        -   `gemini/edit/`: Image editing/composition with Gemini 2.5 Flash Image
        -   `veo/generate/`: Video generation operations
        -   `veo/operation/`: Check video generation status
        -   `veo/download/`: Download generated videos
-   `components/`: Reusable React components
    -   `ui/Composer.tsx`: The main unified composer for all interactions.
    -   `ui/VideoPlayer.tsx`: Video player with trimming
    -   `ui/ModelSelector.tsx`: Model selection component
    -   `ui/dropzone.tsx`: Drag-and-drop component for file uploads.
-   `lib/`: Utility functions and schema definitions
-   `public/`: Static assets

## Official Docs and Resources

-   Gemini API docs: `https://ai.google.dev/gemini-api/docs`
-   Veo 3 Guide: `https://ai.google.dev/gemini-api/docs/video?example=dialogue`
-   Imagen 4 Guide: `https://ai.google.dev/gemini-api/docs/imagen`

## How it Works

The application uses the following API routes to interact with the Google models:

### Image APIs
-   `app/api/imagen/generate/route.ts`: Handles image generation requests with Imagen 4
-   `app/api/gemini/generate/route.ts`: Handles image generation requests with Gemini 2.5 Flash Image
-   `app/api/gemini/edit/route.ts`: Handles image editing and composition with Gemini 2.5 Flash (supports multiple images)

### Video APIs
-   `app/api/veo/generate/route.ts`: Handles video generation requests with Veo 3
-   `app/api/veo/operation/route.ts`: Checks the status of video generation operations
-   `app/api/veo/download/route.ts`: Downloads generated videos

## 🚀 Deployment

📖 **See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete deployment instructions**

### Recommended: Vercel (FREE)

**Why Vercel?**
- ✅ 100% FREE for personal projects
- ✅ One-click deployment from GitHub
- ✅ Automatic HTTPS & CDN
- ✅ Made by Next.js creators
- ✅ Easy environment variables management

**Quick Deploy:**
1. Push your code to GitHub (**without** `.env.local`)
2. Connect to [vercel.com](https://vercel.com) with GitHub
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy! 🎉

### Security Features:

- **Firebase Authentication**: All API endpoints require valid auth tokens
- **Server-side Token Verification**: Firebase Admin SDK verifies every request
- **Protected Routes**: Unauthenticated users redirected to sign-in
- **Environment Variables**: Secrets stored securely in hosting platform

### Cost Estimate (Monthly):
- **Hosting (Vercel)**: $0 (free tier)
- **Firebase Auth**: $0 (unlimited users on free tier)
- **Gemini API**: $5-50 (usage-based, paid tier required)

## Technologies Used

-   [Next.js](https://nextjs.org/) - React framework for building the user interface
-   [React](https://reactjs.org/) - JavaScript library for building user interfaces
-   [Tailwind CSS](https://tailwindcss.com/) - For styling
-   [Firebase](https://firebase.google.com/) - Authentication and backend services
-   [Gemini API](https://ai.google.dev/gemini-api/docs) with:
  - **Veo 3** - For video generation
  - **Imagen 4** - For high-quality image generation
  - **Gemini 2.5 Flash** - For fast image generation, editing, and composition

## Questions and feature requests

-   **Want a feature?** Please open an issue describing the use case and proposed behavior.

## License

This project is licensed under the Apache License 2.0.
