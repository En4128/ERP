# Smart Campus ERP - Codebase Analysis

## 1. Overview
The Smart Campus ERP is a comprehensive, full-stack web application designed to manage various aspects of a campus, including students, faculty, administration, courses, attendance, and more. It follows a modern MERN-like architecture with real-time features.

---

## 2. Technology Stack

### Frontend (Client)
- **Framework**: [React](https://reactjs.org/) (bootstrapped with [Vite](https://vitejs.dev/))
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for utility-first styling.
- **Routing**: [React Router DOM](https://reactrouter.com/) for handling role-based navigation.
- **Animations**: [Framer Motion](https://www.framer.com/motion/) for smooth page transitions and UI effects.
- **Icons**: [Lucide React](https://lucide.dev/) for a consistent iconography system.
- **Notifications**: [Sonner](https://sonner.stevenly.me/) for toast notifications.
- **State Management**: React Context API (e.g., `ChatContext`).

### Backend (Server)
- **Environment**: [Node.js](https://nodejs.org/) with [Express.js](https://expressjs.com/).
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) ODM.
- **Real-time**: [Socket.io](https://socket.io/) for instant messaging/chat functionality.
- **Authentication**: [JWT (JSON Web Tokens)](https://jwt.io/) and [Bcryptjs](https://github.com/dcodeIO/bcrypt.js) for secure password hashing.
- **File Handling**: [Multer](https://github.com/expressjs/multer) for managing file uploads (assignments, documents).
- **AI Integration**: [Google Generative AI SDK](https://ai.google.dev/) for campus-specific AI assistant features.
- **Communication**: [Nodemailer](https://nodemailer.com/) for automated email notifications.

---

## 3. Project Structure

### Client Directory (`/client`)
- `src/components`: Reusable UI components (Modals, Loaders, Sidebar, etc.).
- `src/context`: Global state providers (e.g., `ChatContext.jsx`).
- `src/pages`: Organized by user role:
  - `/admin`: Administrative tools (Exam management, Dashboard).
  - `/faculty`: Tools for faculty (Attendance, Marks, Student management).
  - `/student`: Student portal (Results, Fees, Courses, etc.).
  - `/shared`: Common pages like `Login.jsx` and `Chat.jsx`.

### Server Directory (`/server`)
- `controllers/`: Business logic for API endpoints.
- `models/`: Mongoose schemas defining the data structure for entities like `Student`, `Course`, `Attendance`, `Message`, etc.
- `routes/`: API route definitions mapping URLs to controllers.
- `utils/`: Common utility functions.
- `uploads/`: Local storage for uploaded files.

---

## 4. Key Entities & Data Models
The system manages several core entities:
- **Users**: Admin, Faculty, and Student roles managed via a `User` model and specific profiles.
- **Academic**: `Course`, `Timetable`, `Attendance`, `Assignment`, `Mark`, `Exam`.
- **Administrative**: `Fee`, `Leave`, `Notice`, `Notification`, `PlacementDrive`.
- **Communication**: `Message` (for chat) and `ChatbotInteraction`.

---

## 5. Core Features
1. **Role-Based Access Control**: Distinct dashboards and functionalities for Students, Faculty, and Admins.
2. **Real-time Chat**: Faculty and students can communicate instantly via a Socket.io-powered chat interface.
3. **AI Campus Assistant**: A chatbot integrated with Google’s Generative AI to assist users.
4. **Attendance Tracking**: Digital attendance management for faculty and students.
5. **Academic Management**: Handling of courses, assignments, marks, and exam schedules.
6. **Administrative Workflow**: Management of fees, leave requests, and placements.

---

## 6. Development & Deployment
- **Local Dev**: Use `npm run dev` in both client and server directories.
- **Environment**: Configured via `.env` files for secrets like `MONGO_URI`, `JWT_SECRET`, and `GEMINI_API_KEY`.
- **Logging**: The server maintains an `access.log` for tracking API requests and several AI-specific logs for debugging.
