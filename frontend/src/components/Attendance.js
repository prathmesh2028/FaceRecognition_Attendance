import React, { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import axios from "axios";

function Attendance() {
    const [status, setStatus] = useState("Scanning...");
    const webcamRef = useRef(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);

    useEffect(() => {
        const loadModels = async () => {
            await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
            await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
            await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
            setModelsLoaded(true);
        };
        loadModels();
    }, []);

    useEffect(() => {
        if (!modelsLoaded) return;

        const interval = setInterval(async () => {
            if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4) {
                const video = webcamRef.current.video;

                // Prevent processing if video is not ready or has 0 dimensions
                if (video.videoWidth === 0 || video.videoHeight === 0) return;

                const detections = await faceapi.detectSingleFace(video).withFaceLandmarks().withFaceDescriptor();

                if (detections) {
                    const descriptor = Array.from(detections.descriptor);

                    try {
                        const res = await axios.post("http://localhost:5000/api/mark-attendance", { descriptor });
                        if (res.data.success) {
                            setStatus(`✅ Marked Present: ${res.data.match.name}`);
                        } else {
                            setStatus("❌ Face not recognized");
                        }
                    } catch (err) {
                        console.log(err);
                    }
                }
            }
        }, 2000); // Check every 2 seconds

        return () => clearInterval(interval);
    }, [modelsLoaded]);

    return (
        <div className="page-container">
            <div className="card" style={{ maxWidth: "700px" }}>
                <h2>Auto Attendance System</h2>

                {!modelsLoaded ? (
                    <div className="loading-container">
                        <div className="loader">
                            <div className="loader-ring"></div>
                        </div>
                        <p className="loading-text">INITIALIZING SYSTEM...</p>
                    </div>
                ) : (
                    <>
                        <h3 style={{ color: status.includes("✅") ? "green" : "red" }}>{status}</h3>
                        <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                style={{ width: "100%", borderRadius: "10px" }}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Attendance;
