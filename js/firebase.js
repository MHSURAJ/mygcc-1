import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./config.js";

export const isConfigured =
  Boolean(firebaseConfig.apiKey) && !firebaseConfig.apiKey.startsWith("PASTE");

let app, auth, db, provider;

if (isConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
}

export { auth, db, provider };
