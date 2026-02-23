# LearNex - Advanced Smart Campus ERP

A next-generation, full-stack College ERP solution built with the **MERN Stack**. Designed with a focus on **Premium UI/UX**, real-time performance, and robust role-based access control.

## 🚀 Key Features

### 🎓 Student Portal
- **Dashboard**: "Bento Grid" style interactive dashboard with real-time stats (Attendance, CGPA, Pending Tasks).
- **Smart Attendance**: Detailed history with **Heatmap Visualization**, subject-wise analytics, and "Safe Zone" monitoring.
- **Fees & Payments**: View outstanding dues, payment history, and "Pay Now" options.
- **Academic Hub**: Access Enrolled Courses, Timetable, Results, and Exam Schedules.
- **Support & Leaves**: Apply for leave and request support directly from the portal.
- **AI Chatbot**: Integrated **Google Gemini AI** powered assistant with:
    - **Persistent History**: Conversations are saved to `localStorage` and persist across navigation.
    - **Personal Context**: Automatic recognition of user's department, courses, and timetable.
    - **Clear Chat**: Functionality to reset and purge conversational data.
- **Real-time Chat**: Instant messaging with faculty and peers, powered by **Socket.IO**.
- **Modern Notifications**: Redesigned notification center with **Glassmorphism UI** and smooth animations.

### 👨‍🏫 Faculty Portal
- **Dashboard**: Quick overview of daily schedules and pending requests.
- **Attendance Management**: Mark and update student attendance efficiently.
- **Student Management**: View student profiles and academic performance.
- **Real-time Communication**: Direct messaging channels with students for mentoring and doubt resolution.

### 🛡️ Admin Portal
- **User Management**: Create and manage Students and Faculty.
- **Course Management**: Define curriculum, assign faculty, and manage departments.
- **System Control**: Global settings and announcements.

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS (Modern, Responsive, Dark Mode)
- **Animations**: Framer Motion (Smooth transitions and micro-interactions)
- **Icons**: Lucide React
- **Charts**: Recharts & Chart.js (for Analytics and Heatmaps)
- **HTTP Client**: Axios
- **Notifications**: Sonner
- **PDF Generation**: jsPDF, html2canvas
- **Real-time**: Socket.IO Client

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens) with secure password hashing (Bcrypt)
- **AI Integration**: Google Generative AI (Gemini Flash)
- **Real-time**: Socket.IO
- **Stability**: Synchronized Mongoose connection management for reliable server startup.
- **Logging**: File-based persistent debugging and enhanced error reporting.

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (Run locally or use Atlas URI)

### 1. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/campus-erp
JWT_SECRET=your_super_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
```

Seed the database with sample data (Optional but recommended):
```bash
node seeder.js
```

Start the Server:
```bash
npm run dev
# Server runs on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd client
npm install
```

Start the Client:
```bash
npm run dev
# App launches at http://localhost:5173
```

## 🔐 Default Credentials

| Role    | Email            | Password |
|---------|------------------|----------|
| **Admin**   | admin@test.com   | 123456   |
| **Faculty** | faculty@test.com | 123456   |
| **Student** | student@test.com | 123456   |

## 🔌 API Overview

### Auth
- `POST /api/auth/login`: User login
- `POST /api/auth/register`: User registration (if public)

### Students
- `GET /api/student/profile`: Get student profile
- `GET /api/student/attendance`: Get attendance records
- `GET /api/student/marks`: Get academic performance

### Faculty
- `GET /api/faculty/schedule`: Get daily timetable
- `POST /api/faculty/attendance`: Mark student attendance

### Chatbot
- `POST /api/chatbot/ask`: Get AI-powered response with persistent ERP context

### Chat
- Socket.IO events: `join_room`, `send_message`, `receive_message`

## 📂 Project Structure

### 💻 Client (Frontend)
```bash
client/
├── src/
│   ├── components/      # Reusable UI (Chatbot, Layout, Sidebar, Notifications)
│   ├── pages/
│   │   ├── admin/       # Admin views (Manage Faculty, Students, Placements, Fees)
│   │   ├── faculty/     # Faculty views (Attendance, Assignments, Marks, Profile)
│   │   ├── student/     # Student views (Results, Fees, Placements, Dashboard)
│   │   └── shared/      # Common pages (Login, Home, Forgot Password)
│   ├── context/         # Auth and App State management
│   ├── lib/             # Third-party configurations (Socket client, etc.)
│   ├── utils/           # Frontend helper functions (Date formatting, validators)
│   ├── App.jsx          # Route definitions and core application wrapper
│   └── main.jsx         # Application entry point
├── public/              # Static assets and PWA icons
└── tailwind.config.js   # Custom theme and design system tokens
```

### 🛰️ Server (Backend)
```bash
server/
├── controllers/      # Route handlers (Auth, Faculty, Student, Admin, Chat)
├── models/           # Mongoose schemas (User, Student, Course, Attendance, etc.)
├── routes/           # API Endpoint definitions
├── middleware/       # JWT Auth and File Upload processing
├── scripts/          # One-off debug and maintenance scripts
├── logs/             # Persistent server and notification logs
├── services/         # External integrations (Notification services)
├── utils/            # Shared backend utilities (Chatbot helpers, Rate limiters)
├── uploads/          # Physical storage for submitted assignments/documents
├── server.js         # Express app initialization and DB connection
└── socket.js         # Real-time communication logic
```

### 🛠️ Utilities & Documentation
- `tools/`: Utility scripts for PDF data extraction and theme styling.
- `docs/`: System analysis documentation and debug logs.
- `seeder.js`: Database initialization script.
```

## ✨ Highlights
- **Dark Mode Support**: Fully responsive dark/light theme switching.
- **Interactive UI**: Hover effects, smooth page transitions, and premium glassmorphism elements.
- **Persistent AI Context**: Smart chatbot that remembers your data and conversation history.
- **Data Integrity**: Robust backend validation and connection synchronization.
