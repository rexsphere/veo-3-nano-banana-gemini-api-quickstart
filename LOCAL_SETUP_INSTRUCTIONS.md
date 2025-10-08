# 🏠 Local Setup - What You Need to Do Right Now

## ✅ Current Status

✅ Dependencies installed  
✅ `.env.local` file created  
❌ Need to add your API keys  

---

## 🎯 **Action Required: Fill in Your API Keys**

### **Step 1: Open `.env.local` in your editor**

```bash
# Using VS Code
code .env.local

# Or using nano
nano .env.local

# Or using vim
vim .env.local
```

The file is located at:
```
/Users/pruthvirajadhav/vertexAI/veo-3-nano-banana-gemini-api-quickstart/.env.local
```

---

### **Step 2: Get Your Gemini API Key**

1. **Go to:** https://aistudio.google.com/app/apikey
2. **Click:** "Create API key"
3. **Copy** the key
4. **Paste** it in `.env.local` replacing `your-gemini-api-key-here`

**⚠️ IMPORTANT:** You need **PAID tier** for Veo 3 & Imagen 4

```bash
# Replace this line in .env.local:
GEMINI_API_KEY="your-gemini-api-key-here"

# With your actual key:
GEMINI_API_KEY="AIzaSyA..."
```

---

### **Step 3: Set Up Firebase**

#### 3A. Create Firebase Project (3 minutes)

1. Go to: **https://console.firebase.google.com/**
2. Click **"Add project"**
3. Enter name: `gemini-veo-studio`
4. **Disable** Google Analytics (not needed)
5. Click **"Create project"**

#### 3B. Enable Authentication (2 minutes)

1. In sidebar, click **"Authentication"**
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable these:
   - ✅ **Email/Password** → Toggle ON → Save
   - ✅ **Google** → Toggle ON → Enter your email → Save

#### 3C. Get Web App Config (2 minutes)

1. Click **⚙️ Project Settings**
2. Scroll to **"Your apps"**
3. Click the **Web icon** `</>`
4. App nickname: `Web App`
5. **Don't** check "Set up Firebase Hosting"
6. Click **"Register app"**

**You'll see this config - COPY IT:**

```javascript
const firebaseConfig = {
  apiKey: "AIza...",                    // ← Copy this
  authDomain: "xxx.firebaseapp.com",    // ← Copy this
  projectId: "your-project-id",         // ← Copy this
  storageBucket: "xxx.appspot.com",     // ← Copy this
  messagingSenderId: "123...",          // ← Copy this
  appId: "1:123..."                     // ← Copy this
};
```

**Paste into `.env.local`:**

```bash
NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="xxx.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="xxx.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123..."
NEXT_PUBLIC_FIREBASE_APP_ID="1:123..."
```

#### 3D. Generate Service Account (3 minutes)

1. Still in **Project Settings**
2. Click **"Service accounts"** tab
3. Click **"Generate new private key"**
4. Click **"Generate key"**
5. A JSON file will download - **OPEN IT**

**The JSON looks like this:**

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMII...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com",
  "client_id": "123...",
  "auth_uri": "...",
  "token_uri": "...",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

**Copy these values to `.env.local`:**

```bash
FIREBASE_PROJECT_ID="your-project-id"              # from JSON
FIREBASE_PRIVATE_KEY_ID="abc123..."                # from JSON
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMII...\n-----END PRIVATE KEY-----\n"  # FULL key from JSON
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com"  # from JSON
FIREBASE_CLIENT_ID="123..."                        # from JSON
FIREBASE_CLIENT_X509_CERT_URL="https://www.googleapis.com/robot/v1/metadata/x509/..."  # from JSON
```

**⚠️ IMPORTANT:** Keep the `\n` characters in `FIREBASE_PRIVATE_KEY`!

---

### **Step 4: Verify Your Setup**

After filling in `.env.local`, run:

```bash
node setup-check.js
```

You should see:
```
✅ All environment variables configured!
🚀 Ready to run: npm run dev
```

If you see errors, double-check your values!

---

### **Step 5: Start the Development Server**

```bash
npm run dev
```

**Open:** http://localhost:3000

You should see the **sign-in page**! 🎉

---

## 🧪 **Test It**

1. **Sign up** with email/password (make up credentials)
2. **Sign in** with Google (use your Google account)
3. After signing in → You'll see the studio interface
4. **Try generating** an image or video!

---

## 🐛 **Troubleshooting**

### Build fails with errors

```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### "Invalid credentials" or Firebase errors

- Check all `NEXT_PUBLIC_FIREBASE_*` values are correct
- Make sure you enabled Email/Password and Google auth in Firebase
- Restart dev server: `Ctrl+C` then `npm run dev`

### "GEMINI_API_KEY not set"

- Make sure `.env.local` has your actual key
- No spaces around the `=` sign
- Wrap in quotes: `GEMINI_API_KEY="your-key"`

### Sign-in doesn't work

- Check Firebase console for errors
- Check browser console (F12) for error messages
- Make sure auth providers are enabled in Firebase

---

## 📊 **Quick Reference**

| What | Where | Time |
|------|-------|------|
| Gemini API Key | https://aistudio.google.com/app/apikey | 1 min |
| Firebase Project | https://console.firebase.google.com/ | 3 min |
| Enable Auth | Firebase → Authentication → Sign-in method | 2 min |
| Web Config | Firebase → Project Settings → Your apps | 2 min |
| Service Account | Firebase → Project Settings → Service accounts | 3 min |
| Edit .env.local | In your code editor | 5 min |
| **Total Time** | | **~15 min** |

---

## ✅ **Checklist**

- [ ] Created Firebase project
- [ ] Enabled Email/Password authentication
- [ ] Enabled Google authentication
- [ ] Got Firebase web config
- [ ] Generated service account JSON
- [ ] Got Gemini API key
- [ ] Filled in all values in `.env.local`
- [ ] Ran `node setup-check.js` → All green ✅
- [ ] Ran `npm run dev` → Server started
- [ ] Opened http://localhost:3000 → Sign-in page appears
- [ ] Successfully signed in
- [ ] Generated content works

---

## 🎉 **Once It's Working**

You're ready to:
1. Generate images with Imagen 4 or Gemini 2.5 Flash
2. Create videos with Veo 3
3. Edit and compose images
4. Deploy to production (see DEPLOYMENT_GUIDE.md)

**Need help?** Check:
- [QUICK_START.md](./QUICK_START.md) - Full guide
- [FIREBASE_SETUP_GUIDE.md](./FIREBASE_SETUP_GUIDE.md) - Detailed Firebase steps
- [SECURITY_FAQ.md](./SECURITY_FAQ.md) - Security questions

**Let's get started! 🚀**

