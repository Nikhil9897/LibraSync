<div align="center">

# 📚 Librasync

**A Next-Generation Library Management System powered by AI**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](#)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](#)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](#)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](#)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-black?style=for-the-badge&logo=framer&logoColor=blue)](#)

</div>

<br />

Welcome to **Librasync** – a modern, full-stack Library Management System built from the ground up to modernize the library experience. Combining a beautiful, interactive frontend with a robust, AI-powered backend, Librasync offers a seamless experience for both library administrators and members.

## ✨ Features

- **🛡️ Secure Authentication**: JWT and Google OAuth integration using Passport.js for robust, seamless user login.
- **📈 Real-Time Gamification**: Dynamic reading streaks and personalized monthly reading goals that automatically update based on user activity.
- **📊 Interactive Dashboards**: Beautiful, data-driven visualizations with glowing area charts, glassmorphic tooltips, and Recharts for tracking library analytics.
- **🤖 AI-Powered Intelligence**: Integration with Cohere AI to provide smart insights and intelligent functionality.
- **📅 Automated Reservations**: Smart book reservation management with automated, scheduled background checks via `node-cron`.
- **☁️ Cloud Assets**: Seamless image and media handling with Cloudinary integration.
- **✉️ Automated Communications**: Real-time notifications and alerts handled by Nodemailer.
- **💫 Stunning UI/UX**: A highly responsive, premium user interface featuring full Dark Mode support, Tailwind CSS v4, and Framer Motion micro-animations.
- **🔖 Member Features**: Personalized wishlists, interactive dashboards, and easy QR code integrations.

## 🛠️ Tech Stack

### 💻 Client (Frontend)
- **Core**: React 18, Vite
- **Styling**: Tailwind CSS (v4)
- **Animations**: Framer Motion
- **Routing**: React Router DOM
- **Data Visualization**: Recharts
- **Icons & UI**: Lucide React, React Icons, QR Code generation
- **State/Requests**: Axios, React Hot Toast

### ⚙️ Server (Backend)
- **Core**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, Passport.js (Local & Google OAuth20), bcryptjs
- **AI**: Cohere AI (`cohere-ai`)
- **Utilities**: Multer (Uploads), Cloudinary (Storage), Nodemailer (Emails), Node-cron (Jobs), Joi (Validation)
- **Security & Logging**: Helmet, Express-Rate-Limit, Morgan, Winston

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js and MongoDB installed on your system.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/librasync.git
   cd librasync
   ```

2. **Install dependencies** (from the root directory)
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   ```

3. **Set up Environment Variables**
   - Create a `.env` file in the `server` directory and add your keys for MongoDB, JWT, Cloudinary, Cohere AI, Google OAuth, and Nodemailer.

4. **Run the Application**
   - We use `concurrently` to run both the client and server simultaneously. From the root directory:
   ```bash
   npm run dev
   ```

## 📂 Folder Structure

```text
Librasync/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application views (MemberDashboard, Wishlist, etc.)
│   │   └── ...
│   └── package.json
├── server/                 # Node.js + Express backend application
│   ├── config/             # Database and third-party integrations config
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom Express middlewares (Auth, etc.)
│   ├── models/             # Mongoose database schemas
│   ├── routes/             # API routes
│   └── server.js           # Entry point for backend
└── package.json            # Root configuration (concurrently scripts)
```

---

<div align="center">
  <p>Built with ❤️ for modern libraries.</p>
</div>
