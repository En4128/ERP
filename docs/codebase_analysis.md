# Smart Campus ERP - Codebase Analysis

## 1. Overview
The Smart Campus ERP is a comprehensive, full-stack web application designed to manage various aspects of a campus, including students, faculty, administration, courses, attendance, and more. It follows a modern MERN-like architecture with real-time features and AI-powered assistance.

---

## 2. Technology Stack

### Frontend (Client)
- **Framework**: [React](https://reactjs.org/) (bootstrapped with [Vite](https://vitejs.dev/))
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for utility-first styling with custom **Poppins** font integration.
- **Routing**: [React Router DOM](https://reactrouter.com/) for handling role-based navigation.
- **Animations**: [Framer Motion](https://www.framer.com/motion/) for smooth page transitions and UI effects.
- **Icons**: [Lucide React](https://lucide.dev/) for a consistent iconography system.
- **Notifications**: [Sonner](https://sonner.stevenly.me/) for toast notifications.
- **Service Worker**: Custom `sw.js` for handling background **Web Push Notifications** even when the app is closed.
- **State Management**: React Context API with persistent `localStorage` synchronization (e.g., `ChatContext.jsx` for persistent bot conversations).
- **UI System**: Modern "Bento Grid" layouts with custom Glassmorphism components and specialized notification modals.
- **Premium Components**: Includes `MagneticButton.jsx`, `ParticleTextEffect.jsx`, `QRGenerator.jsx`, `QRScanner.jsx`, `FloatingShapes.jsx`, `ModernBackground.jsx`, and `SmoothScroll.jsx`.

### Backend (Server)
- **Environment**: [Node.js](https://nodejs.org/) with [Express.js](https://expressjs.com/).
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) ODM.
- **Real-time**: [Socket.io](https://socket.io/) for instant messaging/chat functionality and real-time class alerts.
- **Scheduling**: [node-cron](https://github.com/node-cron/node-cron) for automated background tasks (e.g., class alerts).
- **Push Notifications**: [web-push](https://github.com/web-push-libs/web-push) for sending VAPID-secured notifications to browsers.
- **Authentication**: [JWT (JSON Web Tokens)](https://jwt.io/) and [Bcryptjs](https://github.com/dcodeIO/bcrypt.js) for secure password hashing.
- **File Handling**: [Multer](https://github.com/expressjs/multer) for managing file uploads (assignments, documents).
- **AI Integration**: [Google Generative AI SDK](https://ai.google.dev/) (Gemini Flash) with automated ERP context injection and personal database query mapping.
- **Communication**: [Nodemailer](https://nodemailer.com/) for automated email notifications.

---

## 3. Project Structure

### Client Directory (`/client`)
- `public/sw.js`: Service worker optimized for handling background push events and notification clicks.
- `src/components`: Reusable UI components (Modals, Loaders, Sidebar, `NotificationBell.jsx`, `Layout.jsx`, and high-performance animation components).
- `src/context`: Global state providers (e.g., `ChatContext.jsx`).
- `src/pages`: Organized by user role:
  - `/admin`: Administrative tools (Exam management, Dashboard).
  - `/faculty`: Tools for faculty (Attendance, Marks, Student management, and enhanced `Courses.jsx`).
  - `/student`: Student portal (Results, Fees, Courses, Notifications, etc.).
  - Root pages: `Login.jsx`, `Home.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx`.

### Server Directory (`/server`)
- `controllers/`: Business logic for API endpoints (`notificationController.js`, `chatbotController.js`, etc.).
- `models/`: Mongoose schemas defining the data structure for entities like `Student`, `Course`, `Attendance`, `Message`, and the updated `User` model with push subscriptions.
- `routes/`: API route definitions mapping URLs to controllers.
- `services/`: Background services, including `notificationService.js` which runs cron jobs for class alerts and manages Web Push delivery.
- `utils/`: Common utility functions, including the `chatbotHelper.js` for intelligent ERP data retrieval and `rateLimiter.js` for API protection.
- `uploads/`: Local storage for uploaded files.

---

## 4. Key Entities & Data Models
The system manages several core entities:
- **Users**: Admin, Faculty, and Student roles managed via a `User` model and specific profiles. Now includes `pushSubscription` for Web Push.
- **Academic**: `Course`, `Timetable`, `Attendance`, `Assignment`, `Mark`, `Exam`.
- **Administrative**: `Fee`, `Leave`, `Notice`, `Notification` (standardized alert history), `PlacementDrive`.
- **Communication**: `Message` (for chat) and `ChatbotInteraction`.

---

## 5. Core Features
1. **Role-Based Access Control**: Distinct dashboards and functionalities for Students, Faculty, and Admins.
2. **Real-time Chat**: Faculty and students can communicate instantly via a Socket.io-powered chat interface.
3. **Automated Notification System**:
    - **Cron Job Scheduler**: Checks for upcoming classes every minute (via `node-cron`).
    - **Multi-Channel Delivery**: Sends alerts via **Socket.io** (in-app toasts) and **Web Push** (browser notifications).
    - **Desktop Support**: "Enable Alerts" feature for desktop users with smart tab focus management.
    - **Robust Logging**: Detailed tracking in `push_debug.log` for troubleshooting notification delivery.
4. **AI Campus Assistant (Smart Chatbot)**:
    - **Persistent History**: Conversations survive page refreshes and navigation.
    - **Personal Context**: Automatically fetches user-specific timetable, faculty, and marks using `chatbotHelper.js`.
    - **Intent Recognition**: Classified queries for ERP Data, Study/Academic info, or Unauthorized requests.
    - **Concise Responses**: Enforced data-only, direct output for efficient assistance using `gemini-flash-latest`.
5. **Attendance Tracking**: Digital attendance management with heatmap visualization.
6. **Redesigned Notifications**: Advanced notification center using heavy glassmorphism, background blurs, and Framer Motion micro-animations.
7. **Faculty Intelligence Layer**: Real-time insights in `Courses.jsx` including enrollment stats and marking compliance with `CountUp` animations.
8. **Backend Continuity**: High-availability server setup with synchronized database connection management.

---

## 6. Development & Deployment
- **Local Dev**: Use `npm run dev` in both client and server directories.
- **Environment**: Configured via `.env` files for secrets like `MONGO_URI`, `JWT_SECRET`, `GOOGLE_AI_API_KEY`, and `VAPID_KEYS`.
- **Logging**: The server maintains an `access.log` for tracking API requests and several AI/Push-specific logs for debugging.
- **Performance**: Optimized scroll behavior with `SmoothScroll.jsx` and eliminated lazy loading for faster interactions.
