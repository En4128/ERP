import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Search, UserPlus, Edit2, X, AlertCircle } from 'lucide-react';

const ManageStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [error, setError] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        admissionNumber: '',
        department: '',
        sem: 1,
        section: ''
    });

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/admin/students', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching students:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            admissionNumber: '',
            department: '',
            sem: 1,
            section: ''
        });
        setEditingStudent(null);
        setError('');
    };

    const handleEdit = (student) => {
        setEditingStudent(student);
        setFormData({
            name: student.user?.name || '',
            email: student.user?.email || '',
            password: '', // Keep empty for edits
            admissionNumber: student.admissionNumber || '',
            department: student.department || '',
            sem: student.sem || 1,
            section: student.section || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const url = editingStudent
                ? `http://localhost:5000/api/admin/students/${editingStudent._id}`
                : 'http://localhost:5000/api/admin/students';
            const method = editingStudent ? 'put' : 'post';

            const payload = { ...formData };
            if (editingStudent && !payload.password) delete payload.password;

            await axios[method](url, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            await fetchStudents();
            setShowModal(false);
            resetForm();
        } catch (error) {
            setError(error.response?.data?.message || 'Something went wrong');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this student and their account?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/admin/students/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(students.filter(student => student._id !== id));
        } catch (error) {
            console.error('Error deleting student:', error);
            alert('Failed to delete student');
        }
    };

    const filteredStudents = students.filter(student =>
        student.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.admissionNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center text-slate-600">Loading students...</div>;

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Manage Students</h2>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-indigo-200 dark:hover:shadow-indigo-900/30"
                    >
                        <UserPlus size={18} />
                        Add Student
                    </button>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search name or ID..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-slate-800">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-slate-400">Name</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-slate-400">Admission No</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-slate-400">Dept & Sem</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                            {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                                <tr key={student._id} className="hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900 dark:text-slate-50">{student.user?.name}</div>
                                        <div className="text-xs text-slate-600 dark:text-slate-500">{student.user?.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs font-mono">{student.admissionNumber || 'N/A'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                                        <div className="dark:text-slate-300">{student.department || 'N/A'}</div>
                                        <div className="text-xs text-gray-400 dark:text-slate-500">Semester {student.sem || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEdit(student)}
                                                className="text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 p-2 rounded-lg transition-colors"
                                                title="Edit Student"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(student._id)}
                                                className="text-rose-500 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/30 p-2 rounded-lg transition-colors"
                                                title="Delete Student"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-400 dark:text-slate-500 uppercase text-xs tracking-wider">No students found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-slate-800">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-800">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                                {editingStudent ? 'Edit Student' : 'Add New Student'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-3 rounded-lg text-sm border border-rose-100 dark:border-rose-900/50">
                                    <AlertCircle size={18} />
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">FULL NAME</label>
                                    <input
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">EMAIL ADDRESS</label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                {!editingStudent && (
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">PASSWORD</label>
                                        <input
                                            required
                                            type="password"
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">ADMISSION NO</label>
                                    <input
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        placeholder="STU001"
                                        value={formData.admissionNumber}
                                        onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">DEPARTMENT</label>
                                    <select
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    >
                                        <option value="">Select Department</option>
                                        <option value="Computer Science">Computer Science</option>
                                        <option value="Information Technology">Information Technology</option>
                                        <option value="Electronics">Electronics</option>
                                        <option value="Mechanical">Mechanical</option>
                                        <option value="Civil">Civil</option>
                                        <option value="Business">Business</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">SEMESTER</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={formData.sem}
                                        onChange={(e) => setFormData({ ...formData, sem: parseInt(e.target.value) })}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">SECTION (OPTIONAL)</label>
                                    <input
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        placeholder="A"
                                        value={formData.section}
                                        onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={formLoading}
                                className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-400 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-indigo-200 dark:hover:shadow-indigo-900/30 active:scale-[0.98]"
                            >
                                {formLoading ? 'Saving...' : editingStudent ? 'Update Student' : 'Save Student'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageStudents;
