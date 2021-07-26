const firebase = require("firebase/app");
let firestore = require("firebase/firestore");

firebase.initializeApp({
  apiKey: "AIzaSyAJ1ToQCQDFQYU6LM-W8aI3q15rPSGTmcc",
  authDomain: "superchatappbynurbek.firebaseapp.com",
  projectId: "superchatappbynurbek",
  storageBucket: "superchatappbynurbek.appspot.com",
  messagingSenderId: "465683654244",
  appId: "1:465683654244:web:d62c3816058450de282171",
  measurementId: "G-4EV2C46YGC",
});

firestore = firebase.firestore();

const messagesRef = firestore.collection("messages");
messagesRef.add({
  text: "Hello",
});
