# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a comprehensive Drug Prevention Community Support Platform ("Phần mềm Hỗ trợ Phòng ngừa Sử dụng Ma túy trong Cộng đồng") built with a React frontend and Node.js/Express backend. The platform provides risk assessment tools, online courses, counselor appointments, and community program management for drug prevention education.

## Architecture

### Frontend (React + Vite)
- **Location**: `/frontend/`
- **Framework**: React 19 with Vite build tool
- **Styling**: Tailwind CSS v4 with PostCSS
- **Routing**: React Router DOM v7
- **State Management**: React Context (AuthContext)
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **UI Components**: Heroicons, Framer Motion
- **Notifications**: React Hot Toast

### Backend (Node.js + Express)
- **Location**: `/backend/`
- **Runtime**: Node.js with Express.js framework
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcryptjs password hashing
- **Security**: Helmet, CORS middleware
- **File Upload**: Multer
- **Email**: Nodemailer
- **Logging**: Morgan

## Common Development Commands

### Frontend Development
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Start development server (Vite)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend Development
```bash
cd backend
npm install          # Install dependencies
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm test             # Run tests (currently not implemented)
```

## Key API Endpoints

The backend provides REST API endpoints under `/api/` prefix:

- **Authentication**: `/api/auth/` (register, login, profile, change-password)
- **Users**: `/api/users/` (user management)
- **Courses**: `/api/courses/` (online training courses)
- **Assessments**: `/api/assessments/` (ASSIST, CRAFFT, AUDIT, DAST risk assessments)
- **Appointments**: `/api/appointments/` (counselor scheduling)
- **Programs**: `/api/programs/` (community programs)
- **Counselors**: `/api/counselors/` (counselor management)
- **Blogs**: `/api/blogs/` (blog/news content)

## Database Schema Highlights

### User Model (`backend/models/User.js`)
- Comprehensive user profiles with roles (user, counselor, admin)
- Age group categorization (student, university_student, parent, teacher, other)
- Assessment history tracking (ASSIST, CRAFFT, AUDIT, DAST scores)
- Course enrollment and progress tracking
- Appointment and program participation history
- Notification preferences

### Key Features
- Risk assessment tools with standardized scoring
- Course progress tracking with certificates
- Counselor appointment scheduling
- Multi-language support (Vietnamese/English)
- Email verification and notification system

## Environment Configuration

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/drug_prevention
JWT_SECRET=your_super_secret_jwt_key
FRONTEND_URL=http://localhost:5173
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Phòng chống Ma túy Cộng đồng
```

## Code Conventions

- **Frontend**: Uses ES modules, JSX, and modern React patterns with hooks
- **Backend**: CommonJS modules, async/await patterns
- **Styling**: Tailwind CSS utility classes
- **Database**: Mongoose schemas with validation and middleware
- **Authentication**: JWT token-based with secure password hashing
- **Error Handling**: Centralized error middleware in backend
- **Security**: Helmet for security headers, CORS configuration

## Development Notes

- The application is bilingual (Vietnamese primary, English support)
- Uses MongoDB for data persistence
- Frontend runs on port 5173 (Vite default)
- Backend runs on port 5000
- No testing framework currently configured
- ESLint configured for frontend code quality