import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Register from "./components/Register";
import Attendance from "./components/Attendance";
import History from "./components/History";
import Students from "./components/Students";
import Navbar from "./components/Navbar";
import { useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import "./App.css";

function Home() {
  return (
    <div className="page-container">
      <div className="card">
        <h1>Face Recognition Attendance</h1>
        <p style={{ margin: "20px 0", color: "#666" }}>
          Secure, automated, and fast attendance system.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <Link to="/register" className="btn">Register New Student</Link>
          <Link to="/attendance" className="btn btn-secondary">Start Attendance Scanner</Link>
          <Link to="/students" className="btn btn-secondary">Manage Students</Link>
          <Link to="/history" className="btn btn-secondary" style={{ backgroundColor: "#374151", color: "white" }}>View History</Link>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [modelError, setModelError] = useState(null);

  // Preload models
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      try {
        console.log("Starting model load...");
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        console.log("Models loaded successfully");
        setModelsLoaded(true);
      } catch (err) {
        console.error("Failed to load models", err);
        setModelError(err.message || "Failed to load models. Check console for details.");
      }
    };
    loadModels();
  }, []);

  if (modelError) {
    return (
      <div className="page-container">
        <div className="card" style={{ color: "red" }}>
          <h2>Error Loading AI Models</h2>
          <p>{modelError}</p>
        </div>
      </div>
    );
  }

  if (!modelsLoaded) {
    return (
      <div className="page-container">
        <h2>Loading AI Models... Please wait.</h2>
      </div>
    );
  }

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/history" element={<History />} />
        <Route path="/students" element={<Students />} />
      </Routes>
      <footer className="footer">
        <p>&copy; All rights reserved 2026</p>
      </footer>
    </Router>
  );
}

export default App;
