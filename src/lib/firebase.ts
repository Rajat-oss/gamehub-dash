import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDFfVD1XhY4vC7YJaFvtcC_Uurqfo2DInY",
  authDomain: "gameplace-a351d.firebaseapp.com",
  projectId: "gameplace-a351d",
  storageBucket: "gameplace-a351d.firebasestorage.app",
  messagingSenderId: "632415169690",
  appId: "1:632415169690:web:d87f38b34a87efd0e10323",
  measurementId: "G-E4VGTTMNFE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
