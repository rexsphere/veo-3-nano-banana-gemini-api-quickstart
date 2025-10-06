# 🔥 Firebase Authentication Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter a project name (e.g., "gemini-veo-studio")
4. **DISABLE** Google Analytics (not needed for this project)
5. Click **"Create project"**

## Step 2: Enable Authentication

1. In your Firebase project, click **"Authentication"** in the left sidebar
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable the following providers:

### A. Email/Password
- Click on **"Email/Password"**
- Toggle **"Enable"**
- Click **"Save"**

### B. Google
- Click on **"Google"**
- Toggle **"Enable"**
- Enter your **Project support email** (your email)
- Click **"Save"**

### C. GitHub (Optional)
- Click on **"GitHub"**
- Toggle **"Enable"**
- You'll need to create a GitHub OAuth App:
  - Go to [GitHub Developer Settings](https://github.com/settings/developers)
  - Click **"New OAuth App"**
  - **Application name**: "Gemini Veo Studio"
  - **Homepage URL**: `http://localhost:3000` (change for production)
  - **Authorization callback URL**: Copy from Firebase (format: `https://your-project.firebaseapp.com/__/auth/handler`)
  - Click **"Register application"**
  - Copy **Client ID** and **Client Secret**
  - Paste them into Firebase
- Click **"Save"**

## Step 3: Get Firebase Web App Config

1. Go to **Project Settings** (⚙️ icon in left sidebar)
2. Scroll down to **"Your apps"** section
3. Click the **Web icon (</>)**
4. Register your app:
   - **App nickname**: "Gemini Veo Web"
   - **Do NOT** check "Set up Firebase Hosting"
   - Click **"Register app"**
5. Copy the `firebaseConfig` object - you'll need these values:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",              // ← NEXT_PUBLIC_FIREBASE_API_KEY
  authDomain: "xxx.firebaseapp.com", // ← NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  projectId: "your-project-id",      // ← NEXT_PUBLIC_FIREBASE_PROJECT_ID
  storageBucket: "xxx.appspot.com",  // ← NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123...",       // ← NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123..."                  // ← NEXT_PUBLIC_FIREBASE_APP_ID
};
```

## Step 4: Create Service Account (for Server-Side Auth)

1. Go to **Project Settings** → **Service accounts** tab
2. Click **"Generate new private key"**
3. A JSON file will download - **KEEP THIS SECURE!** ⚠️
4. Open the JSON file and extract these values:

```json
{
  "project_id": "...",           // ← FIREBASE_PROJECT_ID
  "private_key_id": "...",       // ← FIREBASE_PRIVATE_KEY_ID
  "private_key": "-----BEGIN PRIVATE KEY-----\n...", // ← FIREBASE_PRIVATE_KEY
  "client_email": "...",         // ← FIREBASE_CLIENT_EMAIL
  "client_id": "...",            // ← FIREBASE_CLIENT_ID
  "client_x509_cert_url": "..."  // ← FIREBASE_CLIENT_X509_CERT_URL
}
```

## Step 5: Create Environment Variables File

Create a file named `.env.local` in your project root:

```bash
# Gemini API (get from https://aistudio.google.com/app/apikey)
GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"

# Firebase Client Config (from Step 3)
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789:web:abcdef123456"

# Firebase Server Config (from Step 4 - Service Account JSON)
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_PRIVATE_KEY_ID="your-private-key-id"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
FIREBASE_CLIENT_ID="123456789"
FIREBASE_CLIENT_X509_CERT_URL="https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com"
```

**Important Notes:**
- Replace ALL placeholder values with your actual Firebase config
- The `FIREBASE_PRIVATE_KEY` should keep the `\n` characters for line breaks
- Never commit `.env.local` to Git (it's already in `.gitignore`)

## Step 6: Add .gitignore Protection

Make sure your `.gitignore` includes:

```
.env.local
.env*.local
*.json
!package.json
!package-lock.json
!tsconfig.json
!components.json
```

This ensures your service account JSON and environment variables are NEVER committed to Git.

## Step 7: Test Locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` - you should see a sign-in page!

## 🔐 Security Best Practices

### ✅ SAFE to commit to GitHub:
- `NEXT_PUBLIC_*` variables (these are exposed to the browser anyway)
- Your public Firebase config

### ❌ NEVER commit to GitHub:
- Service account JSON file
- `FIREBASE_PRIVATE_KEY`
- `GEMINI_API_KEY`
- Any secrets or API keys

### 🛡️ Additional Security:
1. **Enable App Check** (optional but recommended):
   - Go to Firebase Console → App Check
   - Register your web app
   - Add reCAPTCHA v3 protection

2. **Set up authorized domains**:
   - Go to Firebase Console → Authentication → Settings
   - Under "Authorized domains", add your production domain

3. **Review Firebase Security Rules** if using Firestore/Storage

## 🚀 Ready for Production?

See `DEPLOYMENT_GUIDE.md` for deploying to Vercel (FREE tier available!)

