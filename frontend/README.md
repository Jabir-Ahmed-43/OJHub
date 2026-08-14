# OJHub — Competitive Programming Platform

A full MERN stack online judge / competitive programming platform.

## Structure

```
ojhub/
├── backend/     Node.js + Express + MongoDB API
└── frontend/    React (Vite) + Tailwind CSS client
```

## Backend Setup

```bash
cd backend
npm install
npm run dev             # starts on http://localhost:5000
```

## Frontend Setup

```bash
cd frontend
.env                     # points to the backend API
npm install
npm run dev              # starts on http://localhost:5173
```

## Creating the first admin

Register a normal account via the UI, then manually flip its `role` field to
`"admin"` in MongoDB (e.g. via `mongosh` or MongoDB Compass):

```js
db.users.updateOne({ username: "yourUsername" }, { $set: { role: "admin" } })
```

Once you have one admin, you can promote/demote further users directly from
the Admin Panel → Manage Users screen.

## Notes

- Code execution/judging is simulated with a mock judge (`mockJudge` in
  `submissionController.js`) since real sandboxed execution requires
  dedicated infrastructure (Docker-based runners, isolate, etc.). Swap this
  function out for a real judge integration in production.
- JWT auth is stateless; tokens are stored in `localStorage` and attached to
  every request via an Axios request interceptor. A response interceptor
  automatically logs the user out on a `401`.
