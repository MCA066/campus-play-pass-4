// Public Firebase web app configuration; access is controlled by Auth and Firestore rules.
const firebaseConfig = {
 apiKey: "AIzaSyDrd7AfLanQSAQNx3j3_q3gP5laYDtHjMw",
 authDomain: "campusplay-c0f02.firebaseapp.com",
 projectId: "campusplay-c0f02",
 storageBucket: "campusplay-c0f02.firebasestorage.app",
 messagingSenderId: "162335948748",
 appId: "1:162335948748:web:dbedab4a69713508af6769"
};
let promise;
export function loadFirebase(){
 if(!promise)promise=Promise.all([
 import(/* @vite-ignore */ 'https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js'),
 import(/* @vite-ignore */ 'https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js'),
 import(/* @vite-ignore */ 'https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js')
 ]).then(([a,u,d])=>{const app=a.getApps().length?a.getApp():a.initializeApp(firebaseConfig);return {...u,...d,auth:u.getAuth(app),db:d.getFirestore(app)}}).catch(e=>{promise=null;throw e});
 return promise;
}
