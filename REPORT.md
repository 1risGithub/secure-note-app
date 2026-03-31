# Conceptual Report: SecureNote Application

## 1. JavaScript Engine vs. Runtime

In this project, JavaScript is executed in two distinct environments:

**Frontend (Client-Side — Browser Runtime):**  
The React application runs within a **Browser Runtime** (e.g., Chrome or Firefox) and uses the **V8 JavaScript Engine** to compile source code into machine code, executing it on the user’s device. The Browser Runtime provides additional Web APIs, such as `fetch()` for HTTP requests and `document` for DOM manipulation. These are not part of the core JavaScript language but are provided by the runtime environment.

**Backend (Server-Side — Node.js Runtime):**  
The Express.js server operates within the **Node.js Runtime**, which also uses the **V8 Engine**, but differs from the browser in that it lacks Web APIs such as `window` or `document`. Instead, it provides **system-level APIs**, including the `fs` module for file operations, the `http` module for server creation, and `process.env` for reading environment variables.

**Summary:**  
The JavaScript language remains the same, but the runtime environment determines the available APIs — browsers provide Web APIs, while Node.js provides system APIs.

---

## 2. DOM and Rendering Mechanism

This project uses **React.js**, which implements a **Virtual DOM** approach:

When the state changes (e.g., adding or deleting a note), React does not immediately update the real DOM. Instead, it follows these steps:

1. **Create a new Virtual DOM** in memory.  
2. **Diffing** — compare the new Virtual DOM with the previous one to detect changes.  
3. **Reconciliation** — update only the portions of the real DOM that have changed.

**Example in this project:**  
When a new note is successfully created, `setNotes((prev) => [newNote, ...prev])` is called, causing React to re-render only the notes grid, not the entire page. Additionally, the application uses **Optimistic UI**, immediately updating the state without waiting for the server response, resulting in a smoother user experience.

---

## 3. HTTP/HTTPS Protocols & Request/Response Cycle

When the "Save Note" button is clicked, the communication sequence is as follows:

**1. Request:**  
The browser sends an HTTP `POST` request via the `fetch()` API to `POST /api/notes`.

**2. Request Headers:**  

- `Content-Type: application/json` — indicates that the request body is JSON.  
- `Authorization` — includes the token for authentication.  
- `X-Data-Source` — instructs the backend whether to store the data in the local file system or forward it to PocketHost.

**3. Response:**  
- `201 Created` — note successfully created.  
- `401 Unauthorized` — invalid token; frontend displays an error message.  
- `400 Bad Request` — incomplete or malformed data.

**Why HTTPS is essential in production:**  
While HTTP is sufficient for local development, plain HTTP in production exposes the authorization token as plaintext, making it vulnerable to interception (Man-in-the-Middle attacks). HTTPS encrypts all traffic using TLS, ensuring secure transmission.

---

## 4. Environment Variables and Security

The `SECRET_TOKEN` is stored in the backend’s `.env` file and loaded using `require("dotenv").config()`. This file is excluded from version control via `.gitignore` and works only within the Node.js runtime.

**What happens if `SECRET_TOKEN` is stored in the frontend:**  
Frontend code is compiled and sent to every user’s browser. Anyone can inspect the code via developer tools and retrieve the token, compromising the entire authorization system. This would allow unauthorized creation or deletion of notes without knowing the actual token.

---

## 5. Bonus: Dynamic Data Routing & Proxy Middleware

The system implements **two-way data routing** using a custom header `X-Data-Source`:

**Local Mode (File System Persistence):**  
Data is stored in `notes.json` using Node.js `fs` module, ensuring notes persist even after server restarts.

**PocketHost Mode:**  
The backend acts as a **proxy middleware**, receiving requests from the frontend, injecting the `Bearer` prefix and `user_id: 2`, and forwarding them to the PocketHost API. This allows the frontend to remain unaware of the PocketHost schema.

**Loading State:**  
All asynchronous operations have dedicated loading states (`isFetching`, `isSubmitting`, `deletingId`) that display a spinner and disable UI interactions while waiting for responses.

---

## 6. Cloud Deployment (Bonus)

**Frontend → Vercel:**  
The React application is deployed on Vercel and connected to the GitHub repository. Every push to `main` triggers automatic build and deployment. The environment variable `VITE_API_URL` is configured through the Vercel dashboard. Vercel provides SSL/TLS certificates automatically, enabling HTTPS.

**Backend → Render:**  
The Express.js server is deployed as a web service on Render. Environment variables (`PORT`, `SECRET_TOKEN`) are injected via the Render dashboard, ensuring that secrets never reside in version control.