import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

function Navbar() {
    const location = useLocation();
    const { admin, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const isActive = (path) => location.pathname === path ? "nav-link active" : "nav-link";
    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    return (
        <nav className="navbar">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <img src="/logo.png" alt="Logo" className="navbar-logo" />
                <h1 className="navbar-title">
                    <span className="brand-vision">Vision</span>
                    <span className="brand-ai">AI</span>
                </h1>
            </div>

            <div className="hamburger" onClick={toggleMenu}>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
            </div>

            <div className={`nav-links ${isOpen ? "open" : ""}`}>
                <Link to="/" className={isActive("/")} onClick={closeMenu}>Home</Link>
                {admin ? (
                    <>
                        {admin.role === 'SUPER_ADMIN' && (
                            <Link to="/admin-requests" className={isActive("/admin-requests")} onClick={closeMenu}>Requests</Link>
                        )}
                        <Link to="/register" className={isActive("/register")} onClick={closeMenu}>Register</Link>
                        <Link to="/students" className={isActive("/students")} onClick={closeMenu}>Students</Link>
                        <Link to="/attendance" className={isActive("/attendance")} onClick={closeMenu}>Attendance</Link>
                        <Link to="/history" className={isActive("/history")} onClick={closeMenu}>History</Link>
                        <button onClick={() => { logout(); closeMenu(); }} className="btn" style={{ marginLeft: "10px", padding: "5px 15px", backgroundColor: "#EF4444" }}>Logout</button>
                    </>
                ) : (
                    <Link to="/login" className={isActive("/login")} onClick={closeMenu}>Login</Link>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
