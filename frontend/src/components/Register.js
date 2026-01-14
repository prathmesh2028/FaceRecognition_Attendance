import React, { useState, useEffect } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import axios from "axios";

function Register() {
    const [name, setName] = useState("");
    const [rollNo, setRollNo] = useState("");
    const [imgSrc, setImgSrc] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const webcamRef = React.useRef(null);

    useEffect(() => {
        const loadModels = async () => {
            try {
                // Load TinyFaceDetector model instead of SSD Mobilenet
                await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
                await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
                await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
                console.log("Models loaded");
                setModelsLoaded(true);
            } catch (err) {
                console.error("Error loading models:", err);
            }
        };
        loadModels();
    }, []);

    const capture = React.useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImgSrc(imageSrc);
    }, [webcamRef]);

    const handleRegister = async () => {
        if (!name || !rollNo || !imgSrc) return alert("Name, Roll No, and Photo required!");
        if (!modelsLoaded) return alert("Models not loaded yet! Please wait.");

        setLoading(true);
        try {
            const img = await faceapi.fetchImage(imgSrc);

            // Use TinyFaceDetectorOptions
            const detections = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();

            if (!detections) {
                alert("No face detected! Please ensure better lighting or move closer.");
                setLoading(false);
                return;
            }

            const descriptor = Array.from(detections.descriptor);

            const res = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/register`,
                { name, rollNo, descriptor }
            );

            if (res.data.success) {
                alert("Registered successfully!");
                setImgSrc(null);
                setName("");
                setRollNo("");
            }
        } catch (err) {
            console.error(err);
            const msg = err.response && err.response.data && err.response.data.msg ? err.response.data.msg : "Registration failed! Check console/backend.";
            alert(msg);
        }
        setLoading(false);
    };

    return (
        <div className="page-container">
            <div className="card">
                <h2>Register Student</h2>
                <input
                    type="text"
                    placeholder="Enter Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input"
                />
                <input
                    type="text"
                    placeholder="Enter Roll Number"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    className="input"
                />

                <div style={{ margin: "20px 0", display: "flex", justifyContent: "center" }}>
                    {imgSrc ? (
                        <img src={imgSrc} alt="Captured" style={{ width: "100%", borderRadius: "10px" }} />
                    ) : (
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            style={{ width: "100%", borderRadius: "10px" }}
                        />
                    )}
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                    {!imgSrc ? (
                        <button onClick={capture} className="btn">Capture Photo</button>
                    ) : (
                        <>
                            <button onClick={() => setImgSrc(null)} className="btn btn-secondary">Retake</button>
                            <button onClick={handleRegister} disabled={loading} className="btn" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {loading ? <><span className="spinner-small"></span> Processing...</> : "Register"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Register;
