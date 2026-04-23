# SokoNet - Full-Stack Real-Time Marketplace Platform

A comprehensive mobile and web application that connects customers with service providers and businesses in real-time.

## 🚀 Features

### Core Features
- **Instant Job Conversion Engine** - Automatically convert service searches into live job postings
- **Real-Time Bidding** - Workers can bid on jobs instantly with live updates
- **Smart Escrow System** - Milestone-based payment releases for security
- **Location-Based Matching** - Find nearby jobs/workers using geolocation
- **Skill Verification** - Upload proof and get community endorsements
- **Trust Circles** - Create and join trusted groups with priority matching
- **Dynamic Pricing Engine** - AI-suggested prices based on demand and location
- **Work Now, Pay Later** - Service credit system with deferred payments
- **Live Work Tracking** - Real-time job progress updates (0-100%)
- **Community Dispute Resolution** - Fair resolution through community voting
- **USSD Simulation** - Support for offline users via SMS menus
- **Micro-Franchise Module** - Pre-built business templates (milk delivery, etc.)

### Advanced Features
- **Smart Escrow Milestones** - Hold & release payments (start: 30%, mid: 30%, complete: 40%)
- **Income Dashboard** - Daily earnings, analytics, and projections
- **Local Supply Linking** - Suggest nearby suppliers for job materials
- **Demand Hotspots** - Show high-demand areas and job density
- **Offline Capability** - USSD menu system for feature phones

## 📁 Project Structure

```
SokoNet-full/
├── backend/                      # Node.js + Express Backend
│   ├── src/
│   │   ├── index.js             # Main server entry point
│   │   ├── models/              # MongoDB schemas
│   │   │   ├── User.js
│   │   │   ├── Job.js
│   │   │   ├── Bid.js
│   │   │   ├── Escrow.js
│   │   │   ├── Rating.js
│   │   │   ├── Skill.js
│   │   │   ├── TrustCircle.js
│   │   │   ├── Franchise.js
│   │   │   └── ServiceCredit.js
│   │   ├── controllers/         # Request handlers
│   │   │   ├── userController.js
│   │   │   ├── jobController.js
│   │   │   ├── bidController.js
│   │   │   ├── paymentController.js
│   │   │   ├── ratingController.js
│   │   │   └── ussdController.js
│   │   ├── services/            # Business logic
│   │   │   ├── JobConversionEngine.js
│   │   │   ├── SkillMatchingService.js
│   │   │   ├── LocationService.js
│   │   │   ├── PaymentService.js
│   │   │   ├── USSDService.js
│   │   │   └── DisputeResolutionService.js
│   │   ├── routes/              # API endpoints
│   │   │   ├── users.js
│   │   │   ├── jobs.js
│   │   │   ├── bids.js
│   │   │   ├── payments.js
│   │   │   ├── ratings.js
│   │   │   ├── ussd.js
│   │   │   ├── location.js
│   │   │   ├── trustCircles.js
│   │   │   ├── skills.js
│   │   │   ├── franchises.js
│   │   │   ├── dashboard.js
│   │   │   └── escrow.js
│   │   ├── middleware/          # Auth & error handling
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   ├── workers/             # Background jobs
│   │   │   └── socketHandlers.js
│   │   └── config/              # Configuration
│   ├── package.json
│   └── .env.example
│
├── web/                         # React Web Frontend
│   ├── src/
│   │   ├── index.js            # App entry & routing
│   │   ├── index.css           # Tailwind styles
│   │   ├── pages/
│   │   │   ├── auth/           # Login & OTP pages
│   │   │   ├── customer/       # Customer dashboards
│   │   │   └── worker/         # Worker dashboards
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── services/           # API client services
│   │   └── context/
│   │       └── AuthContext.jsx
│   ├── package.json
│   └── .env.example
│
├── mobile/                      # React Native Mobile App
│   ├── App.js                  # App entry & navigation
│   ├── src/
│   │   ├── screens/
│   │   │   ├── auth/           # Login & OTP screens
│   │   │   ├── customer/       # Customer screens
│   │   │   ├── worker/         # Worker screens
│   │   │   └── shared/         # Profile, ratings, etc
│   │   ├── services/           # API client services
│   │   ├── context/            # Auth context
│   │   └── components/         # Reusable components
│   ├── package.json
│   └── .env.example
│
└── README.md                    # This file
```

