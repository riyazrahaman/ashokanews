# Ashoka Women's College News App
## Complete Setup, Deployment & API Documentation

---

## 📋 Table of Contents
1. [Architecture Overview](#architecture)
2. [Project Structure](#structure)
3. [Environment Setup](#environment)
4. [Backend Setup](#backend)
5. [Admin Dashboard Setup](#admin)
6. [Mobile App Setup](#mobile)
7. [API Documentation](#api)
8. [Deployment Guide](#deployment)
9. [Build APK for Android](#apk)

---

## 🏗️ Architecture Overview {#architecture}

```
┌─────────────────────────────────────────────────────────────┐
│                    Ashoka News Platform                       │
├───────────────┬──────────────────┬──────────────────────────┤
│  Mobile App   │  Admin Dashboard │     Backend API           │
│ (React Native)│   (React + Vite) │  (Node.js + Express)      │
└───────┬───────┴────────┬─────────┴──────────┬───────────────┘
        │                │                    │
        └────────────────┴────────────────────┘
                         │
              ┌──────────┼──────────┐
              │          │          │
           MongoDB   Cloudinary  Firebase
          (Database) (Images)  (Push Notifications)
```

**Data Flow:**
- Admin creates news via Admin Dashboard → REST API → MongoDB
- Mobile app fetches news via REST API → displays to students
- On publish → Firebase sends push notifications to all app users

---

## 📂 Project Structure {#structure}

```
ashoka-news-app/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   ├── cloudinary.js      # Cloudinary + multer setup
│   │   ├── scheduler.js       # Cron for scheduled publishing
│   │   └── seed.js            # Initial data seeder
│   ├── controllers/
│   │   ├── adminController.js # Admin auth & dashboard
│   │   └── newsController.js  # News CRUD operations
│   ├── middleware/
│   │   ├── auth.js            # JWT protection
│   │   └── validate.js        # Input validation
│   ├── models/
│   │   ├── Admin.js           # Admin schema (bcrypt hashed)
│   │   ├── News.js            # News article schema
│   │   └── FCMToken.js        # Push notification tokens
│   ├── routes/
│   │   ├── admin.js           # /api/admin routes
│   │   ├── news.js            # /api/news routes
│   │   └── notifications.js   # /api/notifications routes
│   ├── services/
│   │   └── fcm.js             # Firebase push notifications
│   ├── server.js              # Express app entry point
│   └── .env.example           # Environment variable template
│
├── admin-dashboard/
│   ├── src/
│   │   ├── api/index.js       # Axios API service
│   │   ├── components/
│   │   │   └── Layout.jsx     # Sidebar + shell layout
│   │   ├── context/
│   │   │   └── AuthContext.jsx # React auth context
│   │   └── pages/
│   │       ├── LoginPage.jsx     # Admin login
│   │       ├── DashboardPage.jsx # Stats & charts
│   │       ├── NewsListPage.jsx  # News table with filters
│   │       ├── NewsFormPage.jsx  # Create/edit article form
│   │       └── SettingsPage.jsx  # Change password
│   └── package.json
│
└── mobile-app/
    ├── app/                   # Expo Router pages
    │   ├── _layout.jsx        # Root layout + notifications
    │   ├── index.jsx          # Home screen
    │   ├── search.jsx         # Search screen
    │   ├── bookmarks.jsx      # Saved articles
    │   └── news/[id].jsx      # Article detail
    └── src/
        ├── screens/           # Screen components
        ├── services/          # API + storage services
        └── constants/         # Theme, colors, categories
```

---

## ⚙️ Environment Setup {#environment}

### Backend `.env` file

Copy `backend/.env.example` to `backend/.env` and fill in:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB Atlas
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/ashoka-news?retryWrites=true&w=majority

# JWT (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=your_64_character_random_string_here
JWT_EXPIRE=7d

# Cloudinary (get from cloudinary.com dashboard)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Firebase (paste entire JSON as one line - from Firebase Console > Project Settings > Service Accounts)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"ashoka-news","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"..."}

# CORS (comma-separated list of allowed origins)
ALLOWED_ORIGINS=http://localhost:5173,https://admin.yourcollegedomain.com
```

### Admin Dashboard `.env`

Create `admin-dashboard/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### Mobile App `.env`

Create `mobile-app/.env`:
```env
EXPO_PUBLIC_API_URL=http://YOUR_BACKEND_IP:5000/api
```

---

## 🖥️ Backend Setup {#backend}

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier works)

### Installation

```bash
cd backend
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your credentials

# Run database seeder (creates admin account + sample data)
npm run seed

# Start development server
npm run dev

# Start production server
npm start
```

### Default Admin Credentials (from seeder)
```
Username: admin
Password: Ashoka@2024
```
**⚠️ Change this password immediately after first login!**

---

## 🖥️ Admin Dashboard Setup {#admin}

### Installation

```bash
cd admin-dashboard
npm install

# Create .env
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start development
npm run dev

# Build for production
npm run build
```

Dashboard runs at: `http://localhost:5173`

---

## 📱 Mobile App Setup {#mobile}

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI (for builds): `npm install -g eas-cli`
- Android Studio (for emulator) or physical device

### Installation

```bash
cd mobile-app
npm install

# Update API URL in .env
echo "EXPO_PUBLIC_API_URL=http://YOUR_PC_IP:5000/api" > .env
# Use your local network IP (not localhost!) when testing on physical device

# Start Expo development server
npm start

# Or run directly on Android
npm run android
```

### Firebase Setup for Push Notifications

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create project "Ashoka News"
3. Add Android app with package name `com.ashoka.news`
4. Download `google-services.json`
5. Place it in `mobile-app/google-services.json`

---

## 📚 API Documentation {#api}

### Base URL
```
http://localhost:5000/api
```

### Authentication
All admin routes require: `Authorization: Bearer <JWT_TOKEN>`

---

### Auth Endpoints

#### `POST /admin/login`
Login as admin.

**Request:**
```json
{
  "username": "admin",
  "password": "Ashoka@2024"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "...",
    "username": "admin",
    "name": "Super Admin",
    "role": "super_admin"
  }
}
```

#### `GET /admin/me` 🔒
Get current admin profile.

#### `GET /admin/dashboard` 🔒
Get dashboard statistics.

**Response:**
```json
{
  "stats": { "totalNews": 45, "publishedNews": 40, "draftNews": 5, "totalViews": 12840 },
  "recentNews": [...],
  "categoryStats": [{ "_id": "Events", "count": 12, "views": 4200 }]
}
```

---

### News Endpoints

#### `GET /news`
Get paginated published news.

**Query Params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Articles per page |
| category | string | null | Filter by category |

**Response:**
```json
{
  "data": [{ "_id": "...", "title": "...", "shortDescription": "...", "imageUrl": "...", "category": "Events", "views": 142, "publishedAt": "2024-01-15T10:30:00Z" }],
  "pagination": { "page": 1, "limit": 10, "total": 40, "pages": 4, "hasNext": true, "hasPrev": false }
}
```

#### `GET /news/featured`
Get up to 5 featured articles.

#### `GET /news/:id`
Get single article (increments view count).

**Response includes** `data` (article) and `related` (array of related articles).

#### `GET /news/search?q=keyword`
Full-text search across title, description, content, tags.

#### `POST /news` 🔒
Create new article. Send as `multipart/form-data`.

| Field | Type | Required |
|-------|------|----------|
| title | string | ✅ |
| shortDescription | string | ✅ |
| content | string | ✅ |
| category | string | ✅ |
| image | file | ❌ |
| tags | JSON string | ❌ |
| publishNow | "true"/"false" | ❌ |
| scheduledAt | ISO date string | ❌ |
| featured | "true"/"false" | ❌ |
| author | string | ❌ |

#### `PUT /news/:id` 🔒
Update article. Same fields as POST.

#### `DELETE /news/:id` 🔒
Delete article (also removes image from Cloudinary).

#### `PATCH /news/:id/publish` 🔒
Toggle publish/unpublish status.

---

### Notification Endpoints

#### `POST /notifications/register-token`
Register device for push notifications.

```json
{ "token": "ExponentPushToken[...]", "platform": "android" }
```

---

## 🚀 Deployment Guide {#deployment}

### Option A: Deploy on Ubuntu VPS (DigitalOcean, AWS EC2, etc.)

#### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Certbot (SSL)
sudo apt install -y certbot python3-certbot-nginx
```

#### 2. Deploy Backend
```bash
# Clone your repo
git clone https://github.com/yourorg/ashoka-news-app.git
cd ashoka-news-app/backend

# Install dependencies
npm install --production

# Create .env with your production values
nano .env

# Start with PM2
pm2 start server.js --name "ashoka-backend"
pm2 save
pm2 startup
```

#### 3. Deploy Admin Dashboard
```bash
cd ../admin-dashboard

# Set production API URL
echo "VITE_API_URL=https://api.yourcollegedomain.com/api" > .env

npm install
npm run build
# Output is in dist/ folder
```

#### 4. Configure Nginx

```nginx
# /etc/nginx/sites-available/ashoka-backend
server {
    listen 80;
    server_name api.yourcollegedomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        client_max_body_size 10M;
    }
}

# /etc/nginx/sites-available/ashoka-admin
server {
    listen 80;
    server_name admin.yourcollegedomain.com;

    root /path/to/ashoka-news-app/admin-dashboard/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
# Enable sites
sudo ln -s /etc/nginx/sites-available/ashoka-backend /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/ashoka-admin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d api.yourcollegedomain.com -d admin.yourcollegedomain.com
```

### Option B: Deploy on Railway (Simpler)

1. Push code to GitHub
2. Create new project on [railway.app](https://railway.app)
3. Connect GitHub repo
4. Add environment variables in Railway dashboard
5. Railway auto-deploys on push

---

## 📱 Build APK for Android {#apk}

### Setup EAS Build

```bash
cd mobile-app

# Login to Expo
npx expo login

# Configure EAS
eas build:configure

# Update eas.json
```

### `eas.json` configuration:
```json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "android": { "buildType": "aab" }
    }
  }
}
```

### Build Commands

```bash
# Build development APK (for testing)
eas build -p android --profile preview

# Build production AAB (for Google Play Store)
eas build -p android --profile production

# Download the APK/AAB from the URL shown after build
```

### Local Build (without EAS)

```bash
# Install Java JDK 17
sudo apt install openjdk-17-jdk

# Prebuild native project
npx expo prebuild --platform android

# Build APK
cd android
./gradlew assembleRelease

# APK location: android/app/build/outputs/apk/release/app-release.apk
```

---

## 🔒 Security Checklist

- [ ] Change default admin password after first login
- [ ] Use HTTPS in production (Certbot/SSL)
- [ ] Store `.env` securely, never commit to Git
- [ ] Set `NODE_ENV=production` on server
- [ ] Enable MongoDB Atlas network access restrictions
- [ ] Use strong JWT_SECRET (64+ chars, random)
- [ ] Set up Cloudinary upload restrictions

---

## 📞 Support

For issues related to setup, open a GitHub issue or contact the development team.

**Ashoka Women's College News App**  
Built with ❤️ for the college community
