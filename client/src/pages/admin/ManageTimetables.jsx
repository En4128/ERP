import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Download, Clock, MapPin, Users, TriangleAlert, Trash2, Calendar, BookOpen, Building, X, Pencil } from 'lucide-react';
import { toast } from 'sonner';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical'];

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

    // New slot state
    const [newSlot, setNewSlot] = useState({
        courseCode: '',
        day: '',
        startTime: '',
        endTime: '',
        room: '',
        building: 'Main Block',
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

                const [coursesRes, scheduleRes, facultyRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/courses', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('http://localhost:5000/api/timetable', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('http://localhost:5000/api/admin/faculty', { headers: { Authorization: `Bearer ${token}` } })
                ]);

                // STRICT SAFETY CHECKS
                setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
                setSchedule(Array.isArray(scheduleRes.data) ? scheduleRes.data : []);
                setFacultyList(Array.isArray(facultyRes.data) ? facultyRes.data : []);

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

    // Filter schedule safely
    // Filter schedule safely
    const filteredSchedule = Array.isArray(schedule) ? schedule.filter(slot => {
        const deptMatch = slot?.department?.trim() === selectedDepartment?.trim();
        const semMatch = String(slot?.semester || '').trim() === String(selectedSemester).trim();

        // Final debug to see why it fails
        if (slot?.department && !deptMatch) {
            console.log(`DEPT MISMATCH: "${slot.department}" !== "${selectedDepartment}"`);
        }

        return deptMatch && semMatch;
    }) : [];

    const getSlotForCell = (day, time) => {
        return filteredSchedule.find(slot =>
            slot.day?.trim() === day?.trim() &&
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

        const clash = checkForClash(newSlot.day, newSlot.startTime, newSlot.room, newSlot.courseCode);
        if (clash) {
            setClashWarning(`Clash detected! ${clash.courseName} is already scheduled in ${clash.room} at ${clash.startTime}`);
            return;
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

            setNewSlot({ courseCode: '', day: '', startTime: '', endTime: '', room: '', building: 'Main Block', type: 'lecture', facultyId: '', assignToCourse: false });
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
            building: slot.building || 'Main Block',
            type: slot.type || 'lecture',
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

    const getTypeColor = (type) => {
        switch (type) {
            case 'lecture': return 'bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400';
            case 'lab': return 'bg-purple-100 border-purple-200 text-purple-700 dark:bg-purple-900/30 dark:border-purple-800 dark:text-purple-400';
            case 'tutorial': return 'bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400';
            default: return 'bg-gray-100 border-gray-200 text-gray-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400';
        }
    };

    if (loading) {
        return <div className="p-10 text-center text-slate-500">Loading timetable data...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Timetable Management</h1>
                    <p className="text-slate-600 dark:text-slate-400">Create and manage class schedules with clash detection</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm">
                        <Download className="h-4 w-4" /> Export PDF
                    </button>
                    <button
                        onClick={() => setIsAddDialogOpen(true)}
                        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-all shadow-md active:scale-95"
                    >
                        <Plus className="h-4 w-4" /> Add Slot
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                        <select
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {departments.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                        <select
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(e.target.value)}
                            className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                <option key={s} value={s.toString()}>Semester {s}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-semibold">Lecture</span>
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs font-semibold">Lab</span>
                        <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded text-xs font-semibold">Tutorial</span>
                    </div>
                </div>
                {/* Visual Debug info */}
                <div className="mt-2 text-[10px] text-slate-400 select-none">
                    Diagnostics: Loaded: {schedule.length} | Shown: {filteredSchedule.length} | Dept: "{selectedDepartment}" | Sem: "{selectedSemester}"
                </div>
            </div>

            {/* Timetable Grid */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
                <div className="p-6 border-b border-gray-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-slate-50">
                        <Calendar className="h-5 w-5 text-indigo-500" />
                        Weekly Schedule - {selectedDepartment} (Semester {selectedSemester})
                    </h3>
                </div>
                <div className="p-6">
                    <div className="overflow-x-auto">
                        <div className="min-w-[900px]">
                            {/* Header Row */}
                            <div className="grid grid-cols-7 gap-2 mb-2">
                                <div className="p-3 text-center font-semibold text-slate-500 dark:text-slate-400 text-sm">Time</div>
                                {days.map(day => (
                                    <div key={day} className="p-3 text-center font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Time Slots */}
                            {periods.map((period) => (
                                <div key={period.time} className="grid grid-cols-7 gap-2 mb-2">
                                    <div className="p-3 text-center text-sm font-medium text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center">
                                        <Clock className="h-3 w-3 mb-1" />
                                        <span>{period.time}</span>
                                        <span className="text-[10px] opacity-60">to {period.endTime}</span>
                                    </div>

                                    {period.type === 'break' ? (
                                        <div className="col-span-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-dashed">
                                            {period.label}
                                        </div>
                                    ) : (
                                        days.map(day => {
                                            const slot = getSlotForCell(day, period.time);
                                            return (
                                                <div key={`${day}-${period.time}`} className="min-h-[80px]">
                                                    {slot ? (
                                                        <div className={`h-full p-2 rounded-lg border-l-4 group relative transition-all hover:shadow-md ${getTypeColor(slot.type)}`}>
                                                            <div className="flex items-start justify-between">
                                                                <span className="text-xs font-mono font-bold opacity-80">{slot.courseCode}</span>
                                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button
                                                                        className="h-6 w-6 text-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded flex items-center justify-center transition-colors"
                                                                        onClick={() => handleEditSlot(slot)}
                                                                        title="Edit Slot"
                                                                    >
                                                                        <Pencil className="h-3 w-3" />
                                                                    </button>
                                                                    <button
                                                                        className="h-6 w-6 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded flex items-center justify-center transition-colors"
                                                                        onClick={() => handleDeleteSlot(slot.id)}
                                                                        title="Delete Slot"
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <p className="text-xs font-bold mt-1 line-clamp-1">{slot.courseName}</p>
                                                            <div className="flex flex-col gap-0.5 mt-1.5 opacity-80">
                                                                <div className="flex items-center gap-1 text-[10px]">
                                                                    <MapPin className="h-2.5 w-2.5 text-indigo-500" />
                                                                    <span>{slot.building} - {slot.room}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1 text-[10px]">
                                                                    <Users className="h-2.5 w-2.5 text-teal-500" />
                                                                    <span className="truncate">{slot.faculty}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="h-full bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 opacity-50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors" />
                                                    )}
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
            {isAddDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">{isEditing ? 'Edit Time Slot' : 'Add Time Slot'}</h3>
                            <button onClick={() => { setIsAddDialogOpen(false); setClashWarning(null); setIsEditing(false); setCurrentSlotId(null); setNewSlot({ courseCode: '', day: '', startTime: '', endTime: '', room: '', building: 'Main Block', type: 'lecture', facultyId: '' }); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {clashWarning && (
                                <div className="flex items-center gap-2 bg-rose-50 text-rose-600 p-3 rounded-lg text-sm border border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900/50">
                                    <TriangleAlert size={18} />
                                    {clashWarning}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">COURSE *</label>
                                <select
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={newSlot.courseCode}
                                    onChange={(e) => { setNewSlot(prev => ({ ...prev, courseCode: e.target.value })); setClashWarning(null); }}
                                >
                                    <option value="">Select course</option>
                                    {Array.isArray(courses) && courses
                                        .filter(c =>
                                            c.department?.trim() === selectedDepartment?.trim() &&
                                            String(c.semester || '').trim() === String(selectedSemester).trim()
                                        )
                                        .map(c => (
                                            <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                                        ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">DAY *</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={newSlot.day}
                                        onChange={(e) => { setNewSlot(prev => ({ ...prev, day: e.target.value })); setClashWarning(null); }}
                                    >
                                        <option value="">Select day</option>
                                        {days.map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">ROOM *</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
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

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">BUILDING *</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={newSlot.building}
                                        onChange={(e) => { setNewSlot(prev => ({ ...prev, building: e.target.value })); setClashWarning(null); }}
                                    >
                                        <option value="Main Block">Main Block</option>
                                        <option value="Lab Complex">Lab Complex</option>
                                        <option value="Administrative Block">Administrative Block</option>
                                        <option value="Auditorium">Auditorium</option>
                                        <option value="Library">Library</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">FACULTY (OPTIONAL)</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={newSlot.facultyId}
                                        onChange={(e) => { setNewSlot(prev => ({ ...prev, facultyId: e.target.value })); }}
                                    >
                                        <option value="">Default ({getCourseFaculty()})</option>
                                        {facultyList.length > 0 ? (
                                            facultyList.map(f => (
                                                <option key={f._id} value={f._id}>
                                                    {f.user?.name || 'Unknown Faculty'} — {f.designation || 'Faculty'} ({f.department})
                                                </option>
                                            ))
                                        ) : (
                                            <option disabled>No other faculty available</option>
                                        )}
                                    </select>
                                </div>
                            </div>

                            {newSlot.facultyId && (
                                <div className="flex items-center gap-2 mt-2 px-1">
                                    <input
                                        type="checkbox"
                                        id="assignToCourse"
                                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        checked={newSlot.assignToCourse}
                                        onChange={(e) => setNewSlot(prev => ({ ...prev, assignToCourse: e.target.checked }))}
                                    />
                                    <label htmlFor="assignToCourse" className="text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
                                        Assign this faculty as default for {newSlot.courseCode} globally
                                    </label>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">START TIME *</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={newSlot.startTime}
                                        onChange={(e) => { setNewSlot(prev => ({ ...prev, startTime: e.target.value })); setClashWarning(null); }}
                                    >
                                        <option value="">Starts at</option>
                                        {periods.filter(p => p.type === 'class').map(p => (
                                            <option key={p.time} value={p.time}>{p.time}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">END TIME *</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={newSlot.endTime}
                                        onChange={(e) => setNewSlot(prev => ({ ...prev, endTime: e.target.value }))}
                                    >
                                        <option value="">Ends at</option>
                                        {periods.filter(p => p.type === 'class').map(p => (
                                            <option key={p.endTime} value={p.endTime}>{p.endTime}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">TYPE</label>
                                <select
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={newSlot.type}
                                    onChange={(e) => setNewSlot(prev => ({ ...prev, type: e.target.value }))}
                                >
                                    <option value="lecture">Lecture</option>
                                    <option value="lab">Lab</option>
                                    <option value="tutorial">Tutorial</option>
                                </select>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3">
                            <button
                                onClick={() => { setIsAddDialogOpen(false); setClashWarning(null); }}
                                className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddSlot}
                                className="px-6 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
                            >
                                {isEditing ? 'Save Changes' : 'Add Slot'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageTimetables;
