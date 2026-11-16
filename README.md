# COS 106 – Student Portfolio Website

![Portfolio Preview](assets/images/profile.jpg)

A multi-page, responsive personal portfolio for **Abdulsamad Taiwo**, a Software Engineering student at MIVA Open University. It was built for the **COS 106 – Introduction to Web Technologies** Practical Term Project.

## 🚀 Live Demo
**[View Live Website Here](https://abdulsamadtaiwo648-dotcom.github.io/StudentPortFolio/)**
*(Note: Replace with your actual GitHub Pages link once deployed)*

---

## 📑 Page Structure

### 1. 🏠 Homepage (`index.html`)
A scrolling story in chapters, with a 3D scene behind it:
- **Intro:** animated name, a typewriter role line and quick stats.
- **About:** portrait in a 3D frame and a short introduction.
- **Stack:** languages, backend skills and tooling.
- **Work:** three featured projects with screenshots and links to the live sites.
- **Voice:** a personal voice introduction (`<audio>`).
- **Contact:** a closing call to action.

### 2. 👤 About Me (`about.html`)
- Career aspirations in backend engineering.
- Animated skill progress bars.
- Educational background table.
- Hobbies and personal interests.

### 3. 💼 Projects (`projects.html`)
- DLNZ Store, SoloBiz, Digital Waste Management, CLI Tower Management System and Atlas OS.
- JavaScript category filter (All, Web, CLI / Systems, Tools).
- Screenshots, with links to the live sites where they exist.

### 4. ✉️ Contact (`contact.html`)
- Contact form with client-side JavaScript validation (empty checks, email format, digits-only phone numbers).
- Sending opens the visitor's email app with the message filled in, so no server is needed.

---

## ✨ Interactive Features

All of these are written from scratch, with no external libraries.

- **3D particle scene (`js/story.js`):** drawn on a `<canvas>` with hand-written 3D projection. It morphs between a globe, helix, lattice, wave, ring and spiral galaxy as you scroll through the homepage chapters, and turns with the pointer.
- **3D project frames:** homepage screenshots rotate in 3D as they scroll through the viewport.
- **Inner pages:** About, Projects and Contact run the same scene behind their content, each with its own shapes.
- **Card tilt and cursor effects (`js/three-d.js`):** project cards lean toward the pointer, with a cursor spotlight and magnetic buttons on desktop.
- **Scroll progress bar and chapter indicator** on the homepage.
- **Motion preferences:** the scene and animations are turned off for visitors who prefer reduced motion.

---

## 🛠️ Technologies

- **HTML5:** semantic tags (`<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`), forms, tables, lists and audio.
- **CSS:** one stylesheet (`css/style.css`) with custom properties, Flexbox, Grid, `@media` queries for phone, tablet and desktop, transitions and `@keyframes`.
- **JavaScript (vanilla):** DOM manipulation, event handling, regex form validation, array methods for the project filter, and Canvas 2D drawing for the 3D scene.

No build tools or frameworks are used.

---

## 💻 Local Installation & Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/abdulsamadtaiwo648-dotcom/StudentPortFolio.git
   ```
2. Navigate to the project directory:
   ```bash
   cd StudentPortFolio
   ```
3. Open `index.html` in any modern web browser.
   *(For the best development experience, you can use VS Code's "Live Server" extension).*

---

## 👨‍💻 Author
**Abdulsamad Taiwo**
- Programme: B.Sc. Software Engineering
- University: MIVA Open University
- GitHub: [@abdulsamadtaiwo648-dotcom](https://github.com/abdulsamadtaiwo648-dotcom)

*Built for COS 106 Term Project, 2025.*