## 🔧 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Real-Time**: Socket.IO
- **Authentication**: JWT + Phone OTP
- **Payment**: M-Pesa (simulated)
- **Maps**: Google Maps API
- **File Upload**: Cloudinary
- **Queue**: Bull + Redis

### Web Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **State**: Context API + Zustand
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Real-Time**: Socket.IO Client
- **Icons**: React Icons

### Mobile Frontend
- **Framework**: React Native
- **Navigation**: React Navigation (Stack + Tabs)
- **Geolocation**: React Native Geolocation Service
- **Maps**: React Native Maps
- **Storage**: AsyncStorage
- **HTTP Client**: Axios
- **Real-Time**: Socket.IO Client
- **Styling**: React Native StyleSheet

## ⚡ Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB (local or Atlas)
- Redis (optional, for caching)
- Android Studio/Xcode (for mobile)

### Backend Setup

```bash
cd SokoNet-full/backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Fill in .env with your configurations
# - MONGODB_URI=mongodb://localhost:27017/sokonet
# - JWT_SECRET=your_secret_key
# - TWILIO credentials for SMS
# - Google Maps API key
# - Cloudinary credentials

# Start development server
npm run dev

# Server runs on http://localhost:5000
```

### Web Frontend Setup

```bash
cd SokoNet-full/web

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Fill in .env
# REACT_APP_API_URL=http://localhost:5000/api
# REACT_APP_SOCKET_URL=http://localhost:5000

# Start dev server
npm start

# App runs on http://localhost:3000
```

### Mobile Setup (Android)

```bash
cd SokoNet-full/mobile

# Install dependencies
npm install

# Start Metro bundler
npm start

# In another terminal, run on Android
npm run android
```

### Mobile Setup (iOS)

```bash
cd SokoNet-full/mobile

# Install pods
cd ios && pod install && cd ..

# Start Metro bundler
npm start

# In another terminal, run on iOS
npm run ios
```

## 📱 API Endpoints

### User Routes
```
POST   /api/users/send-otp              - Send OTP to phone
POST   /api/users/verify-otp            - Verify OTP and login
GET    /api/users/profile               - Get user profile
PUT    /api/users/profile               - Update profile
PUT    /api/users/location              - Update location
GET    /api/users/stats                 - Get worker stats
POST   /api/users/withdraw              - Withdraw earnings
```

### Job Routes
```
POST   /api/jobs                        - Create job
GET    /api/jobs/nearby                 - Get nearby jobs
GET    /api/jobs/search                 - Search jobs
GET    /api/jobs/my-jobs                - Get user's jobs
GET    /api/jobs/opportunities          - Get income opportunities
GET    /api/jobs/details/:jobId         - Get job details
PUT    /api/jobs/:jobId/status          - Update job status
```

### Bid Routes
```
POST   /api/bids                        - Place bid
GET    /api/bids/:jobId                 - Get job bids
GET    /api/bids/my-bids                - Get my bids
PUT    /api/bids/:bidId/accept          - Accept bid
PUT    /api/bids/:bidId/reject          - Reject bid
```

### Payment Routes
```
POST   /api/payments/escrow             - Create escrow
GET    /api/payments/escrow/:escrowId   - Get escrow details
POST   /api/payments/mpesa              - Process M-Pesa payment
POST   /api/payments/escrow/:jobId/milestone-release - Release milestone
POST   /api/payments/service-credit     - Issue service credit
```

### Rating Routes
```
POST   /api/ratings                     - Submit rating
GET    /api/ratings/:userId             - Get user ratings
GET    /api/ratings                     - Get my ratings
PUT    /api/ratings/:ratingId/flag      - Flag rating
```

### Location Routes
```
GET    /api/location/jobs               - Get nearby jobs
GET    /api/location/workers            - Get nearby workers
GET    /api/location/hotspots           - Get demand hotspots
GET    /api/location/suppliers          - Get nearby suppliers
```

