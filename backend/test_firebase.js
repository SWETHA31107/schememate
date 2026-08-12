const { db } = require('./config/firebase');
const { collection, getDocs } = require('firebase/firestore');

console.log('Testing Firestore connection...');
const colRef = collection(db, 'schemes');
getDocs(colRef)
  .then(snapshot => {
    console.log('Firestore connection succeeded. Found docs:', snapshot.size);
    process.exit(0);
  })
  .catch(err => {
    console.error('Firestore connection failed:', err);
    process.exit(1);
  });
