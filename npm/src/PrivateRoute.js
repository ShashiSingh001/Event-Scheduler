import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const loggedIn = localStorage.getItem("loggedIn");

  if (!loggedIn) {
    // If not logged in, redirect to login page
    return <Navigate to="/login" />;
  }

  return children; // If logged in, render the event list (or any protected component)
};

export default PrivateRoute;

