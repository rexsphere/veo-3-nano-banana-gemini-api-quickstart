# 🔧 Vercel Deployment - Fix Guide

## ✅ Issue Fixed!

I've added `vercel.json` to fix the build configuration. The error you saw was because Vercel was trying to run `npm run build` as the install command.

---

## 🚀 **How to Deploy on Vercel (Step-by-Step)**

### **Step 1: Push the Latest Code** ✅ DONE

The code with the fix has been pushed to GitHub.

### **Step 2: Configure Vercel Project Settings**

Go to your Vercel project dashboard:

1. **Project Settings** → **General**
2. **Build & Development Settings**:
   - **Framework Preset**: `Next.js` (should be auto-detected)
   - **Build Command**: Leave as default or set to `npm run build`
   - **Install Command**: Leave as default or set to `npm install`
   - **Output Directory**: `.next` (default)

### **Step 3: Add Environment Variables** ⚠️ CRITICAL

In Vercel dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add **ALL** these variables:

```bash
# Gemini API
GEMINI_API_KEY=your-actual-gemini-api-key

# Firebase Client Config (Public - safe)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Firebase Server Config (Private - REQUIRED for auth)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...
```

**⚠️ IMPORTANT for `FIREBASE_PRIVATE_KEY`:**
- Copy the ENTIRE private key including headers
- Keep the `\n` characters (they represent newlines)
- Wrap in quotes in Vercel: `"-----BEGIN PRIVATE KEY-----\nMII...\n-----END PRIVATE KEY-----\n"`

### **Step 4: Redeploy**

Option A: **From Vercel Dashboard**
1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Check **"Use existing Build Cache"** or leave unchecked
4. Click **"Redeploy"**

Option B: **Push to GitHub** (triggers auto-deploy)
```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

---

## 🔍 **Troubleshooting Vercel Deployment**

### **Error: "next: command not found"**

✅ **FIXED** - This was caused by incorrect build configuration. The `vercel.json` I added fixes this.

If still happening:
1. Check Vercel project settings → Build Command is `npm run build`
2. Check Install Command is `npm install` (or empty to use default)
3. Make sure latest code is pushed to GitHub

### **Error: "GEMINI_API_KEY is not set"**

- Go to Vercel → Settings → Environment Variables
- Add `GEMINI_API_KEY` with your actual key
- Redeploy

### **Error: "Firebase configuration is undefined"**

- Make sure ALL `NEXT_PUBLIC_FIREBASE_*` variables are set in Vercel
- No typos in variable names
- Values match your Firebase project
- Redeploy after adding

### **Error: "Invalid private key" or Firebase Auth fails**

**For `FIREBASE_PRIVATE_KEY` in Vercel:**

1. Open your service account JSON file
2. Copy the ENTIRE `private_key` value including:
   ```
   -----BEGIN PRIVATE KEY-----
   MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSj...
   ...
   -----END PRIVATE KEY-----
   ```
3. In Vercel environment variables, paste it WITH the `\n` characters:
   ```
   -----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----\n
   ```
4. Wrap in quotes if needed

**Alternative method (if above doesn't work):**
- Replace all actual newlines with `\n` literally
- The key should be one continuous line with `\n` as text

### **Build succeeds but app shows errors**

1. Check browser console (F12) for specific errors
2. Check Vercel function logs: **Deployments** → Click deployment → **Functions** tab
3. Common issues:
   - Missing environment variables
   - Incorrect Firebase config
   - API key not on paid tier

---

## 📋 **Vercel Deployment Checklist**

Before deploying:
- [ ] `vercel.json` exists in repository ✅
- [ ] Code pushed to GitHub ✅
- [ ] All environment variables added to Vercel
- [ ] Firebase project created
- [ ] Firebase authentication enabled
- [ ] Service account JSON downloaded
- [ ] Gemini API key obtained (paid tier)

After first deployment:
- [ ] Build completes successfully
- [ ] No errors in deployment logs
- [ ] Site opens (e.g., `your-app.vercel.app`)
- [ ] Sign-in page appears
- [ ] Can sign in with email/password
- [ ] Can sign in with Google
- [ ] Can generate images/videos

---

## 🔐 **Update Firebase Authorized Domains**

After Vercel deployment succeeds:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. **Authentication** → **Settings** → **Authorized domains**
4. Click **"Add domain"**
5. Add your Vercel domain: `your-app.vercel.app`
6. Click **"Add"**

Without this, authentication won't work on your deployed site!

---

## 🎯 **Expected Result**

After successful deployment:

1. ✅ Build completes in ~1-3 minutes
2. ✅ Deployment URL: `https://your-app.vercel.app`
3. ✅ Opens sign-in page
4. ✅ Authentication works
5. ✅ Can generate AI content

---

## 📊 **Vercel Limits (Free Tier)**

- **Bandwidth**: 100GB/month
- **Build Time**: 6000 minutes/month  
- **Serverless Functions**: 100GB-hours
- **Deployments**: Unlimited

**For this app:** Free tier is more than enough for personal use!

---

## 🆘 **Still Having Issues?**

1. **Check Vercel deployment logs:**
   - Deployments → Click on failed deployment
   - Read the error messages carefully

2. **Check environment variables:**
   - Settings → Environment Variables
   - Make sure all 13 variables are set
   - No typos in names

3. **Check Firebase:**
   - Make sure auth is enabled
   - Check authorized domains includes Vercel URL

4. **Test locally first:**
   - If it works locally, it should work on Vercel
   - See `LOCAL_SETUP_INSTRUCTIONS.md`

---

## ✅ **Quick Fix Summary**

**What I did:**
1. ✅ Created `vercel.json` with correct build configuration
2. ✅ Pushed to GitHub

**What you need to do:**
1. Add environment variables in Vercel dashboard
2. Add Vercel domain to Firebase authorized domains  
3. Redeploy

**That's it!** Your deployment should work now. 🚀



