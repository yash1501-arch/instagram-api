# Instagram API - Deployment & RapidAPI Guide

## 📋 Pre-Deployment Checklist

Before deploying, ensure:
- ✅ All environment variables are set properly
- ✅ Server uses `process.env.PORT` (already done ✓)
- ✅ Database is cloud-based MongoDB (you have this ✓)
- ✅ All dependencies are in package.json ✓
- ✅ `npm start` script works locally ✓

---

## 🚀 Step 1: Prepare for Production

### Update your package.json node version:
```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

### Create a Procfile (for platforms like Heroku):
```
web: node server.js
```

---

## 🌍 Step 2: Choose Your Hosting Platform

### **Option A: Railway.app (Recommended for beginners) ⭐**
- **Cost**: Free tier available, then $5/month
- **Setup time**: 5 minutes
- **Best for**: Quick deployment with GitHub integration

**Steps:**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub"
4. Select your instagram-api repository
5. Add environment variables in Railway dashboard:
   - `MONGODB_URI`
   - `REDIS_URL`
   - `IG_SESSIONID`
   - `IG_CSRFTOKEN`
   - `IG_DS_USER_ID`
   - `NODE_ENV=production`
   - `PORT=3000`
6. Deploy automatically!

**Your URL will be**: `https://instagram-api-xxx.railway.app`

---

### **Option B: Render.com**
- **Cost**: Free tier with limitations, $7/month after
- **Setup time**: 5 minutes
- **Best for**: Web services and APIs

**Steps:**
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - Name: `instagram-api`
   - Environment: `Node`
   - Build command: `npm install`
   - Start command: `npm start`
6. Add environment variables in "Environment" tab
7. Deploy!

**Your URL will be**: `https://instagram-api-xxx.onrender.com`

---

### **Option C: Vercel**
- **Cost**: Free tier available
- **Setup time**: 3 minutes
- **Note**: Better for serverless functions (not ideal for long-running servers)

---

### **Option D: AWS/DigitalOcean**
- **Cost**: $5-20/month
- **Setup time**: 20-30 minutes
- **Best for**: Production, custom scaling

---

## 📨 Step 3: Set Production Environment Variables

After deployment, add these environment variables in your hosting dashboard:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
REDIS_URL=redis://connection-url:port
IG_SESSIONID=your_instagram_session_id
IG_CSRFTOKEN=your_csrf_token
IG_DS_USER_ID=your_user_id
NODE_ENV=production
CORS_ORIGIN=https://your-domain.com
PORT=3000
```

**⚠️ Security Important:**
- Never commit `.env` to GitHub
- Use your hosting platform's environment variable section
- Rotate session cookies monthly

---

## 🔗 Step 4: Test Your Deployed API

Once deployed, test these endpoints:

```bash
# Replace with your actual deployed URL
BASE_URL="https://your-api-url.railway.app"

# Health check
curl $BASE_URL/health

# Get profile
curl "$BASE_URL/api/profile/instagram"

# Get engagement
curl "$BASE_URL/api/engagement/instagram"

# Get posts
curl "$BASE_URL/api/posts/instagram"

# Get full analytics
curl "$BASE_URL/api/analytics/instagram"
```

---

## 🚀 Step 5: Publish on RapidAPI

### **Create RapidAPI Account:**
1. Go to [rapidapi.com](https://rapidapi.com)
2. Sign up (free)
3. Go to "My APIs" → "Create API"

### **Fill API Details:**
```
API Name:           Instagram Analytics API
Description:        Get detailed Instagram analytics including followers, 
                   engagement rates, post metrics, growth predictions, and 
                   audience demographics

Category:           Social Media
Base URL:           https://your-api-url.railway.app/api
Version:            1.0.0
Tier:              Free (basic tier)
```

### **Add Endpoints in RapidAPI:**

#### Endpoint 1: Get Profile
```
Path:           /profile/{username}
Method:         GET
Rate Limit:     100 requests/15 min
Description:    Fetch basic Instagram profile information
Parameters:
  - username (path, required): Instagram username
Response Example:
{
  "success": true,
  "data": {
    "username": "instagram",
    "followers": 600000000,
    "isVerified": true,
    "engagementRate": 2.5
  }
}
```

#### Endpoint 2: Get Engagement
```
Path:           /engagement/{username}
Method:         GET
Description:    Get engagement metrics
Parameters:
  - username (path, required): Instagram username
```

#### Endpoint 3: Get Posts
```
Path:           /posts/{username}
Method:         GET
Description:    Get top Instagram posts with metrics
Parameters:
  - username (path, required): Instagram username
