import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [department, setDepartment] = useState('Computer Science');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            const payload = isLogin ? { email, password } : { name, email, password, role, department };

            const res = await axios.post(`http://localhost:5000${endpoint}`, payload);
            const { _id, name: fetchedName, email: fetchedEmail, role: fetchedRole, token } = res.data;
            const userData = { _id, name: fetchedName, email: fetchedEmail, role: fetchedRole };

            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', token);
            localStorage.setItem('userRole', fetchedRole);
            localStorage.setItem('userName', fetchedName);

            if (fetchedRole === 'admin') navigate('/admin');
            else if (fetchedRole === 'student') navigate('/student');
            else if (fetchedRole === 'faculty') navigate('/faculty');

        } catch (err) {
            console.error('Login/Register error:', err);
            const message = err.response?.data?.message || err.message || (isLogin ? 'Login failed' : 'Registration failed');
            setError(message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-slate-700">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-gray-500 dark:text-slate-400 mt-2">
                        {isLogin ? 'Enter your credentials to access your account' : 'Fill in the details to get started'}
                    </p>
                </div>

                {error && <div className="bg-rose-50 dark:bg-red-900/30 text-rose-600 dark:text-red-400 p-3 rounded-lg mb-6 text-sm flex items-center justify-center border border-rose-100 dark:border-rose-800">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {!isLogin && (
                        <div>
                            <label className="block text-gray-700 dark:text-slate-300 text-sm font-bold mb-2">Full Name</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:text-white transition-all text-slate-900"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required={!isLogin}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-gray-700 dark:text-slate-300 text-sm font-bold mb-2">Email Address</label>
                        <input
                            type="email"
                            className="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:text-white transition-all text-slate-900"
                            placeholder="student@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 dark:text-slate-300 text-sm font-bold mb-2">Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:text-white transition-all text-slate-900"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {!isLogin && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 dark:text-slate-300 text-sm font-bold mb-2">Role</label>
                                <select
                                    className="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:text-white transition-all text-slate-900"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option value="student">Student</option>
                                    <option value="faculty">Faculty</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 dark:text-slate-300 text-sm font-bold mb-2">Unit / Department</label>
                                <select
                                    className="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:text-white transition-all text-slate-900 text-xs"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                >
                                    <option value="Computer Science">Computer Science</option>
                                    <option value="Electronic Engineering">Electronic Engineering</option>
                                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                                    <option value="Civil Engineering">Civil Engineering</option>
                                    <option value="Biotechnology">Biotechnology</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-amber-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                        {isLogin ? 'Sign In' : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-8 text-center pt-6 border-t border-gray-100 dark:border-slate-700">
                    <p className="text-gray-600 dark:text-slate-400">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError(null);
                            }}
                            className="text-teal-600 dark:text-teal-400 font-bold hover:underline"
                        >
                            {isLogin ? 'Register' : 'Login'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
