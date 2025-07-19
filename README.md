# WritelikeYou.ai - MongoDB Authentication Setup

A full-stack application with MongoDB authentication system for WritelikeYou.ai.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)

### Backend Setup

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/writelikeyou
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   ```bash
   cp src/.env.example .env
   ```
   
   Update `.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_NODE_ENV=development
   ```

3. **Start the frontend:**
   ```bash
   npm run dev
   ```

### Run Both (Recommended)
```bash
npm run dev:full
```

## 🔐 Authentication Features

### User Model
- **Email/Password authentication**
- **Subscription management** (beta_free, trial, paid, expired)
- **Beta access** until December 9, 2025
- **Cohort tracking** (week/month)
- **Registration source** tracking
- **Stripe integration** ready

### API Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `GET /api/auth/subscription-status` - Check subscription

### Security Features
- **JWT authentication**
- **Password hashing** with bcrypt
- **Rate limiting**
- **CORS protection**
- **Input validation**
- **Helmet security headers**

## 📊 Database Schema

```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  subscriptionStatus: Enum ['beta_free', 'trial', 'paid', 'expired'],
  betaExpiresAt: Date (default: 2025-12-09),
  cohortWeek: String (format: '2024-W32'),
  cohortMonth: String (format: '2024-08'),
  registrationSource: Enum ['direct', 'referral', 'social', 'waitlist'],
  stripeCustomerId: String (nullable),
  createdAt: Date,
  updatedAt: Date
}
```

## 🛡️ Subscription Middleware

The system includes automatic subscription checking:
- **Beta users**: Access until December 9, 2025
- **Trial/Paid users**: Full access
- **Expired users**: Blocked with upgrade prompt

## 🔧 Configuration

### MongoDB Connection
- **Local**: `mongodb://localhost:27017/writelikeyou`
- **Atlas**: `mongodb+srv://username:password@cluster.mongodb.net/writelikeyou`

### JWT Configuration
Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 📝 Usage Examples

### Sign Up
```javascript
const { data, error } = await signUp(
  'user@example.com',
  'password123',
  { registration_source: 'direct' }
);
```

### Sign In
```javascript
const { data, error } = await signIn('user@example.com', 'password123');
```

### Check Subscription
```javascript
const hasAccess = checkSubscriptionAccess();
const message = getSubscriptionMessage();
```

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Deploy to your preferred platform (Heroku, Railway, etc.)
3. Update FRONTEND_URL in production

### Frontend Deployment
1. Update VITE_API_URL to production backend URL
2. Build and deploy to Netlify, Vercel, etc.

## 🔍 Monitoring

The system includes:
- **Health check endpoint**: `GET /api/health`
- **Error logging**
- **Request rate limiting**
- **Authentication middleware**

## 📈 Analytics Ready

User model includes fields for:
- **Cohort analysis** (week/month tracking)
- **Registration source** attribution
- **Subscription lifecycle** tracking
- **Stripe integration** preparation

---

Your MongoDB-powered authentication system is ready! 🎉