// Import the functions you need from the Firebase SDKs
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // For Firebase Authentication
import { getDatabase } from 'firebase/database'; // For Realtime Database

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAJhB5YB-ALnCcj1VvZAK-E5d4OG-lkv4Y",
  authDomain: "west-449f9.firebaseapp.com",
  databaseURL: "https://west-449f9-default-rtdb.europe-west1.firebasedatabase.app", // Ensure this URL is correct
  projectId: "west-449f9",
  storageBucket: "west-449f9.appspot.com",
  messagingSenderId: "652185643652",
  appId: "1:652185643652:web:e7d9c68a45ad3999bcf0d1",
  measurementId: "G-756WSD7TD2" // Optional, remove if not using Google Analytics
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Realtime Database
const db = getDatabase(app);

// Export the auth and db objects for use in other parts of your app
export { auth, db };
