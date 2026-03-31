# SecureNote Application

A lightweight, secure full-stack web application for managing text notes. Built with **React + Vite** (Frontend) and **Express.js** (Backend) to demonstrate client-server architecture, secure communication, and dynamic data routing.

## Features

- **Two-Way Data Routing** — Switch between Local File System and PocketHost API
- **Secure Authorization** — Token-based auth via `Authorization` header
- **Data Persistence** — Notes survive server restarts via `notes.json`
- **Loading States** — Spinner UI during all async operations
- **Dark Mode** — Toggle between light and dark themes
- **Optimistic UI** — Instant feedback before server confirms

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Persistence | Local JSON file + PocketHost API |
| Deployment | Vercel (frontend) + Render (backend) |

## Deployment

| Service | URL |
|---|---|
| Frontend (Vercel) | https://your-app.vercel.app |
| Backend (Render) | https://your-backend.onrender.com |

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm

---

## 1. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```
PORT=3000
SECRET_TOKEN=your_secret_password_here
```

> ⚠️ Never commit `.env` to version control!

Start the server:
```bash
npm start
```

The backend will run at `http://localhost:3000`.

---

## 2. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:
```
VITE_API_URL=http://localhost:3000/api/notes
```

Start the dev server:
```bash
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## API Endpoints

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/notes` | No | Get all notes |
| `POST` | `/api/notes` | Yes | Create a new note |
| `DELETE` | `/api/notes/:id` | Yes | Delete a note |

### Headers
```
Authorization: <your-token>
X-Data-Source: local | pockethost
```

---

## Usage

1. Enter your `SECRET_TOKEN` in the **Configuration** section
2. Switch between **Local** and **PocketHost** mode using the toggle
3. Fill in title and content then click **Save Note**
4. Hover over a note card to reveal the delete button