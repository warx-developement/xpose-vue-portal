# Vulnerability Management System (VMS) Frontend

A modern, responsive vulnerability management system built with React, TypeScript, and Vite. This application provides a comprehensive interface for managing security vulnerabilities, reports, and security assessments.

## 🚀 Tech Stack

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Server State & Caching**: TanStack Query (React Query)
- **HTTP Client**: Axios with auth interceptor
- **Routing**: React Router v6
- **UI Framework**: Tailwind CSS + shadcn/ui (Radix primitives)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React

## 🎨 Design System

The application uses a security-focused dark theme with:
- **Primary Colors**: Blue/purple gradient for primary actions
- **Security Status Colors**: Critical (red), High (orange), Medium (yellow), Low (green), Info (blue)
- **Professional Typography**: Clean, readable fonts with proper hierarchy
- **Responsive Design**: Mobile-first approach with WCAG AA accessibility
- **Smooth Animations**: Subtle transitions and loading states

## ✨ Features Implemented

### Authentication System
- ✅ **Login**: Email/password authentication with validation
- ✅ **Logout**: Secure logout with token cleanup
- ✅ **Forgot Password**: Email-based password reset
- ✅ **Reset Password**: Token-based password reset with confirmation
- ✅ **Protected Routes**: Automatic redirect for unauthenticated users

### Dashboard
- ✅ **Overview Cards**: Reports count, vulnerabilities, critical issues, resolved issues
- ✅ **Recent Activity**: Real-time activity feed with icons and timestamps
- ✅ **Statistics**: Visual representation of security metrics
- ✅ **Responsive Layout**: Optimized for desktop and mobile

### Infrastructure
- ✅ **API Integration**: Axios with Bearer token authentication
- ✅ **State Management**: Zustand stores for auth and app state
- ✅ **Data Fetching**: TanStack Query for server state management
- ✅ **Form Validation**: Zod schemas with React Hook Form
- ✅ **Error Handling**: Toast notifications for user feedback
- ✅ **Loading States**: Skeleton components and loading indicators

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Access to the WhyXpose API v2

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vms-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:8080
   ```

### Test Credentials

Use these test credentials to login:
- **Email**: john.smith@techcorp.com
- **Password**: password123

## 🔧 Configuration

### API Configuration

The application is configured to connect to the WhyXpose API v2:
- **Base URL**: `http://demoapi.whyxpose.com/api/v2`
- **Authentication**: Bearer JWT tokens
- **Company Scoping**: X-Company-ID header for multi-tenant support

### Environment Variables

Currently, the API URL is hardcoded. For production, you would typically use:

```bash
VITE_API_BASE_URL=http://demoapi.whyxpose.com/api/v2
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication forms
│   ├── dashboard/      # Dashboard widgets
│   ├── layout/         # Layout components
│   └── ui/             # shadcn/ui components
├── hooks/              # Custom hooks
│   ├── useAuth.ts      # Authentication hooks
│   ├── useDashboard.ts # Dashboard data hooks
│   └── use-toast.ts    # Toast notification hook
├── lib/                # Utilities and configurations
│   ├── api.ts          # API client and endpoints
│   └── utils.ts        # Helper functions
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   └── Dashboard.tsx   # Main dashboard page
├── stores/             # Zustand stores
│   └── authStore.ts    # Authentication state
└── main.tsx            # Application entry point
```

## 🎯 API Integration

The application integrates with the following WhyXpose API v2 endpoints:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token

### Dashboard
- `GET /dashboard` - Dashboard overview data
- `GET /dashboard/notifications` - User notifications
- `POST /dashboard/notifications/{id}/read` - Mark notification as read
- `POST /dashboard/notifications/read-all` - Mark all notifications as read
- `GET /dashboard/analytics` - Analytics data

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Auto Token Refresh**: Automatic handling of expired tokens
- **Protected Routes**: Route-level authentication guards
- **Secure Storage**: Tokens stored in localStorage with cleanup on logout
- **Request Interception**: Automatic token attachment to API requests
- **Error Handling**: Graceful handling of authentication errors

## 🎨 UI/UX Features

- **Dark Theme**: Security-focused professional dark theme
- **Responsive Design**: Mobile-first responsive layout
- **Loading States**: Skeleton loaders and loading indicators
- **Error States**: User-friendly error messages
- **Toast Notifications**: Success/error feedback
- **Smooth Animations**: Professional transitions and hover effects
- **Accessibility**: WCAG AA compliant design

## 🚀 Deployment

The application is ready for deployment to any static hosting service:

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

The build artifacts will be in the `dist/` directory.

## 🔮 Future Enhancements

The current implementation focuses on authentication and dashboard. Future versions will include:

- **Reports Management**: Create, edit, delete vulnerability reports
- **Vulnerability Tracking**: Bug management with CVSS scoring
- **Markdown Editor**: Rich text editor for report writing
- **PDF Generation**: Export reports to PDF
- **Role-based Access**: Granular permissions system
- **Multi-company Support**: Company switching interface
- **Global Search**: Search across reports and vulnerabilities
- **Real-time Notifications**: WebSocket-based live updates

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Quality

- **TypeScript**: Full type safety
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting (via ESLint)
- **Strict Mode**: React strict mode enabled

## 📞 Support

For questions or issues, please refer to the API documentation at the WhyXpose API v2 endpoint or contact the development team.

---

**Note**: This is a demonstration frontend for the WhyXpose vulnerability management system. The application showcases modern React development practices and professional UI/UX design.