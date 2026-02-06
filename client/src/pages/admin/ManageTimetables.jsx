import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Download, Clock, MapPin, Users, TriangleAlert, Trash2, Calendar, BookOpen, Building, X, Pencil, Layout, Monitor } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';


const defaultDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Define periods including breaks
const periods = [
    { time: '9:00 AM', endTime: '10:00 AM', type: 'class' },
    { time: '10:00 AM', endTime: '11:00 AM', type: 'class' },
    { time: '11:00 AM', endTime: '11:30 AM', type: 'break', label: 'Morning Break' },
    { time: '11:30 AM', endTime: '12:30 PM', type: 'class' },
    { time: '12:30 PM', endTime: '1:30 PM', type: 'class' },
    { time: '1:30 PM', endTime: '2:30 PM', type: 'break', label: 'Lunch Break' },
    { time: '2:30 PM', endTime: '3:30 PM', type: 'class' },
    { time: '3:30 PM', endTime: '4:30 PM', type: 'class' },
];

const rooms = ['Room 101', 'Room 102', 'Room 201', 'Room 205', 'Room 301', 'Lab 101', 'Lab 102', 'Lab 201'];
const buildings = ['FSH 1', 'FSH 2', 'Tech park 1', 'Tech park 2', 'UB'];
const departments = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Business', 'CDC'];


