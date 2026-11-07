import { auth, isConfigured } from "./firebase.js";
import { CLASS_NAME } from "./brand.js";
import { getRole } from "./role.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const requiredRole = document.body.dataset.role; // "student" or "teacher"
const $ = (id) => document.getElementById(id);
const pageFor = (role) => (role === "teacher" ? "teacher.html" : "student.html");

document.querySelectorAll("[data-class-name]").forEach((el) => (el.textContent = CLASS_NAME));
document.title = `${requiredRole === "teacher" ? "Teacher" : "Student"} - ${CLASS_NAME}`;

async function logout() {
  try {
    await signOut(auth);
  } finally {
    location.replace("index.html");
  }
}
$("logout-btn").addEventListener("click", logout);
$("error-logout").addEventListener("click", logout);

function initials(name, email) {
  const source = (name || email || "?").trim();
  const parts = source.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0].toUpperCase()).join("");
}

function render(user, role) {
  const name = user.displayName || "";
  const first = name.split(/\s+/)[0] || "there";

  $("greeting").textContent = `Hi, ${first}`;
  $("acc-name").textContent = name || "-";
  $("acc-email").textContent = user.email;
  $("acc-role").textContent = role === "teacher" ? "Teacher" : "Student";

  const avatar = $("avatar");
  avatar.textContent = initials(name, user.email);
  if (user.photoURL) {
    const img = new Image();
    img.alt = "";
    img.referrerPolicy = "no-referrer";
    img.onload = () => avatar.replaceChildren(img);
    img.src = user.photoURL;
  }

  document.body.classList.remove("checking");
}

function showError() {
  document.body.classList.remove("checking");
  $("app").hidden = true;
  $("error-box").hidden = false;
}

if (!isConfigured) {
  location.replace("index.html");
} else {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      location.replace("index.html");
      return;
    }
    try {
      const role = await getRole(user); // checked live: teacher email list in the database
      if (role !== requiredRole) {
        location.replace(pageFor(role));
        return;
      }
      render(user, role);
    } catch (err) {
      console.error(err);
      showError();
    }
  });
}
