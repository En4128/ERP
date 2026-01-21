import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageLoader from './components/PageLoader';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import StudentDashboard from './pages/student/Dashboard';
import StudentAttendance from './pages/student/Attendance';
import StudentCourses from './pages/student/Courses';
import StudentTimetable from './pages/student/Timetable';
import StudentResults from './pages/student/Results';
import StudentDocuments from './pages/student/Documents';
import StudentFacultyInfo from './pages/student/FacultyInfo';
import StudentPlacements from './pages/student/Placements';
import StudentFees from './pages/student/Fees';
import StudentLibrary from './pages/student/Library';
import StudentLeave from './pages/student/Leave';
import StudentSupport from './pages/student/Support';
import StudentNotifications from './pages/student/Notifications';
import StudentProfile from './pages/student/Profile';
import FacultyDashboard from './pages/faculty/Dashboard';
import FacultyAttendance from './pages/faculty/Attendance';
import FacultyMarks from './pages/faculty/Marks';
import FacultyCourses from './pages/faculty/Courses';
import FacultyProfile from './pages/faculty/Profile';
import FacultyTimetable from './pages/faculty/Timetable';
import FacultyDocuments from './pages/faculty/Documents';
import FacultyNotifications from './pages/faculty/Notifications';
import FacultyManageStudents from './pages/faculty/ManageStudents';
import FacultyLeaveRequests from './pages/faculty/LeaveRequests';
import AdminManageExams from './pages/admin/ManageExams';
import ExamSchedule from './pages/admin/ExamSchedule';
import Chat from './pages/shared/Chat';


import { ChatProvider } from './context/ChatContext';
import { Toaster } from 'sonner';

function App() {
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    // Simulate initialization
    const timer = setTimeout(() => {
      setAppLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950 transition-colors duration-300">
      <Toaster position="top-right" richColors />
      <ChatProvider>
        <AnimatePresence mode="wait">
          {appLoading && <PageLoader key="app-loader" />}
        </AnimatePresence>

        {!appLoading && (
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />

            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/attendance" element={<StudentAttendance />} />
            <Route path="/student/courses" element={<StudentCourses />} />
            <Route path="/student/timetable" element={<StudentTimetable />} />
            <Route path="/student/results" element={<StudentResults />} />
            <Route path="/student/documents" element={<StudentDocuments />} />
            <Route path="/student/faculty" element={<StudentFacultyInfo />} />
            <Route path="/student/placements" element={<StudentPlacements />} />
            <Route path="/student/fees" element={<StudentFees />} />
            <Route path="/student/library" element={<StudentLibrary />} />
            <Route path="/student/leave" element={<StudentLeave />} />
            <Route path="/student/exams" element={<ExamSchedule role="student" />} />
            <Route path="/student/support" element={<StudentSupport />} />
            <Route path="/student/notifications" element={<StudentNotifications />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/chat" element={<Chat />} />


            <Route path="/faculty" element={<FacultyDashboard />} />
            <Route path="/faculty/attendance" element={<FacultyAttendance />} />
            <Route path="/faculty/courses" element={<FacultyCourses />} />
            <Route path="/faculty/timetable" element={<FacultyTimetable />} />
            <Route path="/faculty/marks" element={<FacultyMarks />} />
            <Route path="/faculty/documents" element={<FacultyDocuments />} />
            <Route path="/faculty/students" element={<FacultyManageStudents />} />
            <Route path="/faculty/notifications" element={<FacultyNotifications />} />
            <Route path="/faculty/profile" element={<FacultyProfile />} />
            <Route path="/faculty/leave-requests" element={<FacultyLeaveRequests />} />
            <Route path="/faculty/chat" element={<Chat />} />

            <Route path="/faculty/exams" element={<ExamSchedule role="faculty" />} />

            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/exams" element={<AdminManageExams />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
          </Routes>
        )}
      </ChatProvider>
    </div>
  );
}

export default App;
