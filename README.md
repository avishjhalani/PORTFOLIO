# Avish Jhalani - Modern Software Engineering Portfolio

This repository hosts the source code for my premium, high-performance developer portfolio website, featuring custom canvas particles, text scrambling animations, dynamic hover boundary lighting, and native Google Sheets form integrations.

🚀 **Live Deployment URL**: [https://avishportfolio00.netlify.app/](https://avishportfolio00.netlify.app/)

---

## ⚡ Key Highlights & Features

- **Cyber-Minimalist Design**: Built on modern CSS variables, fluid responsive layouts, and a dark space theme with frosted glassmorphic cards.
- **Physics Canvas Particles**: Floating interactive background particles that repulse dynamically from the cursor.
- **Dynamic Glow Borders**: Glassmorphic cards track the mouse pointer's coordinates (`--mouse-x`, `--mouse-y`) to paint cursor-following border lighting.
- **Hacker Scramble Effects**: Decodes section titles on scroll and hover.
- **Google Sheets Database Integration**: Submitting the contact form calls a secure serverless script to append submissions to Google Sheets in real-time.
- **Local Dev Server**: Native `server.js` included to test website static files locally and write contact messages to a local Excel file (`inbox.csv`).

---

## 🛠️ Stack & Technologies

- **Frontend**: HTML5, Vanilla CSS3 (Custom Variables, Flexbox, Grid), JavaScript (ES6+).
- **Animations**: GSAP (GreenSock Animation Platform) + native Intersection Observer.
- **Icons**: FontAwesome v6.
- **Backend (Local Dev)**: Native Node.js `http` and `fs` modules.

---

## ⚙️ Running Locally

1. Clone this repository:
   ```bash
   git clone https://github.com/avishjhalani/PORTFOLIO.git
   cd PORTFOLIO
   ```
2. Start the local server:
   ```bash
   node server.js
   ```
3. Open `http://localhost:8000` in your web browser. Submissions will be logged locally to `inbox.csv`.
