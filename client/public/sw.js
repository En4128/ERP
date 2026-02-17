self.addEventListener('push', function (event) {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: data.icon || '/logo-light.jpg',
            badge: data.badge || '/logo-light.jpg',
            vibrate: [200, 100, 200],
            tag: data.tag,
            renotify: true,
            data: data.data || {
                dateOfArrival: Date.now(),
                primaryKey: '1'
            },
            actions: [
                { action: 'explore', title: 'View Details' }
            ]
        };
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    // Dynamic URL based on origin or data payload
    let targetUrl = new URL('/student/notifications', self.location.origin).href;
    if (event.notification.data && event.notification.data.url) {
        targetUrl = new URL(event.notification.data.url, self.location.origin).href;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            // Check if tab is already open and focus it
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === targetUrl && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, open a new window
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
