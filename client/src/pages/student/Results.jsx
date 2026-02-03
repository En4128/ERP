import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import { Award, FileText, ChevronDown, ChevronUp, Download, PieChart, TrendingUp } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Results = () => {
    const [resultsData, setResultsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedSem, setExpandedSem] = useState(null);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/student/results', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setResultsData(res.data);
                // Expand the first semester by default if available
                if (res.data.results && res.data.results.length > 0) {
                    setExpandedSem(res.data.results[0].semester);
                }
            } catch (err) {
                console.error("Error fetching results:", err);
                setError("Failed to load results. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, []);

    const toggleSem = (sem) => {
        setExpandedSem(expandedSem === sem ? null : sem);
    };

    const downloadGradeSheet = (sem) => {
        const semesterData = resultsData.results.find(r => r.semester === sem);
        if (!semesterData) return;

        const doc = new jsPDF();

        // Header
        doc.setFontSize(18);
        doc.setTextColor(40, 40, 40);
        doc.text("Semester Grade Sheet", 14, 22);

        // Student Details
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Name: ${resultsData.studentName}`, 14, 32);
        doc.text(`Admission No: ${resultsData.admissionNumber}`, 14, 38);
        doc.text(`Department: ${resultsData.department}`, 14, 44);
        doc.text(`Semester: ${sem}`, 150, 32);
        doc.text(`SGPA: ${semesterData.sgpa}`, 150, 38);

        // Table Data
        const tableColumn = ["Course Code", "Subject", "Type", "Credits", "Marks", "Grade"];
        const tableRows = [];

        semesterData.results.forEach(subject => {
            const rowData = [
                subject.courseCode,
                subject.courseName,
                subject.examType,
                subject.credits,
                `${subject.marksObtained} / ${subject.maxMarks}`,
                subject.grade
            ];
            tableRows.push(rowData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 55,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] }, // Indigo color
            alternateRowStyles: { fillColor: [249, 250, 251] }
        });

        // Footer / Timestamp
        const date = new Date().toLocaleDateString();
        doc.setFontSize(8);
        doc.text(`Generated on: ${date}`, 14, doc.internal.pageSize.height - 10);

        doc.save(`grade_sheet_sem_${sem}.pdf`);
    };

    if (loading) {
        return (
            <Layout role="student">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout role="student">
                <div className="text-center p-8 bg-white rounded-xl shadow-sm">
                    <p className="text-rose-500 font-medium">{error}</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout role="student">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Marks & Results</h1>
                <p className="text-slate-600 dark:text-gray-400">View your academic performance and grade sheets</p>
            </div>

            {/* Profile & Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg md:col-span-2">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-indigo-100 text-sm font-medium mb-1">Student Profile</p>
                            <h2 className="text-2xl font-bold mb-1">{resultsData?.studentName}</h2>
                            <div className="flex flex-wrap gap-4 mt-4 text-sm text-indigo-100">
                                <div>
                                    <span className="opacity-70 block text-xs">Admission No.</span>
                                    <span className="font-semibold">{resultsData?.admissionNumber}</span>
                                </div>
                                <div>
                                    <span className="opacity-70 block text-xs">Department</span>
                                    <span className="font-semibold">{resultsData?.department}</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                            <Award className="text-white" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-600 dark:text-gray-400 text-sm">Overall CGPA</span>
                        <div className="p-2 bg-emerald-100 dark:bg-green-900/30 rounded-lg">
                            <TrendingUp className="text-emerald-600 dark:text-green-400" size={20} />
                        </div>
                    </div>
                    {/* Calculate Average CGPA for display if not provided by backend directly */}
                    {(() => {
                        const sems = resultsData?.results || [];
                        const avgCGPA = sems.length > 0
                            ? (sems.reduce((sum, s) => sum + parseFloat(s.sgpa), 0) / sems.length).toFixed(2)
                            : 'N/A';

                        return <div className="text-4xl font-bold text-slate-900 dark:text-white mt-2">{avgCGPA}</div>;
                    })()}
                    <p className="text-emerald-500 text-sm font-medium mt-1">Excellent Performance</p>
                </div>
            </div>

            {/* Semester Results */}
            <div className="space-y-4">
                {resultsData?.results && resultsData.results.length > 0 ? (
                    resultsData.results.map((semData) => (
                        <div key={semData.semester} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                            <div
                                onClick={() => toggleSem(semData.semester)}
                                className="p-6 flex items-center justify-between cursor-pointer hover:bg-white dark:hover:bg-slate-700/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-blue-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-blue-700 dark:text-blue-400">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">{semData.semester}</h3>
                                        <p className="text-sm text-slate-600 dark:text-gray-400">{semData.results.length} Courses Taken</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right hidden sm:block">
                                        <span className="block text-xs text-gray-400">SGPA</span>
                                        <span className="font-bold text-lg text-slate-900 dark:text-white">{semData.sgpa}</span>
                                    </div>
                                    {expandedSem === semData.semester ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>

                            {expandedSem === semData.semester && (
                                <div id={`grade-sheet-${semData.semester}`} className="px-6 pb-6 border-t border-gray-100 dark:border-slate-700 animate-fadeIn bg-white dark:bg-slate-800">
                                    <div className="flex justify-between items-center mt-6 mb-2">
                                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Semester Detail Report</h4>
                                        <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">
                                            SGPA: {semData.sgpa}
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="text-xs uppercase text-gray-400 border-b border-gray-100 dark:border-slate-700">
                                                    <th className="py-3 font-semibold">Course Code</th>
                                                    <th className="py-3 font-semibold">Subject</th>
                                                    <th className="py-3 font-semibold text-center">Credits</th>
                                                    <th className="py-3 font-semibold text-center">Marks</th>
                                                    <th className="py-3 font-semibold text-center">Grade</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-sm">
                                                {semData.results.map((subject, idx) => (
                                                    <tr key={idx} className="border-b border-gray-50 dark:border-slate-700 last:border-0 hover:bg-white dark:hover:bg-slate-700/30 transition-colors">
                                                        <td className="py-4 text-gray-600 dark:text-gray-300 font-medium">{subject.courseCode}</td>
                                                        <td className="py-4 text-slate-900 dark:text-white font-semibold">{subject.courseName} <span className="text-xs text-gray-400 font-normal ml-1">({subject.examType})</span></td>
                                                        <td className="py-4 text-center text-slate-600">{subject.credits}</td>
                                                        <td className="py-4 text-center">
                                                            <span className="text-slate-900 dark:text-white font-medium">{subject.marksObtained}</span>
                                                            <span className="text-gray-400 text-xs"> / {subject.maxMarks}</span>
                                                        </td>
                                                        <td className="py-4 text-center">
                                                            <span className={`inline-block px-2 py-1 rounded-md text-xs font-bold 
                                                                ${subject.grade === 'F' ? 'bg-rose-100 text-rose-600' :
                                                                    subject.grade.startsWith('A') || subject.grade === 'O' ? 'bg-emerald-100 text-emerald-600' :
                                                                        'bg-blue-100 text-blue-600'}`}>
                                                                {subject.grade}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="mt-6 flex justify-end no-print">
                                        <button
                                            onClick={() => downloadGradeSheet(semData.semester)}
                                            className="flex items-center gap-2 text-sm text-blue-700 hover:text-indigo-800 font-medium transition-colors bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg"
                                        >
                                            <Download size={16} />
                                            Download Grade Sheet PDF
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center">
                        <div className="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4 text-gray-400">
                            <FileText size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">No results found yet</h3>
                        <p className="text-slate-600 mt-1 max-w-sm mx-auto">Exam results have not been uploaded for your profile yet. Please check back later.</p>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Results;
