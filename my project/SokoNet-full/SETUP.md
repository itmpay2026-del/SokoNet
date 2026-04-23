/**
 * Project Setup Instructions
 */

# SokoNet Installation & Setup Guide

## Prerequisites
- Node.js 16+ (LTS recommended)
- MongoDB 4.4+ (local or MongoDB Atlas cloud)
- npm or yarn
- Git

## Step 1: Backend Setup

### 1.1 Install Dependencies
```bash
cd SokoNet-full/backend
npm install
```

### 1.2 Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and configure:
```
MONGODB_URI=mongodb://localhost:27017/sokonet
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secure_secret_key_here
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
GOOGLE_MAPS_API_KEY=your_google_maps_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 1.3 Start Backend
```bash
# Development mode (with auto-reload)
npm run dev

# Or production mode
npm start
```

Server will start on http://localhost:5000

## Step 2: Web Frontend Setup

### 2.1 Install Dependencies
```bash
cd ../web
npm install
```

### 2.2 Configure Environment
```bash
cp .env.example .env
```

Edit `.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 2.3 Start Web App
```bash
npm start
```

App will open at http://localhost:3000

## Step 3: Mobile Frontend Setup (Android)

### 3.1 Install Dependencies
```bash
cd ../mobile
npm install
```

### 3.2 Configure Android SDK
Ensure Android SDK is installed and ANDROID_HOME is set.

### 3.3 Start Metro Bundler
```bash
npm start
```

### 3.4 In new terminal, run on Android
```bash
npm run android
```

## Step 4: Mobile Frontend Setup (iOS)

### 4.1 Install Pods
```bash
cd mobile/ios
pod install
cd ../..
```

### 4.2 Start Metro Bundler
```bash
npm start
```

### 4.3 Run on iOS Simulator
```bash
npm run ios
```

## MongoDB Setup (Local)

### Using Docker (Recommended)
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Manual Installation
1. Download from: https://www.mongodb.com/try/download/community
2. Install following platform-specific instructions
3. Start mongod service

### Create Database
```bash
mongo
> use sokonet
> db.createCollection("users")
```

## Testing the Application

### 1. Test Phone Authentication
- Go to http://localhost:3000/login
- Enter phone: +254700123456 (or any valid format)
- OTP will be logged in backend console
- Enter OTP to complete authentication

### 2. Test Job Creation (Customer)
- Login as customer
- Navigate to /customer/create-job
- Fill form and submit
- Job appears in database

### 3. Test Real-Time Updates
- Open app in two browsers/devices
- Post a job in one browser
- See it appear in "nearby jobs" in another browser
- Test bidding, progress updates

### 4. Test Payments
- Create job with budget
- Get bid from worker
- Accept bid
- Create escrow payment
- Release milestones

## Common Issues

### MongoDB Connection Error
```
Solution: Ensure MongoDB is running
# Check if mongod service is active
```

### Port Already in Use
```
Solution: Change port in .env or kill process
# Kill on port 5000
lsof -ti :5000 | xargs kill -9
```

### Missing Dependencies
```
Solution: Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### Socket.IO Connection Issues
```
Solution: Check CORS settings in backend/src/index.js
Ensure frontend URL is in SOCKET_IO_CORS_ORIGIN
```

## API Documentation

Full API docs available at: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)

### Test Endpoints with cURL

```bash
# Send OTP
curl -X POST http://localhost:5000/api/users/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"+254700123456"}'

# Verify OTP
curl -X POST http://localhost:5000/api/users/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"+254700123456","otp":"123456"}'
```

## Next Steps

1. **Customize Business Logic** - Modify services for your specific requirements
2. **Add More Pages** - Implement remaining customer/worker screens
3. **Setup Payment Gateway** - Integrate with real M-Pesa
4. **Configure Notifications** - Setup email/push notifications
5. **Deploy to Production** - Setup on Heroku, Vercel, App Store, Play Store

## Documentation

- [Backend Architecture](./backend/README.md)
- [Web Frontend Guide](./web/README.md)
- [Mobile Guide](./mobile/README.md)
- [API Reference](./API.md)

## Support

For issues: support@sokonet.app
