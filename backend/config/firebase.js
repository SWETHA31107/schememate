const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBY67hLj28ZPhVmICDfjkmUb_p_M0iRpJk",
  authDomain: "hgfhgfh-3bf88.firebaseapp.com",
  projectId: "hgfhgfh-3bf88",
  storageBucket: "hgfhgfh-3bf88.firebasestorage.app",
  messagingSenderId: "168081003725",
  appId: "1:168081003725:web:908881ce4b717ef168c584"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

module.exports = { db };
