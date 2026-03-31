# SecureNote Application

**SecureNote** is a lightweight, secure full-stack web application for managing text notes. It demonstrates modern client-server architecture, secure communication, and dynamic data routing. The frontend is built with **React + Vite**, and the backend uses **Express.js**.

---

## 1. Key Features

- Two-Way Data Routing – Switch between local storage and the PocketHost API
- Secure Authorization – Token-based authentication via the Authorization header
- Persistent Storage – Notes are saved to notes.json, surviving server restarts
- Loading Indicators – Spinner UI during async operations
- Dark Mode – Toggle between light and dark themes
- Optimistic UI Updates – Immediate feedback before server confirmation

---

## 2. Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Data Persistence | Local JSON file + PocketHost API |
| Deployment | Vercel (frontend) + Render (backend) |

---

## 3. Live Deployment

| Service | URL |
|---------|-----|
| Frontend (Vercel) | https://secure-note-app-zero-nine.vercel.app/ |
| Backend (Render) | https://secure-note-app-6hl8.onrender.com |

---

## 4. Setup Guide

### Prerequisites
- Node.js v18 or higher
- npm

### Backend Setup
```bash
cd backend
npm install

# Backend Setup
cd backend
npm install

# Create a .env file in the backend/ directory
echo "PORT=3000" >> .env
echo "SECRET_TOKEN=your_secret_token_here" >> .env

# ⚠️ Important: Do not commit .env to version control

# Start the backend server
npm start

# Backend runs at: http://localhost:3000

# Frontend Setup
cd ../frontend
npm install

# Create a .env file in the frontend/ directory
echo "VITE_API_URL=http://localhost:3000/api/notes" >> .env

# Start the development server
npm run dev

# Access the app in your browser at: http://localhost:5173

# 5. API Endpoints & Usage

# API Endpoints
# Method   Endpoint          Auth    Description
# GET      /api/notes        No      Retrieve all notes
# POST     /api/notes        Yes     Create a new note
# DELETE   /api/notes/:id    Yes     Delete a note by ID

# Required Headers
# Authorization: <your-secret-token>
# X-Data-Source: local | pockethost

# Usage Guide
# 1. Enter your SECRET_TOKEN in the Configuration panel
# 2. Toggle between Local and PocketHost modes
# 3. Enter a note title and content, then click Save Note
# 4. Hover over a note card to reveal the Delete button

# Notes:
# - Ensure your backend server is running before using the frontend
# - Data persists locally via notes.json or remotely via PocketHost API depending on selected mode
# - Optimistic UI provides immediate feedback but may revert if the server rejects the request