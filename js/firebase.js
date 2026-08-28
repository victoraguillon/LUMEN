const firebaseConfig = {
  apiKey: "AIzaSyDYp5UhtTdNAagqk4Rj7IWev6-kAUwyY3k",
  authDomain: "lumen-com.firebaseapp.com",
  databaseURL: "https://lumen-com-default-rtdb.firebaseio.com",
  projectId: "lumen-com",
  storageBucket: "lumen-com.firebasestorage.app",
  messagingSenderId: "646962481481",
  appId: "1:646962481481:web:d5df5d4a533b91c696f298",
  measurementId: "G-CJPNJRBYGD"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();