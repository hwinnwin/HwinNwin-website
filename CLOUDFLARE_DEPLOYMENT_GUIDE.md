# Cloudflare Pages Deployment Guide for HwinNwin.com

This guide will help you deploy your HwinNwin landing page to Cloudflare Pages with your custom domain **www.hwinnwin.com**.

---

## 🚀 Part 1: Deploy to Cloudflare Pages

### Option A: Connect GitHub Repository (Recommended - Auto-deploys on push)

1. **Log into Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com
   - Navigate to **Workers & Pages** in the left sidebar

2. **Create New Pages Project**
   - Click **Create application**
   - Select **Pages** tab
   - Click **Connect to Git**

3. **Connect Your GitHub Repository**
   - Authorize Cloudflare to access your GitHub account
   - Select the repository: `hwinnwin/HwinNwin-website`
   - Click **Begin setup**

4. **Configure Build Settings**
   ```
   Project name: hwinnwin-website
   Production branch: claude/hwinnwin-landing-revision-011CV16pyjCP85Xpcn3nLhWU

   Build settings:
   Framework preset: Vite
   Build command: npm run build
   Build output directory: dist/public
   Root directory: (leave empty)

   Environment variables:
   NODE_VERSION = 18
   ```

5. **Deploy**
   - Click **Save and Deploy**
   - Wait for the build to complete (2-5 minutes)
   - You'll get a temporary URL like `hwinnwin-website.pages.dev`

---

### Option B: Direct Upload (Quick test, manual deploys)

1. **Build locally** (on your machine, not in this environment):
   ```bash
   cd /path/to/HwinNwin-website
   npm install
   npm run build
   ```

2. **Upload to Cloudflare**
   - Go to https://dash.cloudflare.com
   - **Workers & Pages** → **Create application** → **Pages** → **Upload assets**
   - Drag and drop the `dist/public` folder
   - Name your project: `hwinnwin-website`

---

## 🌐 Part 2: Set Up Custom Domain (www.hwinnwin.com)

### Step 1: Add Domain to Cloudflare (if not already added)

1. **Add Site to Cloudflare**
   - In Cloudflare Dashboard, click **Add site**
   - Enter: `hwinnwin.com`
   - Select Free plan
   - Click **Add site**

2. **Update Nameservers at Your Domain Registrar**
   - Cloudflare will show you 2 nameservers (like `ana.ns.cloudflare.com` and `bob.ns.cloudflare.com`)
   - Go to your domain registrar (GoDaddy, Namecheap, Google Domains, etc.)
   - Replace existing nameservers with Cloudflare's nameservers
   - Wait 24-48 hours for nameserver propagation (usually much faster)

### Step 2: Connect Custom Domain to Pages Project

1. **Go to Your Pages Project**
   - Dashboard → **Workers & Pages**
   - Click on your `hwinnwin-website` project

2. **Add Custom Domain**
   - Click **Custom domains** tab
   - Click **Set up a custom domain**
   - Enter: `www.hwinnwin.com`
   - Click **Continue**

3. **Cloudflare will automatically:**
   - Create a CNAME record: `www` → `hwinnwin-website.pages.dev`
   - Provision a free SSL certificate (automatic, takes ~1 minute)
   - Enable HTTPS

4. **Add Apex Domain (Optional but Recommended)**
   - Add another custom domain: `hwinnwin.com` (without www)
   - This creates an AAAA/A record pointing to Cloudflare Pages
   - Users typing `hwinnwin.com` will be redirected to `www.hwinnwin.com`

---

## 🔒 Part 3: Configure DNS Settings (if not automatic)

If Cloudflare didn't create the DNS records automatically:

1. **Go to DNS Settings**
   - Dashboard → Select `hwinnwin.com` → **DNS** → **Records**

2. **Add CNAME Record for www**
   ```
   Type: CNAME
   Name: www
   Target: hwinnwin-website.pages.dev
   Proxy status: Proxied (orange cloud)
   TTL: Auto
   ```

3. **Add Redirect for Apex Domain (optional)**
   - Use Page Rules or Bulk Redirects to redirect `hwinnwin.com` → `www.hwinnwin.com`
   - OR add AAAA/A records pointing to Cloudflare Pages IP addresses

---

## ✅ Part 4: Verify Deployment

1. **Check DNS Propagation**
   - Use https://dnschecker.org
   - Enter `www.hwinnwin.com`
   - Verify CNAME points to Cloudflare Pages

2. **Test Your Website**
   - Visit: https://www.hwinnwin.com
   - Check SSL certificate (🔒 should appear in browser)
   - Test on mobile and desktop

3. **Check SSL Certificate**
   - Should be automatic and free via Cloudflare
   - Valid for `hwinnwin.com` and `www.hwinnwin.com`

---

## 🔧 Configuration Files Included

This repository includes:

- **`_headers`**: Security headers (CSP, X-Frame-Options, etc.)
- **`_redirects`**: SPA routing for React (all routes → index.html)
- **`wrangler.toml`**: Cloudflare Pages configuration

These files are automatically deployed with your site.

---

## 📋 Quick Checklist

- [ ] Cloudflare account created
- [ ] Repository connected to Cloudflare Pages (Option A) OR built and uploaded (Option B)
- [ ] Domain `hwinnwin.com` added to Cloudflare
- [ ] Nameservers updated at domain registrar
- [ ] Custom domain `www.hwinnwin.com` added to Pages project
- [ ] SSL certificate provisioned (automatic)
- [ ] DNS records verified
- [ ] Website accessible at https://www.hwinnwin.com

---

## 🆘 Troubleshooting

### Build Fails on Cloudflare
- Check build logs in Cloudflare dashboard
- Ensure `NODE_VERSION` environment variable is set to `18` or higher
- Verify build command: `npm run build`
- Verify output directory: `dist/public`

### Domain Not Working
- Wait 24-48 hours for nameserver propagation
- Check DNS records in Cloudflare DNS settings
- Verify CNAME points to `hwinnwin-website.pages.dev`
- Clear browser cache or test in incognito mode

### SSL Certificate Issues
- Cloudflare auto-provisions SSL - wait 5-10 minutes
- Ensure "Proxy status" is enabled (orange cloud) in DNS settings
- Check SSL/TLS settings: should be "Full" or "Full (strict)"

---

## 🎉 Expected Results

Once complete, your website will be:

✅ Live at https://www.hwinnwin.com
✅ SSL-secured with free Cloudflare certificate
✅ CDN-accelerated globally
✅ Auto-deploying on git push (if using GitHub integration)
✅ Protected with security headers
✅ Optimized for performance

---

## 📞 Next Steps

1. Follow **Part 1** to deploy to Cloudflare Pages
2. Follow **Part 2** to connect your custom domain
3. Verify everything works at https://www.hwinnwin.com
4. Celebrate! 🎉

---

**Need help?** Check Cloudflare Pages docs: https://developers.cloudflare.com/pages
