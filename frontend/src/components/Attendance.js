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
            await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
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

                const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();

                if (detections) {
                    const descriptor = Array.from(detections.descriptor);

                    try {
                        const res = await axios.post(
                            `${process.env.REACT_APP_API_URL}/api/mark-attendance`,
                            { descriptor }
                        );

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
        }, 1000); // Faster interval for tiny model

        return () => clearInterval(interval);
    }, [modelsLoaded]);

    return (
        <div className="page-container">
            <div className="card attendance-card" style={{ maxWidth: "700px" }}>
                <h2>Auto Attendance System</h2>

                {!modelsLoaded ? (
                    <div className="loading-container">
                        <p className="loading-text">Initializing System...</p>
                    </div>
                ) : (
                    <>
                        <h3 className={`status-text ${status.includes("✅") ? "success" : status.includes("❌") ? "error" : ""}`}>
                            {status}
                        </h3>
                        <div className="webcam-wrapper">
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                className="webcam-feed"
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Attendance;
