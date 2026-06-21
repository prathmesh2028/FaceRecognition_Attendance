# Face Recognition Attendance System - Complete Project Context

This document provides a comprehensive overview of the **Face Recognition Attendance System**, detailing the architecture, technology stack, data models, core logic, and current environment setup. You can provide this context directly to ChatGPT to help it understand the entirety of your project.

---

## 1. High-Level Architecture & Tech Stack

This is a **MERN stack** (MongoDB, Express, React, Node.js) application designed to automate attendance marking using client-side face recognition.

*   **Frontend (Client):** React.js (bootstrapped with Create React App / `react-app-rewired`), `face-api.js` for real-time facial detection and feature extraction, `react-webcam` for video streaming, `react-router-dom` for navigation, and `axios` for HTTP requests.
*   **Backend (Server):** Node.js runtime, Express.js web framework, `mongoose` for MongoDB object modeling, and `cors` for cross-origin request handling. (There are also traces of `@google-cloud/vision` and `multer` for potential future image processing integrations).
*   **Database:** MongoDB (specifically MongoDB Atlas hosted at `cluster0.9wtcshj.mongodb.net`).

---

## 2. Core Features & Frontend Components

The React frontend operates as a Single Page Application (SPA) with several key views:

*   **Registration (`Register.js`):**
    *   Streams video from the user's webcam.
    *   Uses `face-api.js` (TinyFaceDetector) to detect a face and extract a 128-dimensional face descriptor (a numerical representation of the face).
    *   Sends the student's `name`, `rollNo`, and the extracted `descriptor` to the backend.
*   **Mark Attendance (`Attendance.js`):**
    *   Captures the face descriptor from the webcam feed in real-time.
    *   Sends this unknown descriptor to the backend to be matched against the database.
*   **Manage Students (`Students.js`):**
    *   A dashboard view that lists all registered students by fetching from the backend.
    *   Allows admins/users to delete student records.
*   **Attendance History (`History.js`):**
    *   A dashboard view showing the logs of all successfully marked attendances, sorted chronologically.
    *   Includes a feature to clear/delete the entire history.

---

## 3. Backend API & Face Matching Logic

The Express server (`server.js`) handles all business logic, database transactions, and the mathematical comparison for face recognition.

### Key API Endpoints
*   `POST /api/register`: Validates uniqueness (prevents duplicate roll numbers) and saves the new student record with their 128-D face descriptor.
*   `POST /api/mark-attendance`: 
    *   **The Matching Algorithm:** Receives a live face descriptor. It fetches all registered students from MongoDB and calculates the Euclidean distance between the live descriptor and every stored descriptor.
    *   **Threshold:** It uses a minimum distance threshold of `0.6`. The student with the lowest distance under `0.6` is considered a match.
    *   **Cooldown Logic:** Once a match is found, it queries the `Attendance` collection to ensure this student hasn't already been marked in the last **30 minutes** to prevent spam/duplicate logs.
*   `GET /api/students` & `DELETE /api/students/:id`: CRUD operations for registered users.
*   `GET /api/attendance-history` & `DELETE /api/attendance-history`: Read and clear attendance logs.

### Database Models
1.  **Student Model (`models/Student.js`)**
    *   `name` (String)
    *   `roll_no` (String, Unique identifier)
    *   `face_descriptor` (Array of Numbers - 128 floats)
    *   `registered_at` (Date)
2.  **Attendance Model (`models/Attendance.js`)**
    *   `name` (String)
    *   `roll_no` (String)
    *   `timestamp` (Date, defaults to `Date.now`)

---

## 4. Current Environment & Infrastructure Setup

The project is structured as a monorepo with separate `/frontend` and `/backend` directories, managed by `concurrently` from the root `package.json` for local development.

### Environment Configuration
1.  **Backend (`backend/.env`)**
    *   `MONGO_URI`: `mongodb+srv://PRATHMESH9309:...@cluster0.9wtcshj.mongodb.net/mydb`
    *   `PORT`: `5000`
2.  **Frontend (`frontend/.env` & `frontend/.env.production`)**
    *   Local (`.env`): `REACT_APP_API_URL=http://localhost:5000`
    *   Production (`.env.production`): `REACT_APP_API_URL=https://facerecognition-attendance-2.onrender.com`
3.  **CORS:** The backend is explicitly configured to allow requests from `http://localhost:3000` and Vercel domains (`.vercel.app`).

### Deployment Strategy
*   **Backend:** Configured and deployed on **Render** (`https://facerecognition-attendance-2.onrender.com`).
*   **Frontend:** Deployed on **Vercel** (`https://face-recognition-attendance-duui.vercel.app/`).
*   **Database:** Hosted on **MongoDB Atlas**.