```

#### Endpoint 4: Get Analytics
```
Path:           /analytics/{username}
Method:         GET
Description:    Get full analytics with growth prediction
Parameters:
  - username (path, required): Instagram username
```

#### Endpoint 5: Get History
```
Path:           /history/{username}
Method:         GET
Description:    Get historical follower data over time
Parameters:
  - username (path, required): Instagram username
```

### **RapidAPI Monetization Options:**

#### Option 1: Free with Basic Tier
- Allow users to try free with limited requests
- Good for building audience

#### Option 2: Paid Subscriptions
```
Free Tier:
- 100 requests/month
- 15 requests/min

Basic ($9.99/month):
- 10,000 requests/month
- 100 requests/min

Pro ($29.99/month):
- 100,000 requests/month
- 500 requests/min
```

#### Option 3: Pay-as-You-Go
- Charge per request (e.g., $0.01 per request)
- Good for high-volume use

---

## 📊 Step 6: Monitor & Scale

### **Add Monitoring:**
1. Install monitoring for free on:
   - [UptimeRobot.com](https://uptimerobot.com) - Monitor API uptime
   - [LogRocket.com](https://logrocket.com) - Track errors
   - Your platform's built-in logs

2. Set up alerts for:
   - API downtime
   - Error rates > 5%
   - High response times > 2s

### **Scaling:**
If you get thousands of users:
- Increase server resources
- Add caching with Redis (you already have it!)
- Implement database indexing
- Use CDN for static content

---

## 🎯 Step 7: Marketing Your API

1. **Update README.md** with deployment URL
2. **Add API documentation** (OpenAPI/Swagger)
3. **Create example code snippets** in popular languages
4. **Share on**:
   - Twitter/X
   - Dev.to
   - Product Hunt
   - Discord communities
   - Reddit communities

---

## 📚 Complete Example: Deploy to Railway

### Quick Start (5 minutes):

1. **Push code to GitHub**:
   ```bash
   cd c:\Users\Yash PC\Desktop\instagram-api
   git init
   git add .
   git commit -m "Instagram API ready for production"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/instagram-api.git
   git push -u origin main
   ```

2. **Visit Railway.app**:
   - Sign in with GitHub
   - Click "New Project"
   - Select your instagram-api repo
   - Go to Variables tab
   - Add all environment variables
   - Wait 2-3 minutes for deployment

3. **Get your public URL**:
   - Check Deployments tab
   - Copy your URL (e.g., https://instagram-api-prod.railway.app)
   - Test: `curl https://instagram-api-prod.railway.app/health`

4. **Register on RapidAPI**:
   - Create API with your Railway URL
   - Add endpoints
   - Set pricing
   - Wait for approval (24-48 hours)

---

## 🔐 Production Best Practices

1. **Security**:
   - Use HTTPS only ✓ (hosting platform provides)
   - Add CORS whitelist ✓ (we added it)
   - Rate limit strictly ✓ (we added it)
   - Rotate Instagram cookies monthly
   - Never expose secrets in logs

2. **Performance**:
   - Enable gzip compression
   - Cache profiles for 24h ✓ (we do this)
   - Use Redis for session caching
   - Monitor response times

3. **Reliability**:
   - Set up health checks ✓
   - Enable auto-restart on crash
   - Monitor error rates
   - Keep logs for debugging

---

## 💰 Monetization Strategy

### Recommended Pricing Model:
```
Free Tier:
- 50 requests/month
- Perfect for testing

Developer ($4.99/month):
- 5,000 requests/month
- Priority support

Business ($19.99/month):
- 50,000 requests/month
- Custom limits

Enterprise (Contact Us):
- Unlimited
- Dedicated support
```

---

## 🆘 Troubleshooting

### "Port already in use"
- Change PORT in .env
- Or kill process: `lsof -i :3000`

### "MongoDB connection failed"
- Verify MONGODB_URI is correct
- Check IP whitelist in MongoDB Atlas
- Ensure network tab allows your hosting IP

### "10min timeout on RapidAPI"
- Reduce scraping time or use caching
- Consider async/queue system with BullMQ

### "API rate limited"
- Increase Redis TTL for cached profiles
- Upgrade hosting plan
- Implement request queuing

---

## 📞 Support & Resources

- **RapidAPI Docs**: https://docs.rapidapi.com
- **Railway Docs**: https://docs.railway.app
- **Express Best Practices**: https://expressjs.com/en/advanced/best-practice-security.html
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas

---

## 🎉 Next Steps

1. Choose a hosting platform (Railway recommended)
2. Deploy your API
3. Test all endpoints
4. Register on RapidAPI
5. Set up monitoring
6. Start marketing!

Your API will be live in **< 30 minutes**! 🚀