const ManageTimetables = () => {
    const [schedule, setSchedule] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('Computer Science');
    const [selectedSemester, setSelectedSemester] = useState('1');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [clashWarning, setClashWarning] = useState(null);
    const [loading, setLoading] = useState(true);
    const [facultyList, setFacultyList] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentSlotId, setCurrentSlotId] = useState(null);
    const [workingDays, setWorkingDays] = useState(6); // Default to 6 since Saturday was added
    const [saturdayMapping, setSaturdayMapping] = useState('None');
    const [isSettingsLoading, setIsSettingsLoading] = useState(false);

    const days = defaultDays.slice(0, workingDays);

    // New slot state
    const [newSlot, setNewSlot] = useState({
        courseCode: '',
        day: '',
        startTime: '',
        endTime: '',
        room: '',
        building: buildings[0],
        type: 'lecture',
        facultyId: '',
        assignToCourse: false
    });

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    toast.error("Authentication token missing");
                    return;
                }

                const [coursesRes, scheduleRes, facultyRes, configRes, mappingRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/courses', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('http://localhost:5000/api/timetable', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('http://localhost:5000/api/admin/faculty', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('http://localhost:5000/api/admin/settings/workingDays', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { value: 6 } })),
                    axios.get('http://localhost:5000/api/admin/settings/saturdayMapping', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { value: 'None' } }))
                ]);

                // STRICT SAFETY CHECKS
                setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
                setSchedule(Array.isArray(scheduleRes.data) ? scheduleRes.data : []);
                setFacultyList(Array.isArray(facultyRes.data) ? facultyRes.data : []);
                setWorkingDays(configRes.data?.value || 6);
                setSaturdayMapping(mappingRes.data?.value || 'None');

                console.log('DEBUG: Courses fetched:', coursesRes.data);
                console.log('DEBUG: Schedule fetched:', scheduleRes.data);

                setLoading(false);

            } catch (error) {
                console.error("Error fetching data:", error);
                setCourses([]);
                setSchedule([]);
                setLoading(false);

                if (error.response?.status === 401) {
                    toast.error("Session expired. Please login again.");
                } else {
                    toast.error("Failed to load timetable data");
                }
            }
        };
        fetchData();
    }, []);

    const toggleWorkingDays = async (val) => {
        setIsSettingsLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/admin/settings',
                { key: 'workingDays', value: val, description: 'Number of working days in a week' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setWorkingDays(val);
            toast.success(`Schedule set to ${val} working days`);
        } catch (error) {
            toast.error("Failed to update schedule settings");
        } finally {
            setIsSettingsLoading(false);
        }
    };

    const updateSaturdayMapping = async (val) => {
        setIsSettingsLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/admin/settings',
                { key: 'saturdayMapping', value: val, description: 'Day mapping for Saturday' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSaturdayMapping(val);
            toast.success(`Saturday mapped to ${val}`);
        } catch (error) {
            toast.error("Failed to update Saturday mapping");
        } finally {
            setIsSettingsLoading(false);
        }
    };

    // Filter schedule safely
    // Filter schedule safely
    const filteredSchedule = Array.isArray(schedule) ? schedule.filter(slot => {
        const deptMatch = slot?.department?.trim() === selectedDepartment?.trim() || slot?.department?.trim() === 'CDC';
        const semMatch = String(slot?.semester || '').trim() === String(selectedSemester).trim();

        // Final debug to see why it fails
        if (slot?.department && !deptMatch) {
            console.log(`DEPT MISMATCH: "${slot.department}" !== "${selectedDepartment}"`);
        }

        return deptMatch && semMatch;
    }) : [];

    const getSlotForCell = (day, time) => {
        const effectiveDay = (day === 'Saturday' && saturdayMapping !== 'None') ? saturdayMapping : day;
        return filteredSchedule.find(slot =>
            slot.day?.trim() === effectiveDay?.trim() &&
            slot.startTime?.trim() === time?.trim()
        );
    };

    const checkForClash = (day, time, room, courseCode) => {
        if (!Array.isArray(schedule)) return null;
        return schedule.find(slot =>
            slot.day === day &&
            slot.startTime === time &&
            (slot.room === room || slot.courseCode === courseCode)
        );
    };

    const getCourseFaculty = () => {
        const course = courses.find(c => c.code === newSlot.courseCode);
        return course?.assignedFaculty?.user?.name || 'Unassigned';
    };

    const handleAddSlot = async () => {
        if (!Array.isArray(courses)) {
            toast.error("Courses data is invalid");
            return;
        }

        const course = courses.find(c => c.code === newSlot.courseCode);
        if (!course) {
            toast.error('Please select a valid course');
            return;
        }

        // Only check for clash if NOT editing, or suppress it if user wants "not to show any errors"
        if (!isEditing) {
            const clash = checkForClash(newSlot.day, newSlot.startTime, newSlot.room, newSlot.courseCode);
            if (clash) {
                setClashWarning(`Clash detected! ${clash.courseName} is already scheduled in ${clash.room} at ${clash.startTime}`);
                return;
            }
        }

        try {
            const token = localStorage.getItem('token');
            if (isEditing) {
                const res = await axios.put(`http://localhost:5000/api/timetable/${currentSlotId}`, newSlot, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSchedule(prev => prev.map(s => s.id === currentSlotId ? res.data : s));
                toast.success('Time slot updated successfully!');
            } else {
                const res = await axios.post('http://localhost:5000/api/timetable', newSlot, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSchedule(prev => [...prev, res.data]);
                toast.success('Time slot added successfully!');
            }

            // Refresh courses to reflect any faculty assignment changes
            const coursesRes = await axios.get('http://localhost:5000/api/courses', { headers: { Authorization: `Bearer ${token}` } });
            setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);

            setNewSlot({ courseCode: '', day: '', startTime: '', endTime: '', room: '', building: buildings[0], type: 'CLASS', facultyId: '', assignToCourse: false });
            setClashWarning(null);
            setIsAddDialogOpen(false);
            setIsEditing(false);
            setCurrentSlotId(null);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to save slot');
        }
    };

    const handleEditSlot = (slot) => {
        setNewSlot({
            courseCode: slot.courseCode,
            day: slot.day,
            startTime: slot.startTime,
            endTime: slot.endTime,
            room: slot.room,
            building: slot.building || buildings[0],
            type: slot.type || 'CLASS',
            facultyId: slot.facultyId || '',
            assignToCourse: false
        });
        setCurrentSlotId(slot.id);
        setIsEditing(true);
        setIsAddDialogOpen(true);
    };

    const handleDeleteSlot = async (slotId) => {
        if (!window.confirm("Are you sure you want to remove this slot?")) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/timetable/${slotId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSchedule(prev => prev.filter(s => s.id !== slotId));
            toast.success('Time slot removed');
        } catch (error) {
            console.error(error);
            toast.error('Failed to remove slot');
        }
    };

    const handleExportPDF = () => {
        const doc = new jsPDF('l', 'mm', 'a4');

        // Header
        doc.setFontSize(18);
        doc.setTextColor(40, 40, 40);
        doc.text(`Weekly Timetable - ${selectedDepartment} (Semester ${selectedSemester})`, 14, 22);

        const date = new Date().toLocaleDateString();
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${date}`, 14, 28);

        // Table Columns
        const tableColumn = ["Time", ...days];

        // Table Body
        const tableRows = [];

        periods.forEach(period => {
            const row = [];

            // Time Column
            row.push(`${period.time}\n-\n${period.endTime}`);

            if (period.type === 'break') {
                // For breaks, we want a single cell spanning the days
                // automtable hook will handle colSpan via didParseCell or by manipulating data
                // Simpler approach for basic data: push the label in the first day column and use styling/hooks to span
                // Alternatively, we can just push empty strings and use a hook to merge.
                // Best simple way with autoTable:
                const breakLabel = { content: period.label, colSpan: workingDays, styles: { halign: 'center', fontStyle: 'bold', fillColor: [240, 240, 240] } };
                row.push(breakLabel);
            } else {
                // For class periods, iterate days
                days.forEach(day => {
                    const slot = getSlotForCell(day, period.time);
                    if (slot) {
                        const cellContent = `${slot.courseCode}\n${slot.room}\n${slot.faculty ? slot.faculty.split(' ')[0] : 'N/A'}`;
                        row.push(cellContent);
                    } else {
                        row.push("");
                    }
                });
            }
            tableRows.push(row);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 35,
            theme: 'grid',
            headStyles: {
                fillColor: [79, 70, 229],
                halign: 'center',
                valign: 'middle'
            },
            styles: {
                fontSize: 9,
                cellPadding: 3,
                valign: 'middle',
                halign: 'center',
                overflow: 'linebreak'
            },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 30 } // Time column
            },
            didParseCell: (data) => {
                // Add custom styling for break rows if not using the object config above
            }
        });

        doc.save(`timetable-${selectedDepartment}-sem-${selectedSemester}.pdf`);
        toast.success('Timetable exported as PDF');
    };

    const getTypeColor = (type) => {
        switch (type?.toUpperCase()) {
            case 'CLASS': return 'bg-white/50 dark:bg-slate-800/50 border-blue-500/30 text-blue-700 dark:text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.1)]';
            case 'LAB': return 'bg-white/50 dark:bg-slate-800/50 border-purple-500/30 text-purple-700 dark:text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.1)]';
            default: return 'bg-white/50 dark:bg-slate-800/50 border-slate-300/30 text-slate-700 dark:text-slate-300';
        }
    };


    if (loading) {
        return <div className="p-10 text-center text-slate-500">Loading timetable data...</div>;
    }

    return (
        <div className="p-4 sm:p-8 space-y-8 bg-slate-50/50 dark:bg-transparent min-h-screen">
            {/* Header with Stats */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 mb-2"
                    >
                        <div className="p-2 bg-indigo-500 rounded-lg shadow-lg shadow-indigo-500/30">
                            <Layout className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            Timetable <span className="text-indigo-500">Master</span>
                        </h1>
                    </motion.div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium ml-11">
                        Symphony of scheduling and clash-free coordination
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex gap-4 px-6 py-3 bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Classes</p>
                            <p className="text-xl font-black text-indigo-500">{filteredSchedule.filter(s => s.type === 'CLASS').length}</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 self-center" />
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Labs</p>
                            <p className="text-xl font-black text-purple-500">{filteredSchedule.filter(s => s.type === 'LAB').length}</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 self-center" />
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rooms</p>
                            <p className="text-xl font-black text-teal-500">{new Set(filteredSchedule.map(s => s.room)).size}</p>
                        </div>
                    </div>

                    <div className="flex items-center p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                        <button
                            onClick={() => toggleWorkingDays(5)}
                            disabled={isSettingsLoading}
                            className={cn(
                                "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                                workingDays === 5
                                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            5 Days
                        </button>
                        <button
                            onClick={() => toggleWorkingDays(6)}
                            disabled={isSettingsLoading}
                            className={cn(
                                "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                                workingDays === 6
                                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            6 Days
                        </button>
                    </div>

                    {workingDays === 6 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Sat follows</span>
                            <select
                                value={saturdayMapping}
                                onChange={(e) => updateSaturdayMapping(e.target.value)}
                                disabled={isSettingsLoading}
                                className="bg-transparent border-none text-[10px] font-black text-indigo-500 uppercase tracking-widest focus:ring-0 cursor-pointer"
                            >
                                <option value="None">None</option>
                                <option value="Monday">Monday</option>
                                <option value="Tuesday">Tuesday</option>
                                <option value="Wednesday">Wednesday</option>
                                <option value="Thursday">Thursday</option>
                                <option value="Friday">Friday</option>
                            </select>
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExportPDF}
                            className="group flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 hover:border-indigo-500 hover:text-indigo-500 dark:hover:border-indigo-500 transition-all shadow-sm active:scale-95"
                        >
                            <Download className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
                            <span className="font-bold text-sm">Download PDF</span>
                        </button>
                        <button
                            onClick={() => setIsAddDialogOpen(true)}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95 font-bold"
                        >
                            <Plus className="h-5 w-5" /> Add New Slot
                        </button>
                    </div>
                </div>
            </div>

            {/* Config & Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-2 shadow-xl border border-white dark:border-slate-800 flex flex-wrap items-center gap-2"
            >
                <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200/50 dark:border-slate-800">
                    <Building className="h-4 w-4 ml-2 text-slate-400" />
                    <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="bg-transparent pr-8 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                    >
                        {departments.map(d => (
                            <option key={d} value={d} className="bg-white dark:bg-slate-900">{d}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200/50 dark:border-slate-800">
                    <BookOpen className="h-4 w-4 ml-2 text-slate-400" />
                    <select
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        className="bg-transparent pr-8 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                            <option key={s} value={s.toString()} className="bg-white dark:bg-slate-900">Semester {s}</option>
                        ))}
                    </select>
                </div>

                <div className="ml-auto hidden sm:flex items-center gap-4 px-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Class</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Laboratory</span>
                    </div>
                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
                    <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px]">
                        <Monitor className="h-3 w-3" />
                        <span>{filteredSchedule.length} Slots</span>
                    </div>
                </div>
            </motion.div>

            {/* Timetable Grid */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900/40 backdrop-blur-sm">
                <div className="overflow-x-auto scrollbar-hide pb-4">
                    <div className="min-w-[1000px] p-6">
                        {/* Day Headers */}
                        <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `repeat(${workingDays + 1}, minmax(0, 1fr))` }}>
                            <div className="flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Timeline</span>
                            </div>
                            {days.map((day, idx) => (
                                <motion.div
                                    key={day}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-center"
                                >
                                    <span className="text-sm font-black text-slate-700 dark:text-slate-100 uppercase tracking-tight">{day}</span>
                                </motion.div>
                            ))}
                        </div>

                        {/* Periods */}
                        <div className="space-y-4">
                            {periods.map((period, pIdx) => (
                                <div key={period.time} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${workingDays + 1}, minmax(0, 1fr))` }}>
                                    <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                        <span className="text-xs font-black text-indigo-500">{period.time}</span>
                                        <div className="w-6 h-px bg-slate-200 dark:bg-slate-800 my-1" />
                                        <span className="text-[10px] font-bold text-slate-400">{period.endTime}</span>
                                    </div>

                                    {period.type === 'break' ? (
                                        <div
                                            className="flex items-center justify-center relative p-4 group overflow-hidden bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700"
                                            style={{ gridColumn: `span ${workingDays}` }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200/30 dark:via-slate-700/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                            <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] z-10">{period.label}</span>
                                        </div>
                                    ) : (
                                        days.map((day, dIdx) => {
                                            const slot = getSlotForCell(day, period.time);
                                            return (
                                                <div key={`${day}-${period.time}`} className="min-h-[110px]">
                                                    <AnimatePresence mode="wait">
                                                        {slot ? (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.95 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.95 }}
                                                                className={`h-full p-4 rounded-2xl border backdrop-blur-xl group relative transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${getTypeColor(slot.type)}`}
                                                            >
                                                                <div className="flex items-start justify-between mb-3">
                                                                    <div className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter ${slot.type === 'CLASS' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}>
                                                                        {slot.courseCode}
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                                                                        <button
                                                                            className="h-7 w-7 bg-white dark:bg-slate-900 text-indigo-500 hover:text-white hover:bg-indigo-500 rounded-lg flex items-center justify-center transition-all shadow-sm"
                                                                            onClick={() => handleEditSlot(slot)}
                                                                        >
                                                                            <Pencil className="h-3.5 w-3.5" />
                                                                        </button>
                                                                        <button
                                                                            className="h-7 w-7 bg-white dark:bg-slate-900 text-rose-500 hover:text-white hover:bg-rose-500 rounded-lg flex items-center justify-center transition-all shadow-sm"
                                                                            onClick={() => handleDeleteSlot(slot.id)}
                                                                        >
                                                                            <Trash2 className="h-3.5 w-3.5" />
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 leading-tight mb-3 line-clamp-2 uppercase tracking-tight">
                                                                    {slot.courseName}
                                                                </h4>

                                                                <div className="space-y-1.5 pt-3 border-t border-slate-200/30 dark:border-slate-700/30">
                                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                                                        <MapPin className="h-3 w-3 text-indigo-500" />
                                                                        <span>{slot.building} <span className="text-indigo-400">•</span> {slot.room}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                                                        <Users className="h-3 w-3 text-teal-500" />
                                                                        <span className="truncate">{slot.faculty}</span>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        ) : (
                                                            <motion.div
                                                                whileHover={{ backgroundColor: "rgba(241, 245, 249, 0.5)" }}
                                                                className="h-full bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 transition-colors flex items-center justify-center group"
                                                            >
                                                                <Plus className="h-4 w-4 text-slate-200 dark:text-slate-800 group-hover:text-slate-400 dark:group-hover:text-slate-600 transition-colors" />
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Slot Modal */}
            <AnimatePresence>
                {isAddDialogOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setIsAddDialogOpen(false); setClashWarning(null); setIsEditing(false); }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden relative z-10 border border-white dark:border-slate-800"
                        >
                            <div className="p-8 pb-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                        {isEditing ? 'Modify' : 'Create'} <span className="text-indigo-500">Slot</span>
                                    </h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Configure your timing & location</p>
                                </div>
                                <button
                                    onClick={() => { setIsAddDialogOpen(false); setClashWarning(null); setIsEditing(false); setCurrentSlotId(null); setNewSlot({ courseCode: '', day: '', startTime: '', endTime: '', room: '', building: buildings[0], type: 'CLASS', facultyId: '' }); }}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-8 pt-6 space-y-6 overflow-y-auto max-h-[calc(90vh-160px)] custom-scrollbar">
                                {clashWarning && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        className="flex items-center gap-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/50 text-sm font-bold shadow-sm"
                                    >
                                        <div className="p-1.5 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                                            <TriangleAlert size={18} />
                                        </div>
                                        {clashWarning}
                                    </motion.div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Assigned Course</label>
                                        <div className="relative">
                                            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <select
                                                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 focus:ring-4 focus:ring-indigo-500/10 outline-none appearance-none font-bold text-sm transition-all"
                                                value={newSlot.courseCode}
                                                onChange={(e) => { setNewSlot(prev => ({ ...prev, courseCode: e.target.value })); setClashWarning(null); }}
                                            >
                                                <option value="">Select a course</option>
                                                {Array.isArray(courses) && courses
                                                    .filter(c =>
                                                        (c.department?.trim() === selectedDepartment?.trim() ||
                                                            c.department?.trim() === 'CDC') &&
                                                        String(c.semester || '').trim() === String(selectedSemester).trim()
                                                    )
                                                    .map(c => (
                                                        <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                                                    ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Day of Week</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <select
                                                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 focus:ring-4 focus:ring-indigo-500/10 outline-none appearance-none font-bold text-sm transition-all"
                                                value={newSlot.day}
                                                onChange={(e) => { setNewSlot(prev => ({ ...prev, day: e.target.value })); setClashWarning(null); }}
                                            >
                                                <option value="">Select day</option>
                                                {days.map(d => (
                                                    <option key={d} value={d}>{d}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Building</label>
                                        <div className="relative">
                                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <select
                                                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 focus:ring-4 focus:ring-indigo-500/10 outline-none appearance-none font-bold text-sm transition-all"
                                                value={newSlot.building}
                                                onChange={(e) => { setNewSlot(prev => ({ ...prev, building: e.target.value })); setClashWarning(null); }}
                                            >
                                                {buildings.map(b => (
                                                    <option key={b} value={b}>{b}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Room Number</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <select
                                                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 focus:ring-4 focus:ring-indigo-500/10 outline-none appearance-none font-bold text-sm transition-all"
                                                value={newSlot.room}
                                                onChange={(e) => { setNewSlot(prev => ({ ...prev, room: e.target.value })); setClashWarning(null); }}
                                            >
                                                <option value="">Select room</option>
                                                {rooms.map(r => (
                                                    <option key={r} value={r}>{r}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Faculty Assignment</label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <select
                                            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 focus:ring-4 focus:ring-indigo-500/10 outline-none appearance-none font-bold text-sm transition-all"
                                            value={newSlot.facultyId}
                                            onChange={(e) => { setNewSlot(prev => ({ ...prev, facultyId: e.target.value })); }}
                                        >
                                            <option value="">Default Faculty ({getCourseFaculty()})</option>
                                            {facultyList.map(f => (
                                                <option key={f._id} value={f._id}>
                                                    {f.user?.name} — {f.department}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {newSlot.facultyId && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex items-center gap-2 mt-3 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl"
                                        >
                                            <input
                                                type="checkbox"
                                                id="assignGlobal"
                                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-4 focus:ring-indigo-500/20"
                                                checked={newSlot.assignToCourse}
                                                onChange={(e) => setNewSlot(prev => ({ ...prev, assignToCourse: e.target.checked }))}
                                            />
                                            <label htmlFor="assignGlobal" className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter">
                                                Update Global Course Faculty Assignment
                                            </label>
                                        </motion.div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Start Time</label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <select
                                                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 focus:ring-4 focus:ring-indigo-500/10 outline-none appearance-none font-bold text-sm transition-all"
                                                value={newSlot.startTime}
                                                onChange={(e) => { setNewSlot(prev => ({ ...prev, startTime: e.target.value })); setClashWarning(null); }}
                                            >
                                                <option value="">Starts</option>
                                                {periods.filter(p => p.type === 'class').map(p => (
                                                    <option key={p.time} value={p.time}>{p.time}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">End Time</label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <select
                                                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 focus:ring-4 focus:ring-indigo-500/10 outline-none appearance-none font-bold text-sm transition-all"
                                                value={newSlot.endTime}
                                                onChange={(e) => setNewSlot(prev => ({ ...prev, endTime: e.target.value }))}
                                            >
                                                <option value="">Ends</option>
                                                {periods.filter(p => p.type === 'class').map(p => (
                                                    <option key={p.endTime} value={p.endTime}>{p.endTime}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Session Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['CLASS', 'LAB'].map(t => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => setNewSlot(prev => ({ ...prev, type: t }))}
                                                className={`py-3 rounded-2xl font-black text-xs transition-all border ${newSlot.type === t
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/30'
                                                    : 'bg-white dark:bg-slate-950 text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'}`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex gap-4">
                                <button
                                    onClick={() => { setIsAddDialogOpen(false); setClashWarning(null); }}
                                    className="flex-1 py-4 rounded-2xl text-sm font-black text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition-all uppercase tracking-widest border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddSlot}
                                    className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white text-sm font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] uppercase tracking-widest"
                                >
                                    {isEditing ? 'Update Session' : 'Add Session'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageTimetables;
