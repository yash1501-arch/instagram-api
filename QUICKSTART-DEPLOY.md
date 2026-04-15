# Quick Deployment Guide - Railway.app

## 🚀 Deploy to Railway in 5 Minutes

### Step 1: Push to GitHub
```bash
cd c:\Users\Yash PC\Desktop\instagram-api

# Initialize git (if not already done)
git init
git add .
git commit -m "Instagram API ready for production"
git branch -M main

# Add your GitHub repo
git remote add origin https://github.com/YOUR_USERNAME/instagram-api.git
git push -u origin main
```

### Step 2: Create Railway Account
1. Visit https://railway.app
2. Click **Sign Up**
3. Choose **GitHub** to sign up
4. Authorize Railway to access your GitHub

### Step 3: Deploy Project
1. On Railway dashboard, click **New Project**
2. Select **Deploy from GitHub repo**
3. Find and select `instagram-api`
4. Click **Deploy**
5. Wait 1-2 minutes for deployment

### Step 4: Add Environment Variables
1. Go to your project on Railway
2. Click **Variables** tab
3. Add each variable:

```
Name: MONGODB_URI
Value: mongodb+srv://username:password@cluster.mongodb.net/dbname

Name: REDIS_URL
Value: redis://your-redis-url:port

Name: IG_SESSIONID
Value: your_session_id

Name: IG_CSRFTOKEN
Value: your_csrf_token

Name: IG_DS_USER_ID
Value: your_user_id

Name: NODE_ENV
Value: production

Name: CORS_ORIGIN
Value: https://your-api-url.railway.app
```

4. Click **Deploy** button

### Step 5: Get Your Public URL
1. Go to **Deployments** tab
2. Find your active deployment
3. Copy the URL (e.g., `https://instagram-api-production-xxxxxx.railway.app`)

### Step 6: Test Your API
```bash
# Replace with your actual URL
DEPLOY_URL="https://instagram-api-production-xxxxxx.railway.app"

# Test health
curl $DEPLOY_URL/health

# Test profile
curl "$DEPLOY_URL/api/profile/instagram"
```

---

## 📱 Alternative: Deploy to Render.com

### Step 1-2: Same as Railway (GitHub push required)

### Step 3: Create Render Account
1. Visit https://render.com
2. Click **Sign Up**
3. Choose **Continue with GitHub**
4. Authorize Render

### Step 4: Create Web Service
1. Click **New +** → **Web Service**
2. Select your `instagram-api` repository
3. Configure:
   - **Name**: `instagram-api`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or Starter)

### Step 5: Add Environment Variables
1. Scroll to **Environment**
2. Add each variable:
   - `MONGODB_URI`
   - `REDIS_URL`
   - `IG_SESSIONID`
   - `IG_CSRFTOKEN`
   - `IG_DS_USER_ID`
   - `NODE_ENV=production`
   - `CORS_ORIGIN`

3. Click **Create Web Service**
4. Wait 3-5 minutes

### Step 6: Get Your URL
- Copy from dashboard (e.g., `https://instagram-api-xxxxx.onrender.com`)

---

## 🔄 Auto-Deployment Setup

Both platforms automatically redeploy when you push to GitHub!

```bash
# Make changes locally
# ...

# Push to GitHub (auto-deploys)
git add .
git commit -m "Update endpoint"
git push origin main

# Wait 1-2 minutes for deployment
```

---

## ✅ Verify Deployment

Check these after deployment:

```powershell
# 1. Health check
Invoke-WebRequest -Uri "https://your-deployed-url/health" | 
  Select-Object -ExpandProperty Content

# 2. Profile endpoint
Invoke-WebRequest -Uri "https://your-deployed-url/api/profile/cristiano" | 
  Select-Object -ExpandProperty Content

# 3. Check response time (should be < 2s)
```

---

## 🐛 Common Issues

### ❌ Build Failed - Port Error
**Solution**: Railway/Render automatically assign a port. Make sure your code uses `process.env.PORT` ✓ (we already do this)

### ❌ Deployment Stuck
**Solution**: 
- Check build logs in dashboard
- Ensure all dependencies are in package.json
- Verify `npm start` command works locally

### ❌ "Cannot find module" Error
**Solution**:
```bash
# Delete lock files and reinstall
rm package-lock.json
npm install
```

### ❌ MongoDB Connection Timeout
**Solution**:
- Check MONGODB_URI format
- In MongoDB Atlas: Network > IP Whitelist
- Add `0.0.0.0/0` (allow all) or specific IP
- For Railway: Get IP from logs, add to whitelist

### ❌ Cookies Not Working
**Solution**:
- Instagram cookies expire every 90 days
- Get fresh cookies using the instructions in .env.example
- Update in deployment dashboard

---

## 📈 Monitor Your Deployment

### Railway Monitoring
- **Logs**: Click your deployment → Logs tab
- **Metrics**: Check CPU, Memory, Network usage
- **Alerts**: Set up email notifications for errors

### Render Monitoring
- **Logs**: View real-time logs in dashboard
- **Metrics**: Monitor resource usage
- **Events**: Track deployment history

### External Monitoring (Free)
```
UptimeRobot (https://uptimerobot.com):
- Monitors API uptime 24/7
- Alerts if down
- Status page

Better Stack (https://betterstack.com):
- Uptime monitoring
- Error tracking
- Log aggregation
```

---

## 🚀 Next: Publish on RapidAPI

Once deployed successfully:

1. Visit https://rapidapi.com
2. Go to **My APIs** → **Create New API**
3. Fill in details:
   - API Name: Instagram Analytics API
   - Base URL: Your deployed URL
   - Description: Your API description
4. Add endpoints (see DEPLOYMENT.md)
5. Set pricing tier
6. Submit for approval

---

## 💡 Pro Tips

1. **Use custom domain (optional)**
   - Railway: Settings → Custom Domain
   - Render: Settings → Custom Domain
   - Costs $0-5/month

2. **Set up auto-scaling**
   - For paid plans only
   - Automatic restart on failure
   - Load balancing

3. **Database optimization**
   - Use MongoDB indexes
   - Enable connection pooling
   - Regular backups

4. **Cache optimization**
   - Use Redis for frequently accessed profiles
   - Browser caching with Cache-Control headers
   - CDN for static assets (if any)

---

## 📞 Support

- **Railway Support**: https://railway.app/support
- **Render Support**: https://render.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com
- **RapidAPI**: https://docs.rapidapi.com

---

**Your API will be LIVE and ACCESSIBLE globally in minutes! 🌍**
