import React, { useState, useEffect } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Schedule from "./pages/Schedule";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import Subscription from "./pages/Subscription";
import PaymentInterface from "./components/PaymentInterface";

function Layout() {
  const location = useLocation();
  const hideLayout =
    location.pathname === "/" || location.pathname === "/register";

  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

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
  }, []);

  return (
    <div className="app-container">
      {!hideLayout && (
        <>
          {/* Hamburger icon */}
          {isMobile && (
            <button className="mobile-toggle" onClick={() => setIsOpen(true)}>
              ☰
            </button>
          )}

          <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} isMobile={isMobile} />
        </>
      )}

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Registration />} />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/subscription" element={<Subscription />}></Route>
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/payment" element={<PaymentInterface />}></Route>
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
