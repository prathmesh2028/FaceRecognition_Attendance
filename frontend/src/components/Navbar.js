import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

function Navbar() {
    const location = useLocation();
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
                <Link to="/register" className={isActive("/register")} onClick={closeMenu}>Register</Link>
                <Link to="/students" className={isActive("/students")} onClick={closeMenu}>Students</Link>
                <Link to="/attendance" className={isActive("/attendance")} onClick={closeMenu}>Mark Attendance</Link>
                <Link to="/history" className={isActive("/history")} onClick={closeMenu}>History</Link>
            </div>
        </nav>
    );
}

export default Navbar;
