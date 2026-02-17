require('dotenv').config();
console.log('VAPID_PUBLIC_KEY Present:', !!process.env.VAPID_PUBLIC_KEY);
console.log('VAPID_PRIVATE_KEY Present:', !!process.env.VAPID_PRIVATE_KEY);
