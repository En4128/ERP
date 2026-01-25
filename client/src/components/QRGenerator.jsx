import { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { X, QrCode, Users, Clock, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QRGenerator = ({ courses }) => {
    const [selectedCourse, setSelectedCourse] = useState('');
    const [qrData, setQrData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [scannedCount, setScannedCount] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(null);

    // Check for active session on mount
    useEffect(() => {
        checkActiveSession();
    }, []);

    // Poll for scanned count every 3 seconds when QR is active
    useEffect(() => {
        if (qrData) {
            const interval = setInterval(() => {
                fetchScannedCount();
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [qrData]);

    // Update time remaining
    useEffect(() => {
        if (qrData?.expiresAt) {
            const interval = setInterval(() => {
                const remaining = Math.max(0, new Date(qrData.expiresAt) - new Date());
                setTimeRemaining(remaining);
                if (remaining === 0) {
                    handleCloseQR();
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [qrData]);

    const checkActiveSession = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/attendance/qr/active', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.hasActiveSession) {
                setQrData(res.data);
                setScannedCount(res.data.scannedCount);
                setSelectedCourse(res.data.course._id);
            }
        } catch (error) {
            console.error('Check active session error:', error);
        }
    };

    const fetchScannedCount = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/attendance/qr/active', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.hasActiveSession) {
                setScannedCount(res.data.scannedCount);
            }
        } catch (error) {
            console.error('Fetch scanned count error:', error);
        }
    };

    const handleGenerateQR = async () => {
        if (!selectedCourse) {
            alert('Please select a course');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                'http://localhost:5000/api/attendance/qr/generate',
                { courseId: selectedCourse },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setQrData(res.data);
            setScannedCount(0);
        } catch (error) {
            console.error('Generate QR error:', error);
            alert(error.response?.data?.message || 'Failed to generate QR code');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseQR = async () => {
        if (!qrData) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `http://localhost:5000/api/attendance/qr/close/${qrData.qrToken}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setQrData(null);
            setScannedCount(0);
            setTimeRemaining(null);
        } catch (error) {
            console.error('Close QR error:', error);
            alert('Failed to close QR session');
        }
    };

    const formatTime = (ms) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="space-y-6">
            {/* Course Selection */}
            {!qrData && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4">Generate Attendance QR</h3>
                    <div className="space-y-4">
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Select Course</option>
                            {courses.map(course => (
                                <option key={course._id} value={course._id}>
                                    {course.name} ({course.code})
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={handleGenerateQR}
                            disabled={loading || !selectedCourse}
                            className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-black rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <QrCode size={20} />
                            {loading ? 'Generating...' : 'Generate QR Code'}
                        </button>
                    </div>
                </div>
            )}

            {/* Active QR Session */}
            <AnimatePresence>
                {qrData && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white">{qrData.courseName}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">Active Attendance Session</p>
                            </div>
                            <button
                                onClick={handleCloseQR}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>

                        {/* QR Code */}
                        <div className="flex justify-center mb-6 p-6 bg-white rounded-xl">
                            <QRCodeSVG value={qrData.qrToken} size={256} level="H" />
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
                                <div className="flex items-center gap-2 mb-1">
                                    <Users size={18} className="text-indigo-600 dark:text-indigo-400" />
                                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase">Scanned</span>
                                </div>
                                <p className="text-2xl font-black text-slate-800 dark:text-white">{scannedCount}</p>
                            </div>
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800">
                                <div className="flex items-center gap-2 mb-1">
                                    <Clock size={18} className="text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase">Time Left</span>
                                </div>
                                <p className="text-2xl font-black text-slate-800 dark:text-white">
                                    {timeRemaining !== null ? formatTime(timeRemaining) : '--:--'}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleCloseQR}
                            className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-lg transition-all active:scale-95"
                        >
                            Close QR Session
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default QRGenerator;
