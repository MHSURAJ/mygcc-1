import { auth, provider, isConfigured } from "./firebase.js";
import { CLASS_NAME } from "./brand.js";
import { syncProfile } from "./role.js";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const $ = (id) => document.getElementById(id);
const btn = $("google-btn");
const btnLabel = btn.querySelector(".label");
const msg = $("message");
const setupNotice = $("setup-notice");
const browserNotice = $("browser-notice");

document.title = `Sign in - ${CLASS_NAME}`;

function showMessage(text, type = "error") {
  msg.textContent = text;
  msg.className = `message ${type}`;
  msg.hidden = false;
}
function clearMessage() {
  msg.hidden = true;
  msg.textContent = "";
}
function setBusy(busy, label = "Continue with Google") {
  btn.disabled = busy;
  btn.classList.toggle("busy", busy);
  btnLabel.textContent = busy ? label : "Continue with Google";
}
function go(role) {
  location.replace(role === "teacher" ? "teacher.html" : "student.html");
}

// Google blocks sign-in inside in-app browsers (Instagram, Facebook, some WebViews).
if (/FBAN|FBAV|Instagram|; wv\)/i.test(navigator.userAgent)) {
  browserNotice.hidden = false;
}

if (!isConfigured) {
  setupNotice.hidden = false;
  setBusy(true);
} else {
  init();
}

function init() {
  setBusy(true, "Checking your session...");

  // Runs after a fresh Google sign-in and also for people who are already signed in.
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      setBusy(false);
      return;
    }
    setBusy(true, "Signing you in...");
    try {
      const role = await syncProfile(user);
      go(role);
    } catch (err) {
      console.error(err);
      setBusy(false);
      showMessage(dbErrorMessage(err));
      await signOut(auth).catch(() => {});
    }
  });

  btn.addEventListener("click", async () => {
    clearMessage();
    setBusy(true, "Opening Google...");
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      setBusy(false);
      showAuthError(err);
    }
  });
}

function dbErrorMessage(err) {
  switch (err.code) {
    case "permission-denied":
      return "The database rules are blocking this. In Firebase open Firestore Database > Rules, paste the rules from firestore.rules and click Publish.";
    case "unavailable":
      return "Cannot reach the database. Check your internet, and make sure a Firestore database is created in Firebase.";
    case "failed-precondition":
    case "not-found":
      return "The Firestore database is not created yet. In Firebase open Build > Firestore Database > Create database.";
    default:
      return `Could not load your account (${err.code || "unknown error"}). Please try again.`;
  }
}

function showAuthError(err) {
  if (String(err.code).startsWith("auth/api-key-not-valid") || err.code === "auth/invalid-api-key") {
    return showMessage(
      "The Firebase API key in js/config.js is wrong. Copy the config again from Firebase Project settings."
    );
  }
  switch (err.code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return; // person closed the popup; no message needed
    case "auth/popup-blocked":
      return showMessage("Your browser blocked the sign-in popup. Allow popups for this site and try again.");
    case "auth/unauthorized-domain":
      return showMessage(
        "This website address is not added in Firebase yet. Add it under Authentication > Settings > Authorized domains."
      );
    case "auth/operation-not-allowed":
      return showMessage(
        "Google sign-in is not turned on. Enable it in Firebase under Authentication > Sign-in method."
      );
    case "auth/configuration-not-found":
      return showMessage(
        "Authentication is not set up in Firebase. Open Build > Authentication > Get started, then enable Google."
      );
    case "auth/network-request-failed":
      return showMessage("No internet connection. Check your network and try again.");
    default:
      console.error(err);
      return showMessage(`Sign-in failed (${err.code || "unknown error"}). Please try again.`);
  }
}
