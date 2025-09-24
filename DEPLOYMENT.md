# Local Development & Render Deployment Guide

## ✅ Quick Local Setup

1. **Clone and install:**
   ```bash
   git clone <your-repo>
   cd <project-folder>
   npm install
   ```

2. **Copy environment file:**
   ```bash
   cp .env.local .env
   ```

3. **Start development:**
   ```bash
   npm run dev
   ```

4. **Open browser:** http://localhost:5000

## 🌐 Deploy to Render

### Option 1: Using render.yaml (Recommended)
1. Connect your GitHub repo to Render
2. The `render.yaml` file will handle the rest automatically
3. Set these environment variables in Render dashboard:
   - `DATABASE_URL` (optional - for PostgreSQL)
   - `SENDGRID_API_KEY` (optional - for contact forms)

### Option 2: Manual Setup
1. Create new Web Service on Render
2. Connect your GitHub repository
3. Use these settings:
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Node Version:** 18+

## 🔧 Environment Variables

### Required for Production:
- `NODE_ENV=production` (auto-set by Render)
- `SESSION_SECRET` (auto-generated secure value)

### Optional:
- `DATABASE_URL` - PostgreSQL connection (uses memory store if not set)
- `SENDGRID_API_KEY` - For contact form emails
- `FROM_EMAIL` - Email address for contact forms
- `BASE_URL` - Your domain (defaults to https://hwinnwin.com)

## 🐛 Troubleshooting

### Local Development Issues:

**Blank page:**
1. Check browser console (F12) for errors
2. Verify content files exist: `ls content/`
3. Check terminal for server errors

**Port 5000 in use:**
```bash
# Mac/Linux
lsof -i :5000
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Replit plugin errors:**
- These are normal when running locally
- The app will skip them automatically

### Render Deployment Issues:

**Build failures:**
- Check build logs in Render dashboard
- Ensure Node.js version is 18+
- Verify all dependencies install correctly

**Runtime errors:**
- Check application logs in Render
- Verify environment variables are set
- Check if PORT is being used correctly

## 📁 Project Structure

```
project/
├── client/          # React frontend
├── server/          # Express backend  
├── content/         # YAML content files
├── shared/          # Shared types
├── .env.local       # Local dev environment
├── render.yaml      # Render deployment config
└── package.json     # Dependencies & scripts
```

## 🔍 Verification

After deployment, verify these URLs work:
- `/` → Redirects to `/hwin` (HwinNwin marketing)
- `/hwin/about` → About page loads
- `/api/content/site-data` → Returns JSON data
- `/panel-quote` → Old automotive app (for existing users)

## 🎯 What You Get

- **Marketing site** at root URL
- **Automatic redirect** from / to /hwin  
- **Professional HwinNwin branding**
- **Responsive design** for mobile/desktop
- **Contact form** with email integration
- **SEO optimization** with meta tags
- **Old automotive app** preserved at /panel-quote