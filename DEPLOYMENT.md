# MERN Stack Airtable Form Builder - Deployment Guide

## 🚀 Production Deployment Instructions

### Prerequisites
- GitHub account
- Render account (for backend)
- Vercel account (for frontend)
- MongoDB Atlas account (already configured)

---

## 🔧 Backend Deployment (Render)

### 1. Push to GitHub
```bash
cd backend
git init
git add .
git commit -m "Initial backend commit"
git branch -M main
git remote add origin https://github.com/yourusername/airtable-backend.git
git push -u origin main
```

### 2. Deploy to Render
1. Go to [render.com](https://render.com) and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository (airtable-backend)
4. Configure:
   - **Name**: `airtable-form-builder-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 3. Set Environment Variables in Render
Add these environment variables in Render dashboard:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://rony:1234@cluster0.igpmsqe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
SESSION_SECRET=your_super_secret_session_key_here_make_it_long_and_random
JWT_SECRET=your_jwt_secret_key_here_make_it_very_long_and_random
AIRTABLE_CLIENT_ID=12d5092f-b26d-4eb1-a41a-33418a56fc60
AIRTABLE_CLIENT_SECRET=f5c9573310e19001f6bfeeaccab8e0dc3e97fbf73e058ef0e5986225d9308665
AIRTABLE_REDIRECT_URI=https://your-backend-app.onrender.com/auth/airtable/callback
FRONTEND_URL=https://your-frontend-app.vercel.app
```

**⚠️ Important**: Replace `your-backend-app` and `your-frontend-app` with your actual app names!

---

## 🌐 Frontend Deployment (Vercel)

### 1. Push to GitHub
```bash
cd frontend
git init
git add .
git commit -m "Initial frontend commit"
git branch -M main
git remote add origin https://github.com/yourusername/airtable-frontend.git
git push -u origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository (airtable-frontend)
4. Configure:
   - **Framework**: `Vite`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3. Set Environment Variables in Vercel
Add this environment variable in Vercel dashboard:

```env
VITE_API_URL=https://your-backend-app.onrender.com
```

**⚠️ Important**: Replace `your-backend-app` with your actual Render app name!

---

## 🔄 Update URLs After Deployment

### 1. Update Backend CORS and Redirect URI
After getting your Vercel URL, update in Render:
```env
FRONTEND_URL=https://your-actual-vercel-url.vercel.app
AIRTABLE_REDIRECT_URI=https://your-actual-render-url.onrender.com/auth/airtable/callback
```

### 2. Update Frontend API URL
After getting your Render URL, update in Vercel:
```env
VITE_API_URL=https://your-actual-render-url.onrender.com
```

### 3. Update Airtable OAuth Settings
1. Go to [airtable.com/create/oauth](https://airtable.com/create/oauth)
2. Update your OAuth app redirect URI to:
   ```
   https://your-actual-render-url.onrender.com/auth/airtable/callback
   ```

---

## ✅ Testing Production Deployment

1. **Backend Health Check**: Visit `https://your-backend-app.onrender.com/` - should return API status
2. **Frontend**: Visit `https://your-frontend-app.vercel.app/` - should load the app
3. **OAuth Flow**: Test Airtable login - should redirect properly
4. **Form Creation**: Create a form and test submission
5. **Conditional Logic**: Test Photos field appearing when Status = "Completed"
6. **Live Data**: Test "View Data" button to see Airtable records

---

## 🚨 Common Issues & Solutions

### Backend Issues
- **500 Errors**: Check Render logs for environment variable issues
- **CORS Errors**: Ensure FRONTEND_URL matches your Vercel URL exactly
- **OAuth Fails**: Verify AIRTABLE_REDIRECT_URI in both Render and Airtable settings

### Frontend Issues
- **API Errors**: Verify VITE_API_URL points to your Render backend
- **Build Fails**: Check for TypeScript errors in Vercel build logs
- **Routing Issues**: Ensure vercel.json has correct SPA redirect rules

---

## 📝 Final Checklist

- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel  
- [ ] Environment variables configured correctly
- [ ] Airtable OAuth redirect URI updated
- [ ] URLs updated in both deployments
- [ ] OAuth login works in production
- [ ] Form creation and submission works
- [ ] Conditional logic works (Photos field appears)
- [ ] File upload works
- [ ] "View Data" shows live Airtable records

---

## 🎯 Demo URLs

After deployment, your demo URLs will be:
- **Frontend**: `https://your-frontend-app.vercel.app`
- **Backend API**: `https://your-backend-app.onrender.com`

Share the frontend URL with your boss to demonstrate the complete MERN Stack Interview Task!

---

## 🔧 Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| Frontend | localhost:5173 | your-app.vercel.app |
| Backend | localhost:5000 | your-app.onrender.com |
| Database | MongoDB Atlas | MongoDB Atlas |
| OAuth | Local redirect | Production redirect |
| CORS | localhost only | Production URLs |

Your application is now production-ready! 🚀
