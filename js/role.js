import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// The role comes only from the database: if the person's email is in the
// "allowedTeachers" collection they are a teacher, otherwise a student.
export async function getRole(user) {
  const email = (user.email || "").toLowerCase();
  const snap = await getDoc(doc(db, "allowedTeachers", email));
  return snap.exists() ? "teacher" : "student";
}

// Called at login: checks the role and keeps the person's profile up to date.
export async function syncProfile(user) {
  const role = await getRole(user);
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      name: user.displayName || "",
      email: user.email,
      photoURL: user.photoURL || "",
      role,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    });
  } else {
    const patch = { lastLogin: serverTimestamp() };
    if (snap.data().role !== role) patch.role = role; // teacher added or removed since last login
    await updateDoc(ref, patch);
  }
  return role;
}
