# Coaching Classes Portal - Google Login (Student / Teacher)

Static website: GitHub Pages par chalegi, koi server nahi chahiye.
Login: Firebase Authentication (Google). Ek hi button: "Continue with Google". Login ke baad email database me check hoti hai, teacher list me hai to teacher access, warna student.

## Files

```
index.html          login page (root par, GitHub Pages ke liye)
student.html        student dashboard
teacher.html        teacher dashboard
css/style.css       design
js/config.js        <-- yahan class ka naam + Firebase config daalna hai
js/firebase.js      Firebase setup
js/login.js         login logic
js/role.js          email check (teacher ya student) + profile save
js/dashboard.js     dashboard protection (bina login ya galat role = wapas login)
firestore.rules     database security rules (Firebase me paste karne hain)
.nojekyll           GitHub Pages ke liye
```

## Setup (sirf ek baar, ~10 minute)

### 1. Firebase project banao
1. https://console.firebase.google.com par Google account se login karo.
2. **Add project** -> naam do -> Google Analytics off kar sakte ho -> Create.

### 2. Google login ON karo
1. Left menu: **Build -> Authentication -> Get started**.
2. **Sign-in method** tab -> **Google** -> Enable -> support email chuno -> Save.

### 3. Database banao
1. **Build -> Firestore Database -> Create database**.
2. Location: `asia-south1 (Mumbai)` chuno.
3. **Production mode** chuno -> Create.
4. **Rules** tab kholo, purana sab delete karke is project ki `firestore.rules` file ka poora content paste karo -> **Publish**.

### 4. Web app register karke config lo
1. Project Overview ke paas gear icon -> **Project settings**.
2. Neeche **Your apps** -> `</>` (Web) icon -> app ka naam do -> Register.
3. Jo `firebaseConfig = { ... }` dikhe, uski values `js/config.js` me paste karo.
4. Usi file me `CLASS_NAME` me apni coaching class ka naam likho.

### 5. Domain allow karo
**Authentication -> Settings -> Authorized domains -> Add domain**
`YOURUSERNAME.github.io` add karo. (`localhost` pehle se hota hai.)

### 6. Teachers ko approve karo
Koi bhi Google account student ban sakta hai, par teacher access sirf unhe milta hai jinka email aapne is list me daala ho.

1. **Firestore Database -> Start collection** -> Collection ID: `allowedTeachers`
2. **Document ID** = teacher ka Gmail, **lowercase me** (jaise `sir.name@gmail.com`).
3. Ek field daalo (Firestore ko kam se kam ek chahiye): `active` (boolean) = `true`. Save.
4. Aur teachers ke liye isi tarah naye documents add karo.

Teacher ko bas normal "Continue with Google" se login karna hai. Email list me hai to teacher page khulega, warna student page. List se email hata do to agle login par wo student ban jayega.

## GitHub par live karna

1. github.com par **New repository** banao (Public).
2. Is folder ki saari files upload karo (`index.html` repo ke root me hona chahiye, kisi folder ke andar nahi).
3. Repo me **Settings -> Pages -> Build and deployment**: Source = `Deploy from a branch`, Branch = `main`, folder = `/ (root)` -> Save.
4. 1-2 minute baad site `https://YOURUSERNAME.github.io/REPO-NAME/` par live hogi.

## Apne computer par test karna

`index.html` ko double-click se mat kholo (browser modules block kar deta hai). Is folder me terminal kholo:

```
python -m http.server 8000
```

Phir browser me `http://localhost:8000` kholo.

## Dhyan rakhne wali baatein

- Firebase config ki keys public hoti hain, GitHub par daalna safe hai. Security `firestore.rules` se aati hai, isliye rules zaroor publish karo.
- Instagram / Facebook ke in-app browser me Google login nahi chalta. Link Chrome ya Safari me kholo.
- Role har baar database ki teacher list se nikalta hai, isliye kisi ko teacher banana ho to bas uska email list me add karo (role manually badalne ki zaroorat nahi).

## Google login nahi chal raha? (checklist)

Login page par jo laal message aata hai wahi bata deta hai kya galat hai. Phir bhi in 5 cheezein check karo:

1. `js/config.js` me Firebase ki saari values sahi paste hui hain (`PASTE_...` kahin nahi bacha).
2. Firebase -> Authentication -> Sign-in method -> **Google = Enabled**.
3. Firebase -> Authentication -> Settings -> Authorized domains me `YOURUSERNAME.github.io` hai.
4. Firebase -> Firestore Database **bana hua** hai aur Rules tab me `firestore.rules` ka content **Publish** kiya hua hai.
5. Page Chrome ya Safari me khula hai (Instagram / WhatsApp ke andar wale browser me nahi).

GitHub par file update karne ke baad 1-2 minute lagte hain, phir page ko hard refresh karo (Ctrl+Shift+R).
