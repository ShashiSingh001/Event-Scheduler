import React, { useState, useEffect } from "react";
import { Route, Routes, Navigate, Link, useNavigate, useLocation } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import EventList from "./EventList";
import AddEvent from "./AddEvent";
import EditEvent from "./EditEvent";
import EventDetails from "./EventDetails";
import PrivateRoute from "./PrivateRoute";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loggedIn = localStorage.getItem("loggedIn");
    if (loggedIn) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <div className="app-container">
      {/* Header with navigation */}
      <header className="app-header">
        <div className="logo">
          <h1>EventScheduler</h1>
        </div>
        
        <nav className="main-nav">
          {isLoggedIn ? (
            <>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={location.pathname === "/login" ? "active" : ""}>
                Login
              </Link>
              <Link to="/signup" className={location.pathname === "/signup" ? "active" : ""}>
                Signup
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          {!isLoggedIn ? (
            <>
              <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </>
          ) : (
            <>
              <Route
                path="/events"
                element={
                  <PrivateRoute>
                    <EventList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/events/:id"
                element={
                  <PrivateRoute>
                    <EventDetails />
                  </PrivateRoute>
                }
              />
              <Route
                path="/add"
                element={
                  <PrivateRoute>
                    <AddEvent />
                  </PrivateRoute>
                }
              />
              <Route
                path="/edit/:id"
                element={
                  <PrivateRoute>
                    <EditEvent />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<Navigate to="/events" />} />
            </>
          )}
        </Routes>
      </main>
    </div>
  );
}

export default App;
