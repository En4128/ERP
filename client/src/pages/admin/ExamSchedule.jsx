import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import Layout from '../../components/Layout';
import { Calendar, Clock, MapPin, Download, AlertCircle, CheckCircle } from 'lucide-react';

const ExamSchedule = ({ role }) => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [studentProfile, setStudentProfile] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Fetch Exams
            const endpoint = role === 'student' ? 'http://localhost:5000/api/student/exams' : 'http://localhost:5000/api/faculty/exams';
            const examsRes = await axios.get(endpoint, config);
            setExams(examsRes.data);

            // Fetch Student Profile if role is student
            if (role === 'student') {
                const profileRes = await axios.get('http://localhost:5000/api/student/profile', config);
                setStudentProfile(profileRes.data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const downloadHallTicket = () => {
        const doc = new jsPDF();

        // Header
        doc.setFillColor(63, 81, 181); // Indigo color
        doc.rect(0, 0, 210, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("CAMPUS CONNECT", 105, 15, { align: 'center' });
        doc.setFontSize(14);
        doc.text("Examination Hall Ticket", 105, 24, { align: 'center' });

        // Student Details
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);

        if (studentProfile) {
            doc.text(`Name:`, 20, 45);
            doc.setFont(undefined, 'bold');
            doc.text(studentProfile.user.name, 50, 45);

            doc.setFont(undefined, 'normal');
            doc.text(`Reg No:`, 120, 45);
            doc.setFont(undefined, 'bold');
            doc.text(studentProfile.admissionNumber, 150, 45);

            doc.setFont(undefined, 'normal');
            doc.text(`Dept:`, 20, 55);
            doc.setFont(undefined, 'bold');
            doc.text(studentProfile.department, 50, 55);

            doc.setFont(undefined, 'normal');
            doc.text(`Semester:`, 120, 55);
            doc.setFont(undefined, 'bold');
            doc.text(String(studentProfile.sem), 150, 55);
        }

        // Table Header
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 65, 190, 65);

        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text("Course", 20, 75);
        doc.text("Title", 50, 75);
        doc.text("Date", 110, 75);
        doc.text("Time", 140, 75);
        doc.text("Venue", 170, 75);

        doc.line(20, 80, 190, 80);

        // Table Content
        doc.setFont(undefined, 'normal');
        let y = 90;

        exams.forEach(exam => {
            // Basic pagination
            if (y > 270) {
                doc.addPage();
                y = 20;
            }

            const date = new Date(exam.date).toLocaleDateString();

            doc.text(exam.course?.code || '-', 20, y);
            const title = exam.title || exam.course?.name || '-';
            doc.text(title.length > 25 ? title.substring(0, 22) + '...' : title, 50, y);
            doc.text(date, 110, y);
            doc.text(exam.time, 140, y);
            doc.text(exam.venue, 170, y);

            y += 10;
        });

        // Footer Instructions
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text("Instructions:", 20, y + 10);
        doc.text("1. Candidates must present this Hall Ticket and ID Card for verification.", 20, y + 15);
        doc.text("2. Reporting time is 15 mins before scheduled time.", 20, y + 20);
        doc.text("3. Electronic gadgets are strictly prohibited.", 20, y + 25);

        doc.save("HallTicket.pdf");
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'midterm': return 'text-blue-600 bg-blue-50 border-blue-100';
            case 'final': return 'text-purple-600 bg-purple-50 border-purple-100';
            case 'practical': return 'text-orange-600 bg-orange-50 border-orange-100';
            default: return 'text-gray-600 bg-white border-gray-100';
        }
    };

    return (
        <Layout role={role}>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Exam Schedule</h1>
                        <p className="text-slate-600 dark:text-gray-400">
                            {role === 'student' ? 'Your upcoming examinations and venue details' : 'Examination schedule for your assigned courses'}
                        </p>
                    </div>
                    {role === 'student' && exams.length > 0 && (
                        <button
                            onClick={downloadHallTicket}
                            className="flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition shadow-lg shadow-amber-500/30"
                        >
                            <Download size={18} className="mr-2" /> Download Hall Ticket
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-slate-600">Loading exam schedule...</p>
                    </div>
                ) : exams.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 p-12 rounded-xl text-center shadow-sm border border-gray-100 dark:border-slate-700">
                        <div className="h-16 w-16 bg-emerald-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-green-400">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">No Exams Scheduled</h3>
                        <p className="text-slate-600 mt-1">You don't have any upcoming exams at the moment.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {exams.map(exam => {
                            const today = new Date();
                            const examDate = new Date(exam.date);
                            const isPast = examDate < today;

                            return (
                                <div key={exam._id} className={`bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border transition-all hover:shadow-md
                                ${isPast ? 'border-gray-100 dark:border-slate-700 opacity-70' : 'border-indigo-100 dark:border-indigo-900/30 ring-1 ring-indigo-50 dark:ring-indigo-900/20'}
                            `}>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${getTypeColor(exam.type)}`}>
                                                    {exam.type}
                                                </span>
                                                {isPast && <span className="text-xs font-medium text-gray-400 uppercase">Completed</span>}
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                                {exam.course?.code} - {exam.course?.name}
                                            </h3>
                                            <p className="text-slate-600 text-sm mt-1">{exam.title}</p>
                                        </div>

                                        <div className="flex flex-wrap gap-4 md:gap-8 items-center text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-gray-400">
                                                    <Calendar size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 uppercase font-semibold">Date</p>
                                                    <p className="font-medium text-slate-700 dark:text-gray-200">{new Date(exam.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <div className="p-2 rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-gray-400">
                                                    <Clock size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 uppercase font-semibold">Time & Duration</p>
                                                    <p className="font-medium text-slate-700 dark:text-gray-200">{exam.time} ({exam.duration})</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <div className="p-2 rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-gray-400">
                                                    <MapPin size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 uppercase font-semibold">Venue</p>
                                                    <p className="font-medium text-slate-700 dark:text-gray-200">{exam.venue}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {role === 'student' && (
                    <div className="mt-8 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                        <div>
                            <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm">Examination Instructions</h4>
                            <ul className="text-xs text-amber-700 dark:text-amber-300 mt-2 list-disc list-inside space-y-1">
                                <li>Students must carry their Hall Ticket and ID Card.</li>
                                <li>Reporting time is 15 minutes before the scheduled exam time.</li>
                                <li>Electronic gadgets like mobile phones and smartwatches are strictly prohibited.</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ExamSchedule;
