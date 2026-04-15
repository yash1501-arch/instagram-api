# Instagram Analytics API

A powerful API for scraping and analyzing Instagram profiles with metrics including follower growth, engagement rates, post analytics, and audience demographics.

## 🚀 Features

- **Profile Analytics**: Get detailed username, followers, following, post count, verification status
- **Engagement Metrics**: Track engagement rates, average likes/comments
- **Post Analysis**: View top performing posts with engagement metrics
- **Growth Prediction**: Predict follower growth trends using historical data
- **Follower History**: Track follower count changes over time
- **Rate Limiting**: Built-in protection against abuse
- **Caching**: 24-hour profile cache for optimal performance

## 📋 Prerequisites

- Node.js >= 16.0.0
- MongoDB cloud database (MongoDB Atlas)
- Instagram session cookies (for login-based scraping)
- Redis (optional, for enhanced caching)

## 🔧 Installation

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/instagram-api.git
cd instagram-api

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your environment variables
# MONGODB_URI=...
# REDIS_URL=...
# IG_SESSIONID=...

# Start server
npm start
```

## 📖 API Endpoints

### 1. Get Profile (Basic Info)
```
GET /api/profile/:username
```
**Parameters:**
- `username` (required): Instagram username

**Response:**
```json
{
  "success": true,
  "data": {
    "username": "instagram",
    "fullName": "Instagram",
    "bio": "Bringing you closer to the people and things...",
    "profilePicture": "https://...",
    "followersCount": 600000000,
    "followingCount": 1234,
    "postsCount": 5678,
    "isVerified": true,
    "lastScraped": "2026-04-15T09:38:00Z"
  }
}
```

### 2. Get Engagement Metrics
```
GET /api/engagement/:username
```
**Parameters:**
- `username` (required): Instagram username

**Response:**
```json
{
  "success": true,
  "data": {
    "engagementRate": 2.5,
    "avgLikes": 15000000,
    "avgComments": 250000
  }
}
```

### 3. Get Top Posts
```
GET /api/posts/:username
```
**Parameters:**
- `username` (required): Instagram username

**Response:**
```json
{
  "success": true,
  "data": {
    "topPosts": [
      {
        "shortcode": "ABC123",
        "likes": 20000000,
        "comments": 300000,
        "thumbnailUrl": "https://...",
        "timestamp": "2026-04-10T12:00:00Z",
        "engagementRate": 3.2
      }
    ],
    "postCount": 5
  }
}
```

### 4. Get Full Analytics
```
GET /api/analytics/:username
```
**Parameters:**
- `username` (required): Instagram username

**Response:**
```json
{
  "success": true,
  "data": {
    "profile": { ...profile data... },
    "growthPrediction": {
      "projectedWeeklyGrowth": 15000,
      "confidence": "High"
    }
  }
}
```

### 5. Get Follower History
```
GET /api/history/:username
```
**Parameters:**
- `username` (required): Instagram username

**Response:**
```json
{
  "success": true,
  "data": {
    "username": "instagram",
    "history": [
      {
        "date": "2026-04-01T00:00:00Z",
        "followersCount": 595000000,
        "followingCount": 1234,
        "postsCount": 5678,
        "engagementRate": 2.4
      }
    ],
    "dataPoints": 14
  }
}
```

## 🏥 Health Check

```
GET /health
```
Returns server status and uptime.

## 🔐 Authentication

⚠️ **Public API** - No authentication required for basic endpoints.

For future: Bearer token support can be added.

## ⚡ Rate Limiting

- **Standard Endpoints**: 100 requests per 15 minutes
- **Analytics Endpoint**: 10 requests per minute (higher load)
- **Rate limit headers**: `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`

## 🔑 Environment Variables

```
# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# Redis (optional)
REDIS_URL=redis://host:port

# Instagram Session (required for full data)
IG_SESSIONID=your_session_id
IG_CSRFTOKEN=your_csrf_token
IG_DS_USER_ID=your_user_id

# Server
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://your-domain.com
```

## 📦 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for:
- Railway.app deployment (recommended)
- Render.com deployment
- AWS/DigitalOcean deployment
- RapidAPI publishing guide

## 🧪 Testing

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test profile endpoint
curl http://localhost:3000/api/profile/instagram

# Test with query
curl http://localhost:3000/api/engagement/cristiano
```

## 📊 Performance

- Response time: < 2 seconds for cached profiles
- Cached data: 24 hours
- Database: MongoDB with indexing
- Scraping: Dual strategy (Axios + Puppeteer)

## 🐛 Troubleshooting

### MongoDB Connection Failed
- Check MONGODB_URI format
- Verify IP whitelist in MongoDB Atlas
- Ensure database credentials are correct

### Profile Not Found
- Username may be private
- Account may not exist
- Try with a public profile first

### Rate Limited
- Wait 15 minutes for standard endpoints
- Upgrade tier for higher limits
- Use caching on client side

## 📝 License

ISC

## 🤝 Contributing

Contributions welcome! Please:
1. Fork repository
2. Create feature branch
3. Test thoroughly
4. Submit pull request

## 📞 Support

- Issues: GitHub Issues
- Email: support@example.com
- RapidAPI: Check RapidAPI documentation

## 🎯 Roadmap

- [ ] GraphQL endpoint
- [ ] Advanced filtering
- [ ] Webhook support
- [ ] Custom analytics dashboard
- [ ] Competitor analysis
- [ ] Hashtag trends
- [ ] Content recommendations

---

**Made with ❤️ by Instagram Analytics API Team**

Check us out on [RapidAPI](https://rapidapi.com) for instant integration!
