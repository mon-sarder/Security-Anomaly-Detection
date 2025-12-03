# Security Anomaly Detection System - Frontend

React TypeScript frontend application for the Security Anomaly Detection System.

## 🚀 Features

- **Authentication**: Login and registration with JWT tokens
- **Real-time Dashboard**: Monitor login activities and security metrics
- **Login Events**: View and filter all login attempts
- **Alert Management**: Track and resolve security alerts
- **Interactive Charts**: Visualize activity timelines
- **Risk Scoring**: Visual indicators for risk levels
- **Responsive Design**: Works on desktop and mobile

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router 6** - Client-side routing
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **CSS Modules** - Scoped styling

## 📋 Prerequisites

- Node.js 18+ and npm
- Backend API running on port 5000

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_API_TIMEOUT=10000
REACT_APP_REFRESH_INTERVAL=30000
```

### 3. Start Development Server

```bash
npm start
```

The app will be available at `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── public/
│   └── index.html              # HTML template
├── src/
│   ├── components/             # React components
│   │   ├── Auth/              # Login & Register
│   │   ├── Dashboard/         # Dashboard components
│   │   ├── Layout/            # Layout components
│   │   ├── LoginAnalysis/     # Login events
│   │   └── common/            # Reusable components
│   ├── context/               # React context
│   │   └── AuthContext.tsx    # Authentication state
│   ├── hooks/                 # Custom hooks
│   │   ├── useAuth.ts         # Auth hook
│   │   └── useApi.ts          # API hook
│   ├── services/              # API services
│   │   ├── api.ts             # Base API client
│   │   ├── authService.ts     # Auth endpoints
│   │   ├── loginService.ts    # Login endpoints
│   │   └── dashboardService.ts # Dashboard endpoints
│   ├── types/                 # TypeScript types
│   │   ├── auth.types.ts
│   │   ├── login.types.ts
│   │   └── dashboard.types.ts
│   ├── utils/                 # Utility functions
│   │   ├── formatters.ts      # Data formatters
│   │   └── constants.ts       # App constants
│   ├── App.tsx                # Main App component
│   ├── App.css                # Global styles
│   ├── index.tsx              # Entry point
│   └── index.css              # Base styles
├── package.json
├── tsconfig.json
└── README.md
```

## 🧪 Available Scripts

### `npm start`
Runs the app in development mode on `http://localhost:3000`

### `npm test`
Launches the test runner in interactive watch mode

### `npm run build`
Builds the app for production to the `build` folder

### `npm run lint`
Runs ESLint to check code quality

## 🎨 Key Components

### Authentication
- **Login** (`src/components/Auth/Login.tsx`) - User login form
- **Register** (`src/components/Auth/Register.tsx`) - User registration form
- **AuthContext** (`src/context/AuthContext.tsx`) - Global auth state

### Dashboard
- **Dashboard** (`src/components/Dashboard/Dashboard.tsx`) - Main dashboard
- **MetricsCards** - Display key statistics
- **AlertFeed** - Show recent security alerts
- **ActivityTimeline** - Visualize login activity
- **TopRisksTable** - Display high-risk users

### Login Analysis
- **LoginEventsList** - View all login events
- **LoginEventDetails** - Modal with event details
- **RiskScoreBadge** - Visual risk score indicator

### Layout
- **Layout** - Main layout wrapper
- **Navbar** - Top navigation bar
- **Sidebar** - Side navigation menu

## 🔐 Authentication Flow

1. User submits login form
2. Frontend sends credentials to `/api/auth/login`
3. Backend returns JWT token and user info
4. Token stored in localStorage
5. Token added to all subsequent API requests
6. Protected routes check auth status

## 📊 Dashboard Features

### Metrics Cards
- Total Logins
- Anomalous Logins
- Active Alerts
- High Risk Logins
- Average Risk Score

### Activity Timeline
- Interactive chart showing login activity over time
- Separate lines for total and anomalous logins
- Hover tooltips for detailed information

### Alert Feed
- Real-time security alerts
- Color-coded by severity
- One-click resolution
- Shows user, IP, location

### Top Risks Table
- Users sorted by risk score
- Shows max and average risk
- Anomaly count
- Color-coded status

## 🎯 API Integration

The frontend communicates with the backend API:

### Auth Endpoints
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verify token

### Dashboard Endpoints
- `GET /api/dashboard/stats` - Get statistics
- `GET /api/dashboard/alerts` - Get alerts
- `PUT /api/dashboard/alerts/:id` - Update alert
- `GET /api/dashboard/timeline` - Get activity timeline
- `GET /api/dashboard/top-risks` - Get high-risk users

### Login Endpoints
- `POST /api/login/analyze` - Analyze login
- `GET /api/login/events` - Get login events
- `GET /api/login/events/:id` - Get specific event

## 🎨 Styling

- **CSS Modules** for component-scoped styles
- **Global styles** in `index.css`
- **Responsive design** with media queries
- **Color scheme**:
  - Primary: #3b82f6 (blue)
  - Success: #10b981 (green)
  - Warning: #f59e0b (amber)
  - Danger: #ef4444 (red)
  - Gray scale: #1f2937 to #f9fafb

## 🐳 Docker Deployment

### Build Docker Image

```bash
docker build -t security-frontend .
```

### Run Container

```bash
docker run -d \
  -p 3000:80 \
  --name security-frontend \
  security-frontend
```

### With Docker Compose

```bash
# From project root
docker-compose up -d
```

## 🚦 Development Tips

### Hot Reload
The dev server supports hot module replacement. Changes are reflected instantly.

### TypeScript
- All components are type-safe
- Use interfaces for props
- Import types from `src/types/`

### State Management
- Use Context API for global state (auth)
- Local state for component-specific data
- Custom hooks for reusable logic

### API Calls
```typescript
import { loginService } from '../services/loginService';

// Use the service
const events = await loginService.getLoginEvents({ limit: 50 });
```

### Formatting Utilities
```typescript
import { formatDate, formatRiskScore, getRiskLevel } from '../utils/formatters';

const date = formatDate(timestamp);
const risk = formatRiskScore(0.75); // "75.0%"
const level = getRiskLevel(0.75); // "high"
```

## 🐛 Troubleshooting

### CORS Errors
Ensure backend has CORS enabled for `http://localhost:3000`

### API Connection Failed
- Check backend is running on port 5000
- Verify `REACT_APP_API_URL` in `.env`
- Check browser console for errors

### 401 Unauthorized
- Token may be expired
- Try logging out and logging back in
- Check token in localStorage

### Blank Screen
- Check browser console for errors
- Run `npm install` to ensure dependencies are installed
- Clear browser cache

## 📝 Code Style

- Use functional components with hooks
- TypeScript for all files
- Props interfaces for components
- Async/await for promises
- Early returns for better readability

## 🔄 State Updates

Components automatically refresh data:
- Dashboard: Every 30 seconds
- Manual refresh button available
- Real-time updates via polling

## 🌐 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📞 Support

If you encounter issues:
1. Check browser console
2. Verify API is running
3. Check network tab in dev tools
4. Review this README

## 🙏 Acknowledgments

- React team for the amazing framework
- Recharts for data visualization
- Cal Poly Pomona CS Department

---

**Built with ❤️ by Mon - Cal Poly Pomona CS Student**