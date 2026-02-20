/* eslint-disable no-undef */
// Service Worker for LearNex Push Notifications

const CACHE_NAME = 'learnex-push-v1';

self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function (event) {
    console.log('[Service Worker] Push Event Received');
    
    let data = { title: 'New Notification', body: 'You have a new alert.' };
    if (event.data) {
        try {
            data = event.data.json();
            console.log('[Service Worker] Push Data:', data);
        } catch (e) {
            console.log('[Service Worker] Push data is not JSON:', event.data.text());
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body || data.message,
        icon: data.icon || '/logo-light.jpg',
        badge: data.badge || '/logo-light.jpg',
        vibrate: [100, 50, 100],
        data: {
            url: data.data?.url || '/student/notifications'
        },
        actions: [
            { action: 'open', title: 'View Details' },
            { action: 'close', title: 'Dismiss' }
        ],
        tag: 'class-reminder', // Group similar notifications
        renotify: true
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    if (event.action === 'close') return;

    const targetUrl = event.notification.data.url;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
            // Priority 1: Find if a tab is already open with the target URL
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === targetUrl && 'focus' in client) {
                    return client.focus();
                }
            }
            // Priority 2: Use any open tab to focus
            if (windowClients.length > 0) {
                return windowClients[0].focus();
            }
            // Priority 3: Open new window
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
