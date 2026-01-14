# Face Recognition Attendance System

A MERN stack application that marks attendance using Face Recognition (`face-api.js`) and stores data in MongoDB.

## Features
- **Mobile Optimized**: Lightweight `TinyFaceDetector` model for fast performance on mobile devices.
- **Real-time Attendance**: Detected faces are instantly matched against the database.
- **Geo-fencing / Time-fencing** (Logic available in backend).
- **Admin Dashboard**: View functionality for students and history.

## Project Structure
- **frontend/**: React.js application (created with CRA).
- **backend/**: Node.js + Express + MongoDB application.

## Local Setup

### 1. clone the repository
```bash
git clone <repository-url>
cd FaceRecognition_Attendence
```

### 2. Install Dependencies
```bash
npm install-all
# OR manually:
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 3. Environment Configuration

**Backend** (`backend/.env`):
Copy `backend/.env.example` to `backend/.env` and add your MongoDB URI:
```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

**Frontend** (`frontend/.env`):
- For **Local Development**: Set to `http://localhost:5000`
- For **Production**: The file `frontend/.env.production` is already configured for the Render backend.

### 4. Run Locally
```bash
npm start
```
This runs both frontend (localhost:3000) and backend (localhost:5000) concurrently.

## Deployment Setup

### Backend (e.g., Render)
1.  Deploy the `backend` folder.
2.  Add Environment Variable:
    - `MONGO_URI`: Your production MongoDB Atlas connection string.

### Frontend (e.g., Vercel)
1.  Deploy the `frontend` folder.
2.  Add Environment Variable:
    - `REACT_APP_API_URL`: The URL of your deployed backend (e.g., `https://your-api.onrender.com`).

## Technologies
- **Frontend**: React, face-api.js, Webcam.
- **Backend**: Express, Mongoose, MongoDB.
