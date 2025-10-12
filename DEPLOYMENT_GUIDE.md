# 🚀 Deployment Guide - Cheapest & Easiest Options

## 🏆 Recommended: Vercel (FREE & EASIEST)

Vercel is the **best choice** for Next.js apps:
- ✅ **100% FREE** for personal projects
- ✅ One-click deployment
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Environment variables management
- ✅ Made by the creators of Next.js

### Deploy to Vercel in 3 Steps:

#### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit with Firebase auth"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

**Important:** Make sure `.env.local` is in your `.gitignore` - NEVER commit secrets!

#### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/in with your **GitHub account**
3. Click **"Add New Project"**
4. **Import** your GitHub repository
5. Vercel will auto-detect it's a Next.js project ✅
6. Click **"Deploy"**

#### Step 3: Add Environment Variables

After deployment (or during setup):

1. Go to your project settings in Vercel
2. Click **"Environment Variables"**
3. Add ALL the variables from your `.env.local`:

```bash
GEMINI_API_KEY=your-key-here
NEXT_PUBLIC_FIREBASE_API_KEY=your-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@...
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_CLIENT_X509_CERT_URL=your-cert-url
```

**For `FIREBASE_PRIVATE_KEY`:**
- Click **"Add"** 
- Copy the ENTIRE private key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Keep the `\n` characters (they represent newlines)

4. Click **"Save"**
5. Redeploy your project (Vercel does this automatically)

#### Step 4: Update Firebase Authorized Domains

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **"Add domain"**
5. Add your Vercel domain (e.g., `your-app.vercel.app`)

**Done!** 🎉 Your app is live at `https://your-app.vercel.app`

---

## 🥈 Alternative: Netlify (Also FREE)

Similar to Vercel, great for static sites:

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Sign up with GitHub
4. Click **"Add new site"** → **"Import an existing project"**
5. Select your repository
6. Set build command: `npm run build`
7. Set publish directory: `.next`
8. Add environment variables (same as Vercel)
9. Deploy!

---

## 🥉 Alternative: Railway (FREE $5/month credit)

Good for full-stack apps with databases:

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your repository
5. Add environment variables
6. Deploy!

---

## 💰 Cost Comparison

| Platform | Free Tier | Best For |
|----------|-----------|----------|
| **Vercel** | 100% Free for personal | Next.js apps ⭐ |
| **Netlify** | 100% Free (300 build mins) | Static sites |
| **Railway** | $5/month credit | Full-stack apps |
| **Render** | Free (limited) | Docker apps |
| **AWS/GCP** | Free tier then pay | Enterprise |

---

## 🔒 Security Checklist Before Deploying

- [ ] `.env.local` is in `.gitignore`
- [ ] No secrets committed to Git
- [ ] Service account JSON is NOT in repository
- [ ] Environment variables added to hosting platform
- [ ] Firebase authorized domains updated
- [ ] API keys are valid and active
- [ ] HTTPS is enabled (automatic on Vercel/Netlify)

---

## 🐛 Troubleshooting

### Build fails with "GEMINI_API_KEY not set"
- Add the environment variable in your hosting platform
- Redeploy after adding variables

### Firebase authentication not working
- Check that authorized domains include your production domain
- Verify all Firebase environment variables are set
- Check browser console for specific errors

### "Invalid private key" error
- Make sure `FIREBASE_PRIVATE_KEY` includes the full key with headers
- Keep the `\n` characters in the key
- Wrap the entire key in quotes if needed

### Images/Videos not generating
- Verify `GEMINI_API_KEY` is valid
- Check you're on Gemini API **paid tier**
- Check API quotas in Google AI Studio

---

## 📊 Monitoring Costs

### Vercel (Free Tier Limits):
- **Bandwidth**: 100GB/month (plenty for most apps)
- **Build time**: 6000 minutes/month
- **Serverless functions**: 100GB-hours

### Firebase (Free Tier):
- **Auth**: Unlimited users
- **Phone auth**: 10K verifications/month
- After free tier: ~$0.06 per verification

### Gemini API:
- **NOT FREE** - Check pricing at [ai.google.dev/pricing](https://ai.google.dev/pricing)
- Veo 3 and Imagen 4 require paid tier
- Monitor usage in Google AI Studio

**Estimated monthly cost for moderate use:**
- Hosting: **$0** (Vercel free tier)
- Firebase Auth: **$0** (free tier)
- Gemini API: **$5-50** (depends on usage)

---

## 🚀 Quick Deploy Commands

```bash
# 1. Prepare your code
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Deploy to Vercel (using Vercel CLI - optional)
npm i -g vercel
vercel

# Follow prompts, add environment variables when asked
```

---

## ✅ Post-Deployment

1. Test all authentication methods (Google, GitHub, Email)
2. Try generating an image/video
3. Check browser console for errors
4. Monitor your API usage in:
   - [Google AI Studio](https://aistudio.google.com/)
   - Firebase Console → Usage
   - Vercel Dashboard → Analytics

**Congratulations! Your app is now live! 🎉**




