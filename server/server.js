const express = require('express');
const http = require('http');
const initSocket = require('./socket');

const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = initSocket(server);
const PORT = process.env.PORT || 5000;


// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Global Request Logger
app.use((req, res, next) => {
    const fs = require('fs');
    const path = require('path');
    const logData = `[${new Date().toISOString()}] ${req.method} ${req.url}\n`;
    fs.appendFileSync(path.join(__dirname, 'access.log'), logData);
    next();
});

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campus-erp')
    .then(() => console.log('Database Connected'))
    .catch(err => console.log('MongoDB Connection Error:', err));

// Routes Configuration
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/faculty', require('./routes/facultyRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/placement', require('./routes/placementRoutes'));
app.use('/api/exams', require('./routes/examRoutes'));
app.use('/api/timetable', require('./routes/timetableRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/chatbot', require('./routes/chatbotRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));


app.get('/', (req, res) => {
    res.send('LearNex is running...');
});

// Start Server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
