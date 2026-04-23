/**
 * Architecture Overview
 */

# SokoNet Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Mobile & Web Clients                       │
├──────────────────┬──────────────────┬──────────────────┐
│  React Web App   │  React Native    │  USSD Gateway    │
│  (Browser)       │  (iOS/Android)   │  (SMS Menus)     │
└────────┬─────────┴────────┬─────────┴────────┬─────────┘
         │                  │                   │
         └──────────────────┼───────────────────┘
                     │
         ┌───────────┴────────────┐
         │   Socket.IO / HTTP     │
         │   (Real-time & REST)   │
         └───────────┬────────────┘
                     │
    ┌────────────────▼────────────────┐
    │    Express.js API Server        │
    │  (Node.js Backend - Port 5000)  │
    ├─────────────────────────────────┤
    │  Routes & Controllers           │
    │  - /api/users                   │
    │  - /api/jobs                    │
    │  - /api/bids                    │
    │  - /api/payments                │
    │  - /api/ratings                 │
    │  - /api/location                │
    │  - /api/ussd                    │
    └────────┬────────────────────────┘
             │
    ┌────────┴────────────┬──────────────┬──────────────┐
    │                     │              │              │
    ▼                     ▼              ▼              ▼
┌─────────┐        ┌─────────┐    ┌─────────┐    ┌────────┐
│ MongoDB │        │  Redis  │    │ Google  │    │ Twilio │
│ Database│        │  Cache  │    │  Maps   │    │  SMS   │
└─────────┘        └─────────┘    └─────────┘    └────────┘
```

## Service Layer Architecture

```
┌──────────────────────────────────────────┐
│         Business Logic Services           │
├──────────────────────────────────────────┤
│
│  ┌─ JobConversionEngine ──────┐
│  │ • Auto-categorize searches │
│  │ • Generate dynamic prices  │
│  │ • Create job postings      │
│  └────────────────────────────┘
│
│  ┌─ SkillMatchingService ─────┐
│  │ • Match skills → jobs      │
│  │ • Suggest learning paths   │
│  │ • Calculate match %        │
│  └────────────────────────────┘
│
│  ┌─ LocationService ──────────┐
│  │ • Geospatial queries       │
│  │ • Nearby worker/job search │
│  │ • Demand hotspots         │
│  │ • Supplier linking         │
│  └────────────────────────────┘
│
│  ┌─ PaymentService ───────────┐
│  │ • Escrow management        │
│  │ • Milestone releases       │
│  │ • M-Pesa simulation        │
│  │ • Service credits          │
│  └────────────────────────────┘
│
│  ┌─ DisputeResolutionService ─┐
│  │ • Open disputes            │
│  │ • Collect votes            │
│  │ • Auto-resolve             │
│  │ • Admin override           │
│  └────────────────────────────┘
│
│  ┌─ USSDService ──────────────┐
│  │ • USSD menu navigation     │
│  │ • SMS job alerts           │
│  │ • Offline registration     │
│  └────────────────────────────┘
│
└──────────────────────────────────────────┘
```

## Data Model Relationships

```
User (Customer/Worker)
├─ skills: [Skill]
├─ trustCircles: [TrustCircle]
├─ escrowBalance: Number
├─ serviceCredits: [ServiceCredit]
└─ ratings: [Rating]

Job
├─ customerId: User
├─ acceptedWorkerId: Worker
├─ bids: [Bid]
├─ escrow: Escrow
├─ ratings: [Rating]
└─ statusHistory: [StatusChange]

Bid
├─ jobId: Job
├─ workerId: Worker
├─ status: pending|accepted|rejected|withdrawn
└─ timestamp: Date

Escrow
├─ jobId: Job
├─ customerId: Customer
├─ workerId: Worker
├─ milestones: [Milestone]
├─ isDisputed: Boolean
└─ dispute: Dispute

