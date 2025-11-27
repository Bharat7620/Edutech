import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiHome, FiBookOpen } from "react-icons/fi";
import { IoLogOutOutline } from "react-icons/io5";

import {
  LuCalendar,
  LuTrophy,
  LuUser,
  LuGalleryHorizontalEnd,
} from "react-icons/lu";
import { TbReportAnalytics } from "react-icons/tb";
import logo from "../assets/logo.png";

function Sidebar({ isOpen, setIsOpen }) {
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  // Detect screen size
  useEffect(() => {
    const checkScreen = () => {
      if (window.innerWidth <= 1024) {
        setIsMobile(true);
        setIsOpen(false);
      } else {
        setIsMobile(false);
        setIsOpen(true);
      }
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, [setIsOpen]);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: <FiHome /> },
    { path: "/courses", label: "Courses", icon: <FiBookOpen /> },
    {
      path: "/subscription",
      label: "Subscriptions",
      icon: <LuGalleryHorizontalEnd />,
    },
    { path: "/schedule", label: "Schedule", icon: <LuCalendar /> },
    { path: "/leaderboard", label: "Leaderboard", icon: <LuTrophy /> },
    { path: "/profile", label: "Profile", icon: <LuUser /> },
  ];

  const handleLogout = () => {
    navigate("/"); // Redirect to login page
  };

  return (
    <>
      {isMobile && (
        <button
          className="mobile-toggle"
          onClick={() => setIsOpen(!isOpen)}
          style={{ zIndex: 5000 }}
        >
          ☰
        </button>
      )}

      <aside
        className={`sidebar ${isOpen ? "open" : ""}`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: "240px",
          overflowY: "auto",
          background: "#fff",
          transition: "transform 0.3s ease",
          transform:
            isMobile && !isOpen ? "translateX(-100%)" : "translateX(0)",
          borderRight: "1px solid #e5e5e5",
          zIndex: 3000,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div className="logo">
            <img src={logo} alt="Logo" />
          </div>

          <nav>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                onClick={() => isMobile && setIsOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
