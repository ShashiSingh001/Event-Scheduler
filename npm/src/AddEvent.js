import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AddEvent.css";

function AddEvent() {
  const [event, setEvent] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    time: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setEvent({ ...event, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const userId = localStorage.getItem("userId");
      
      // Validate user ID
      if (!userId || userId === "null" || userId === "undefined") {
        setError("User authentication issue. Please log out and log in again.");
        return;
      }
      
      const eventData = {
        ...event,
        user_id: parseInt(userId, 10) // Ensure it's a number
      };
      
      await axios.post("http://localhost:5000/events", eventData);
      navigate("/events");
    } catch (err) {
      setError("Failed to create event. Please try again.");
      console.error("Error creating event:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-event-container">
      <div className="add-event-card">
        <h2>Create New Event</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="add-event-form">
          <div className="form-group">
            <label htmlFor="title">Event Title</label>
            <input
              id="title"
              name="title"
              placeholder="Enter event title"
              onChange={handleChange}
              value={event.title}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="Enter event description"
              onChange={handleChange}
              value={event.description}
              rows="4"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              name="location"
              placeholder="Enter event location"
              onChange={handleChange}
              value={event.location}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                name="date"
                type="date"
                onChange={handleChange}
                value={event.date}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="time">Time</label>
              <input
                id="time"
                name="time"
                type="time"
                onChange={handleChange}
                value={event.time}
                required
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => navigate("/events")}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEvent;
