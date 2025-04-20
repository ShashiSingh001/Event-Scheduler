import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./EditEvent.css";

function EditEvent() {
  const { id } = useParams();
  const [event, setEvent] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    time: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError("");
        const userId = localStorage.getItem("userId");
        
        if (!userId || userId === "null" || userId === "undefined") {
          setError("User authentication issue. Please log out and log in again.");
          setLoading(false);
          return;
        }
        
        const res = await axios.get(`http://localhost:5000/events/${id}?user_id=${userId}`);
        if (res.data) {
          setEvent(res.data);
        } else {
          setError("Event not found");
        }
      } catch (err) {
        setError("Failed to load event. Please try again.");
        console.error("Error loading event:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    setEvent({ ...event, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const userId = localStorage.getItem("userId");
      
      if (!userId || userId === "null" || userId === "undefined") {
        setError("User authentication issue. Please log out and log in again.");
        return;
      }
      
      const eventData = {
        ...event,
        user_id: parseInt(userId, 10) // Ensure it's a number
      };
      
      await axios.put(`http://localhost:5000/events/${id}`, eventData);
      navigate("/events");
    } catch (err) {
      setError("Failed to update event. Please try again.");
      console.error("Error updating event:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-event-container">
      <div className="edit-event-card">
      <h2>Edit Event</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        {loading && !error ? (
          <div className="loading-spinner">Loading event...</div>
        ) : (
          <form onSubmit={handleUpdate} className="edit-event-form">
            <div className="form-group">
              <label htmlFor="title">Event Title</label>
              <input
                id="title"
                name="title"
                placeholder="Enter event title"
                onChange={handleChange}
                value={event.title || ""}
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
                value={event.description || ""}
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
                value={event.location || ""}
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
                  value={event.date || ""}
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
                  value={event.time || ""}
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
                {loading ? "Updating..." : "Update Event"}
              </button>
            </div>
      </form>
        )}
      </div>
    </div>
  );
}

export default EditEvent;
