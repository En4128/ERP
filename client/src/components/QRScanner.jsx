import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { QrCode, CheckCircle2, XCircle, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

const QRScanner = () => {
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        let html5QrcodeScanner = null;

        if (scanning) {
            html5QrcodeScanner = new Html5QrcodeScanner(
                "qr-reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                false
            );

            const onScanSuccess = async (decodedText) => {
                // Stop scanning
                html5QrcodeScanner.clear();
                setScanning(false);

                // Mark attendance
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.post(
                        'http://localhost:5000/api/attendance/qr/scan',
                        { qrToken: decodedText },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setResult({
                        success: true,
                        message: res.data.message,
                        course: res.data.course
                    });
                } catch (error) {
                    setResult({
                        success: false,
                        message: error.response?.data?.message || 'Failed to mark attendance'
                    });
                }
            };

            const onScanError = (error) => {
                // Ignore scan errors (they happen frequently while scanning)
            };

            html5QrcodeScanner.render(onScanSuccess, onScanError);
        }

        return () => {
            if (html5QrcodeScanner) {
                html5QrcodeScanner.clear().catch(err => console.log('Scanner cleanup error:', err));
            }
        };
    }, [scanning]);

    const startScanning = () => {
        setScanning(true);
        setResult(null);
    };

    const resetScanner = () => {
        setResult(null);
        setScanning(false);
    };

    return (
        <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                        <QrCode size={24} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-white">Scan Attendance QR</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">Mark your attendance</p>
                    </div>
                </div>

                {!scanning && !result && (
                    <button
                        onClick={startScanning}
                        className="w-full px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Camera size={20} />
                        Start Scanning
                    </button>
                )}

                {scanning && (
                    <div>
                        <div id="qr-reader" className="rounded-xl overflow-hidden mb-4"></div>
                        <button
                            onClick={resetScanner}
                            className="w-full px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-black rounded-xl transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                {result && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-6 rounded-xl border-2 ${result.success
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                            }`}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            {result.success ? (
                                <CheckCircle2 size={32} className="text-emerald-600 dark:text-emerald-400" />
                            ) : (
                                <XCircle size={32} className="text-red-600 dark:text-red-400" />
                            )}
                            <div>
                                <h4 className={`font-black text-lg ${result.success ? 'text-emerald-800 dark:text-emerald-200' : 'text-red-800 dark:text-red-200'
                                    }`}>
                                    {result.success ? 'Success!' : 'Failed'}
                                </h4>
                                <p className={`text-sm font-bold ${result.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                                    }`}>
                                    {result.message}
                                </p>
                            </div>
                        </div>
                        {result.course && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 font-bold mb-4">
                                Course: {result.course}
                            </p>
                        )}
                        <button
                            onClick={resetScanner}
                            className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition-all active:scale-95"
                        >
                            Scan Another QR
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default QRScanner;