ServiceCredit
├─ userId: User
├─ jobId: Job
├─ paymentSchedule: [Installment]
└─ status: issued|partial|paid
```

## Real-Time Communication (Socket.IO)

```
Client Connections
│
├─ Worker joins location room
│  └─ "worker:join-location" 
│     Room: location:nairobi
│
├─ Customer posts job
│  └─ "job:posted"
│     Broadcast: location room
│
├─ Worker places bid
│  └─ "bid:placed"
│     Broadcast: job room
│
├─ Bid accepted
│  └─ "bid:accepted"
│     To: specific worker
│
├─ Job progress update
│  └─ "job:progress"
│     Broadcast: job room
│
├─ Payment milestone
│  └─ "payment:milestone-reached"
│     To: worker
│
└─ Rating received
   └─ "rating:submitted"
      To: worker
```

## Authentication Flow

```
1. User enters phone
   POST /api/users/send-otp
   │
   ├─ Generate OTP
   ├─ Store with 10min expiry
   └─ Send via Twilio SMS
   
2. User receives SMS
   │
   └─ Enters OTP
   
3. Verify OTP
   POST /api/users/verify-otp
   │
   ├─ Check validity & expiry
   ├─ Generate JWT token
   ├─ Store token client-side
   └─ Return user profile
   
4. Subsequent Requests
   GET /api/users/profile
   Header: Authorization: Bearer {token}
   │
   ├─ Verify JWT
   ├─ Extract userId
   └─ Process request
```

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│       Production Deployment              │
├─────────────────────────────────────────┤
│
│  Web Client                  Mobile App
│  (Vercel/Netlify)            (App Store)
│      │                           │
│      └───────────┬───────────────┘
│                  │
│          ┌───────▼────────┐
│          │  API Gateway   │
│          │ (Cloudflare)   │
│          └───────┬────────┘
│                  │
│      ┌───────────┼───────────┐
│      │           │           │
│      ▼           ▼           ▼
│  ┌─────────┐ ┌─────────┐ ┌─────────┐
│  │ Heroku  │ │ Railway │ │ AWS ECS │
│  │ Backend │ │ Backend │ │ Backend │
│  └─────────┘ └─────────┘ └─────────┘
│      │           │           │
│      └───────────┼───────────┘
│                  │
│  ┌───────────────▼──────────────┐
│  │  MongoDB Atlas (Cloud DB)    │
│  │  Redis Cloud (Cache)         │
│  └──────────────────────────────┘
└─────────────────────────────────────────┘
```

## Security Layers

```
1. Input Validation
   - Express validator middleware
   - Schema validation with Joi
   - Sanitization

2. Authentication
   - Phone OTP verification
   - JWT token validation
   - Token refresh mechanism

3. Authorization
   - Role-based access control
   - Resource ownership checks
   - Rate limiting

4. Data Protection
   - Encrypted passwords (bcrypt)
   - HTTPS/TLS encryption
   - CORS policy

5. Payment Security
   - Escrow holds funds
   - Milestone verification
   - Dispute resolution
```

## Scalability Considerations

```
1. Database
   - MongoDB sharding for large datasets
   - Indexed queries for performance
   - Read replicas for load distribution

2. API Server
   - Horizontal scaling with load balancer
   - PM2 for process management
   - Connection pooling

3. Real-Time Updates
   - Redis pub/sub for inter-server messaging
   - Socket.IO adapter for multiple servers
   - Message queuing (Bull/RabbitMQ)

4. Caching
   - Redis for session caching
   - Location data caching
   - Rating aggregation caching

5. File Storage
   - Cloudinary for image storage
   - CDN distribution
   - Lazy loading on frontend
```

## Performance Metrics

- **API Response Time**: < 200ms (p95)
- **Real-Time Message Latency**: < 100ms
- **Database Query Time**: < 50ms (p95)
- **Page Load Time**: < 2s (web)
- **App Load Time**: < 1s (mobile)

## Monitoring & Analytics

```
Logging
├─ Request/Response logs
├─ Error tracking (Sentry)
├─ Performance monitoring (New Relic)
└─ Database query logs

Metrics
├─ Active users
├─ Job completion rate
├─ Average bid time
├─ Payment success rate
└─ System uptime

Alerts
├─ High error rate (> 5%)
├─ Slow API response (> 500ms)
├─ Database connection issues
├─ Out of memory
└─ Disk space low
```