### USSD Routes
```
POST   /api/ussd/request                - Handle USSD request
POST   /api/ussd/register               - USSD registration
POST   /api/ussd/send-alert/:jobId      - Send job alert SMS
```

## 🔐 Authentication Flow

1. **Phone Entry**: User enters phone number
2. **OTP Generation**: System generates 6-digit OTP
3. **SMS Delivery**: OTP sent via Twilio
4. **OTP Verification**: User enters OTP
5. **Token Generation**: JWT token created
6. **Session Management**: Token stored in localStorage (web) / AsyncStorage (mobile)

## 💳 Payment Flow

### Escrow Payment
1. Customer posts job with budget
2. Worker bids on job
3. Customer accepts bid
4. Customer funds escrow account
5. System holds payment in milestones:
   - 30% released when work starts
   - 30% released at 50% completion
   - 40% released on job completion
6. Worker withdraws to bank account

### Service Credit
1. Customer requests deferred payment
2. System issues credit (max: credit limit)
3. Monthly installments scheduled
4. Customer pays installments
5. Credit marked as paid when complete

## 🔄 Real-Time Features (Socket.IO)

- **Job Notifications**: New jobs near worker broadcast in real-time
- **Bid Updates**: Live bid count and top bid for job
- **Job Progress**: Real-time progress updates (0-100%)
- **Payment Milestones**: Instant notification when payment released
- **Ratings Received**: Live rating notifications
- **Typing Indicators**: Live chat typing status

## 📊 Data Models

### User
- Phone, profile info, location
- Worker skills, availability, bank details
- Business info (for business accounts)
- Ratings, trust score, earnings

### Job
- Title, category, location, budget
- Requirements, status history
- Bids, accepted worker
- Progress tracking, milestones
- Rating/review from both parties

### Escrow
- Job reference, customer, worker
- Amount, platform fee
- Milestones with release conditions
- Status tracking (pending→funded→completed)
- Dispute flag

### ServiceCredit
- User credit balance, limit
- Payment schedule (installments)
- Due dates and interest

## 🏗️ Deployment

### Backend (Heroku/Railway)
```bash
git push heroku main
```

### Web (Vercel/Netlify)
```bash
npm run build
# Deploy build folder
```

### Mobile (App Store/Play Store)
```bash
# Android
cd android && ./gradlew assembleRelease

# iOS
cd ios && xcodebuild -scheme SokoNet -configuration Release
```

## 🐛 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Integration Tests
```bash
npm run test:integration
```

## 📝 Key Features Implementation Details

### Job Conversion Engine
- Analyzes service search query
- Auto-categorizes based on keywords
- Calculates dynamic price
- Notifies nearby workers via Socket.IO
- Stores job for bidding

### Skill Matching
- Matches user skills with job requirements
- Calculates match percentage
- Suggests in-demand skills to learn
- Prioritizes high-rating workers

### Location Intelligence
- Geospatial queries with MongoDB
- Real-time distance calculations
- Demand hotspot identification
- Supply chain suggestions

### Dispute Resolution
- Community voting system
- Majority-based resolution
- Admin override capability
- Payment adjustment logic

### USSD Menu
- Hierarchical menu navigation
- SMS-based interaction
- Job alerts via SMS
- Balance checking
- Bid management

## 🚀 Future Enhancements

1. **AI/ML Integration**
   - Price optimization using historical data
   - Fraud detection
   - Worker recommendation engine

2. **Payment Gateway Integration**
   - Real M-Pesa integration
   - Card payments
   - Cryptocurrency support

3. **Video Verification**
   - Live video calls for complex jobs
   - Work progress video tracking

4. **Advanced Analytics**
   - Earnings projections
   - Market trends
   - Performance benchmarks

5. **Internationalization**
   - Multi-language support
   - Multi-currency support

6. **Insurance**
   - Job protection insurance
   - Worker insurance plans

## 📞 Support

For issues or questions:
- Create GitHub issue
- Contact: support@sokonet.app
- WhatsApp: [Support Number]

## 📄 License

MIT License - See LICENSE file

---

**Built with ❤️ for the African gig economy**
