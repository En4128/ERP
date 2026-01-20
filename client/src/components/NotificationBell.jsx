import { useState } from 'react';
import { Bell } from 'lucide-react';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([
        { id: 1, text: 'Welcome to the new ERP!', read: false },
        { id: 2, text: 'Complete your profile.', read: false }
    ]);
    const [isOpen, setIsOpen] = useState(false);

    const unreadCount = notifications.filter(n => !n.read).length;

    const toggle = () => setIsOpen(!isOpen);

    const markAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    return (
        <div className="relative">
            <button onClick={toggle} className="relative p-2 rounded-full hover:bg-gray-100 transition">
                <Bell className="text-gray-600" size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                        <h3 className="font-semibold text-gray-800">Notifications</h3>
                        <button onClick={markAsRead} className="text-xs text-blue-600 hover:text-blue-800">Mark all read</button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">No notifications</div>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} className={`p-4 border-b last:border-0 hover:bg-gray-50 ${!n.read ? 'bg-blue-50' : ''}`}>
                                    <p className="text-sm text-gray-800">{n.text}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
