# 🚀 OJHub — Competitive Programming Platform

OJHub is a modern, high-performance, full-stack Online Judge and Competitive Programming platform built on the MERN stack (MongoDB, Express, React, and Node.js). It features problem solving, contest hosting (ICPC & IOI styles), and comprehensive user profile dashboards.

---

## 📂 Project Structure

```text
ojhub/
├── backend/      # Node.js + Express + MongoDB API
└── frontend/     # React (Vite) + Tailwind CSS SPA
```

---

## 🛠️ Installation & Setup

### 1. Backend Setup

Configure and start the API server:

```bash
cd backend
cp .env.example .env      # Configure MONGO_URI, JWT_SECRET, etc.
npm install               # Install dependencies
npm run dev               # Start development server on http://localhost:5005
```

> [!NOTE]
> The backend server runs on port **5005** by default to prevent port conflicts with standard systems. It implements graceful shutdown handlers to automatically release the port on restarts and shutdowns.

### 2. Frontend Setup

Configure and start the React client:

```bash
cd frontend
npm install               # Install dependencies
npm run dev               # Start Dev Server on http://localhost:5173
```

---

## 🔑 Administrator Setup

To create your first admin account:
1. Register a normal account through the frontend UI.
2. Connect to your MongoDB instance (e.g., using `mongosh` or MongoDB Compass).
3. Run the following query to promote your user to an admin role:
   ```javascript
   db.users.updateOne({ username: "your_username" }, { $set: { role: "admin" } })
   ```
4. Once you are logged in as an admin, you can manage other users, approve/reject contest proposals, and publish new problems directly from the **Admin Panel** in the UI.

---

## 🤖 Features

- **Problem Set**: A curated list of programming challenges with filters.
- **Contests**: ICPC and IOI style contests with real-time standings/rankings.
- **Blogs**: Markdown blogs for the community to share editorials and discuss algorithms.
- **Code Runner**: Integrated code execution testing.
- **Activity Heatmap**: Github-style submission contribution grid on user dashboards.
