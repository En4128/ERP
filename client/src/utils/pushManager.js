import axios from 'axios';

const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

export const subscribeUserToPush = async (token) => {
    if (!('serviceWorker' in navigator)) return;

    try {
        const registration = await navigator.serviceWorker.ready;

        // 1. Get Public VAPID Key from server
        const { data: { publicKey } } = await axios.get('http://localhost:5000/api/notifications/vapid-key', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!publicKey) throw new Error('VAPID public key not found');

        // 2. Subscribe
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey)
        });

        // 3. Send subscription to server
        await axios.post('http://localhost:5000/api/notifications/subscribe', subscription, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Successfully subscribed to Push Notifications');
        return true;
    } catch (error) {
        console.error('Push subscription failed:', error);
        return false;
    }
};
