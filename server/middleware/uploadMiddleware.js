const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const folders = ['uploads/materials', 'uploads/assignments', 'uploads/submissions', 'uploads/resumes', 'uploads/chat', 'uploads/profile'];

folders.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dest = 'uploads/materials';
        const url = req.originalUrl || req.url;
        if (url.includes('chat')) {
            dest = 'uploads/chat';
        } else if (url.includes('assignments')) {
            if (url.includes('submit')) {
                dest = 'uploads/submissions';
            } else {
                dest = 'uploads/assignments';
            }
        } else if (url.includes('placement')) {
            dest = 'uploads/resumes';
        } else if (url.includes('profile/image')) {
            dest = 'uploads/profile';
        }

        cb(null, dest);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // More permissive for chat uploads
    if (req.originalUrl && req.originalUrl.includes('chat')) {
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|ppt|pptx|txt|mp4|avi|mov|mp3|wav|zip|rar/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

        if (extname) {
            return cb(null, true);
        } else {
            cb(new Error('File type not supported for chat!'));
        }
    } else {
        const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|ppt|pptx|txt/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only images, PDFs, Word, and PowerPoint files are allowed!'));
        }
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for chat files
    fileFilter: fileFilter
});

module.exports = upload;
