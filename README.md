# Project Pulse 🚀

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg) ![React](https://img.shields.io/badge/React-19.2.0-blue?logo=react) ![Node.js](https://img.shields.io/badge/Node.js-16%2B-green?logo=nodedotjs) ![MongoDB](https://img.shields.io/badge/MongoDB-blue?logo=mongodb) ![Socket.io](https://img.shields.io/badge/Socket.io-4.8-blue?logo=socketdotio)

**Project Pulse** is a full-stack, multi-tenant community issue tracking platform designed to help residents and administrators manage community-related problems efficiently. It features a modern, real-time architecture with AI-powered insights to categorize, summarize, and assist in responding to issues.

### ✨ Live Demo

* **Frontend (Vercel):** `https://project-pulse-gules.vercel.app`
---

## Core Features

### 👤 User & Authentication
* **JWT Authentication:** Secure user registration and login using JSON Web Tokens.
* **Redis Token Blacklisting:** Implemented a secure logout feature by blacklisting expired tokens in Redis.
* **Role-Based Access Control:**
    * **Resident:** Can report, view, and comment on issues.
    * **Community Admin:** Can manage community settings, users, and issue statuses.
    * **Super Admin:** Can manage all communities and users across the platform.

### 🏢 Community & Tenancy
* **Multi-Tenant Architecture:** The platform is built to serve multiple communities from a single backend, with data strictly isolated by community.
* **Admin Dashboards:** Dedicated dashboards for both Community Admins (user management, settings) and Super Admins (platform stats, global user/community management).
* **Community Settings:** Admins can configure issue categories, AI features, and other community-specific settings.

### 📋 Issue Management
* **Full CRUD Operations:** Create, read, update, and manage community issues.
* **Image Uploads:** Users can attach multiple images to issue reports, which are hosted via Cloudinary.
* **Advanced Filtering & Sorting:** Filter issues by status, category, urgency, or search query. Sort by creation date or upvote count.
* **Engagement:** Users can upvote issues and participate in nested comment threads.

### 🤖 AI Integration (via Google Gemini)
* **AI Analysis:** New issues are automatically analyzed to predict category, determine sentiment, and generate a concise summary.
* **AI Admin Assist:** Admins can generate an AI-powered reply to comments based on the issue's current status and context.

### ⚡ Real-Time Features (Socket.io)
* **Live Notifications:** Users receive real-time notifications for status updates and new comments on their issues.
* **Live Issue Updates:** Issue details (like upvotes and new comments) update live for all users viewing the page without a refresh.
* **Real-time Dashboard:** (Future) Dashboards can be configured to update live as new issues are posted.

---

## 🛠️ Tech Stack

The project uses a modern MERN-stack, expanded with real-time and AI capabilities.

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | [React 19](https://react.dev/) | Core UI library. |
| | [Vite](https://vitejs.dev/) | Next-generation frontend tooling for a fast dev experience. |
| | [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS framework for rapid UI development. |
| | [Socket.io-Client](https://socket.io/docs/v4/client-api/) | Real-time communication with the backend. |
| | [Recharts](https://recharts.org/) | Charting library for the admin dashboards. |
| | [Axios](https://axios-http.com/) | Promise-based HTTP client for API requests. |
| **Backend** | [Node.js](https://nodejs.org/) | JavaScript runtime environment. |
| | [Express](https://expressjs.com/) | Minimalist web framework for the API. |
| | [MongoDB](https://www.mongodb.com/) | NoSQL database for storing all application data. |
| | [Mongoose](https://mongoosejs.com/) | Object Data Modeling (ODM) library for MongoDB. |
| | [Redis](https://redis.io/) | In-memory data store used for JWT blacklisting on logout. |
| | [Socket.io](https://socket.io/) | Enables real-time, bi-directional event-based communication. |
| | [Google Gemini](https://ai.google.dev/) | Used for all AI-powered analysis and text generation. |
| | [Cloudinary](https://cloudinary.com/) | Cloud-based image management for issue uploads. |
| | [JSON Web Token (JWT)](https://jwt.io/) | For securing the API and managing user sessions. |

---

## 🚀 Getting Started Locally

To get a local copy up and running, follow these simple steps.

### Prerequisites

You must have the following software installed:
* [Node.js](https://nodejs.org/) (v16 or later)
* [MongoDB](https://www.mongodb.com/try/download/community) (or a free MongoDB Atlas account)
* [Redis](https://redis.io/docs/getting-started/installation/) (or use the Docker one-liner: `docker run -d -p 6379:6379 redis`)

### 1. Backend Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/project-pulse.git](https://github.com/your-username/project-pulse.git)
    cd project-pulse
    ```

2.  **Navigate to the backend:**
    ```bash
    cd backend
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Create `.env` file:**
    Create a file named `.env` in the `backend` directory and add the following variables:
    ```env
    # From backend/.env
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_super_secret_jwt_key
    CLOUDINARY_URL=your_cloudinary_url
    CLIENT_URL=http://localhost:5173
    NODE_ENV=development
    PORT=5000
    GEMINI_API_KEY=your_google_gemini_api_key
    REDIS_URL=redis://127.0.0.1:6379
    ```

5.  **Run the backend server:**
    ```bash
    npm start
    ```
    The backend API will be running at `http://localhost:5000`.

### 2. Frontend Setup

1.  **Navigate to the frontend:**
    Open a new terminal and go to the `frontend` directory from the root.
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create `.env` file:**
    Create a file named `.env` in the `frontend` directory and add the API URL:
    ```env
    # From frontend/.env
    VITE_API_URL=http://localhost:5000
    ```

4.  **Run the frontend app:**
    ```bash
    npm run dev
    ```
    The frontend will be available at `http://localhost:5173`.

---

## ⚙️ Environment Variables

This project requires the following environment variables to be set.

### Backend (`/backend/.env`)

| Variable | Description |
| :--- | :--- |
| `MONGODB_URI` | **Required.** Connection string for your MongoDB database. |
| `JWT_SECRET` | **Required.** A long, random string used to sign auth tokens. |
| `REDIS_URL` | **Required.** Connection URL for your Redis instance (e.g., `redis://127.0.0.1:6379`). |
| `GEMINI_API_KEY`| **Required.** Your API key from Google AI Studio. |
| `CLOUDINARY_URL` | **Required.** Your Cloudinary API connection string. |
| `CLIENT_URL` | **Required.** The URL of your frontend (e.g., `http://localhost:5173`). Used for CORS. |
| `PORT` | Optional. The port for the backend server (defaults to 5000). |
| `NODE_ENV` | Optional. Set to `production` in your deployed environment. |

### Frontend (`/frontend/.env`)

| Variable | Description |
| :--- | :--- |
| `VITE_API_URL` | **Required.** The full URL of your backend API (e.g., `http://localhost:5000`). |

---

## 🗺️ API Endpoints

For a complete list of all endpoints, parameters, and example responses, please see the [API Documentation](./backend/api_documentation.md).

A brief summary of the main routes is below:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Create a new user account. |
| `POST` | `/api/auth/login` | Log in and receive a JWT. |
| `GET` | `/api/auth/me` | Get the profile of the currently logged-in user. |
| `POST` | `/api/auth/logout` | Log out and blacklist the user's JWT. |
| `GET` | `/api/communities/current` | Get details for the user's current community. |
| `PUT` | `/api/communities/settings`| (Admin) Update settings for the community. |
| `GET` | `/api/communities/members`| (Admin) Get a list of all members in the community. |
| `GET` | `/api/issues` | Get a paginated list of all issues (with filters). |
| `POST` | `/api/issues` | Create a new issue (handles image uploads). |
| `GET` | `/api/issues/:id` | Get full details for a single issue, including comments. |
| `PUT` | `/api/issues/:id/status` | (Admin) Update the status of an issue. |
| `POST` | `/api/issues/:id/upvote` | Upvote or remove an upvote from an issue. |
| `POST` | `/api/issues/:id/comments` | Add a new comment to an issue. |
| `POST` | `/api/issues/:id/ai-reply` | (Admin) Generate an AI-assisted reply. |
| `GET` | `/api/issues/stats/overview`| Get dashboard statistics for the community. |
| `GET` | `/api/notifications` | Get all unread notifications for the user. |
| `GET` | `/api/superadmin/stats` | (Super Admin) Get platform-wide statistics. |
| `GET` | `/api/superadmin/users` | (Super Admin) Get a list of all users on the platform. |

---

## ☁️ Deployment

This application is deployed with a decoupled, serverless-friendly architecture:

* **Frontend:** The React/Vite app is deployed as a **Static Site** on **Vercel**.
* **Backend:** The Node.js/Express API is deployed as a **Web Service** on **Render**.
* **Database:** A managed **MongoDB Atlas** cluster is used for the database.
* **Cache:** A managed **Redis** instance from Render is used for token blacklisting.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
