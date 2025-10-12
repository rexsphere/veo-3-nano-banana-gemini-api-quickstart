# ⚡ Quick Start Guide - Get Running in 10 Minutes

## 🎯 Your Mission: Get the app running locally

### Step 1: Clone & Install (2 minutes)

```bash
# If you haven't cloned yet
git clone <your-repo-url>
cd veo-3-nano-banana-gemini-api-quickstart

# Install dependencies
npm install
```

### Step 2: Get Gemini API Key (1 minute)

1. Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Click **"Create API key"**
3. Copy your key ⚠️ **You need to be on PAID tier for Veo 3/Imagen 4**

### Step 3: Set Up Firebase (5 minutes)

#### 3A. Create Firebase Project
1. Go to [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Name it (e.g., "gemini-studio")
4. **Disable** Google Analytics
5. Click **"Create project"**

#### 3B. Enable Authentication
1. Click **"Authentication"** in sidebar
2. Click **"Get started"**
3. Enable these sign-in methods:
   - ✅ **Email/Password** (toggle on, save)
   - ✅ **Google** (toggle on, add your email, save)

#### 3C. Get Web App Config
1. Go to **Project Settings** (⚙️ gear icon)
2. Scroll to **"Your apps"**
3. Click **Web icon (</>)**
4. Register app: name it "Web App", don't check hosting
5. **Copy the config object** - you'll need it in Step 4

#### 3D. Generate Service Account
1. Still in **Project Settings** → **Service accounts** tab
2. Click **"Generate new private key"**
3. Download the JSON file
4. **Keep this file safe!** Don't commit to Git

### Step 4: Create `.env.local` File (2 minutes)

```bash
# Copy the example
cp env.example .env.local

# Edit .env.local and fill in:
```

```bash
# Your Gemini API key from Step 2
GEMINI_API_KEY="AIza..."

# From Step 3C (Firebase web config)
NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123..."
NEXT_PUBLIC_FIREBASE_APP_ID="1:123..."

# From Step 3D (service account JSON file you downloaded)
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_PRIVATE_KEY_ID="abc123..."
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com"
FIREBASE_CLIENT_ID="123..."
FIREBASE_CLIENT_X509_CERT_URL="https://www.googleapis.com/robot/v1/metadata/x509/..."
```

**Tips:**
- Open the downloaded JSON file from Step 3D
- Copy values directly from JSON to `.env.local`
- Keep the `\n` in `FIREBASE_PRIVATE_KEY` (they're important!)

### Step 5: Run the App! 🚀

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

You should see a **sign-in page**! 🎉

### Step 6: Test It

1. **Sign up** with email/password (make one up)
2. Try **Google sign-in** (uses your Google account)
3. Once signed in, you'll see the studio interface
4. Try generating an image!

---

## ✅ Verification Checklist

- [ ] App runs without errors
- [ ] Sign-in page appears at `http://localhost:3000`
- [ ] Can sign up with email/password
- [ ] Can sign in with Google
- [ ] After sign-in, see the studio interface
- [ ] Can generate images/videos

---

## 🐛 Troubleshooting

### "GEMINI_API_KEY is not set"
- Check `.env.local` exists
- Check `GEMINI_API_KEY=` has your actual key
- Restart the dev server (`npm run dev`)

### "Firebase config is undefined"
- Check all `NEXT_PUBLIC_FIREBASE_*` variables are set
- Make sure there are no typos
- Restart the dev server

### "Invalid private key"
- Check `FIREBASE_PRIVATE_KEY` includes the full key
- Keep the `\n` characters (don't replace with actual newlines)
- Wrap in quotes: `FIREBASE_PRIVATE_KEY="-----BEGIN..."`

### Sign-in doesn't work
- Check Firebase Authentication is enabled
- Check the correct sign-in methods are enabled
- Check browser console for specific errors

### Build fails
- Make sure all environment variables are set
- Check for typos in `.env.local`
- Try `rm -rf .next && npm run dev`

---

## 🚀 Next Steps

Once it's running locally:

1. **Read the guides:**
   - [FIREBASE_SETUP_GUIDE.md](./FIREBASE_SETUP_GUIDE.md) - Detailed Firebase setup
   - [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Deploy to production
   - [SECURITY_FAQ.md](./SECURITY_FAQ.md) - Security best practices

2. **Deploy to Vercel (FREE):**
   - See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
   - Takes ~5 minutes
   - Automatic HTTPS & global CDN

3. **Customize the app:**
   - Add your branding
   - Modify the UI
   - Add new AI models

---

## 💰 Cost Breakdown

- **Development**: $0 (use free tier testing)
- **Hosting**: $0 (Vercel free tier)
- **Firebase Auth**: $0 (free tier)
- **Gemini API**: ~$5-50/month (usage-based)

**Total to get started: $0** (just need a credit card for Gemini API paid tier)

---

## 📚 Additional Resources

- [Firebase Docs](https://firebase.google.com/docs)
- [Gemini API Docs](https://ai.google.dev/gemini-api/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Deployment](https://vercel.com/docs)

---

## 🆘 Still Stuck?

1. Check the detailed guides (linked above)
2. Look at browser console for errors
3. Check Firebase console for auth errors
4. Verify all environment variables are set correctly

**You've got this! 💪**




