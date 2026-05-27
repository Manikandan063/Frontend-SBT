importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Extract config from query params with hardcoded fallbacks for reliability
const urlParams = new URLSearchParams(self.location.search);
const firebaseConfig = {
  apiKey: urlParams.get('apiKey') || 'AIzaSyDs66mEFn8YFh_7MU9j-yDJGXUsUpyoe2Q',
  authDomain: urlParams.get('authDomain') || 'sbt-xtown.firebaseapp.com',
  projectId: urlParams.get('projectId') || 'sbt-xtown',
  storageBucket: urlParams.get('storageBucket') || 'sbt-xtown.firebasestorage.app',
  messagingSenderId: urlParams.get('messagingSenderId') || '111341194960',
  appId: urlParams.get('appId') || '1:111341194960:web:1100952df465b4b483d8d5'
};

if (firebaseConfig.projectId) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  // Handle background messages
  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} else {
  console.warn('[firebase-messaging-sw.js] Missing Firebase config. Background messaging disabled.');
}
