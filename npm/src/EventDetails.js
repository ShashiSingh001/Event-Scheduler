// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";
// import "./EventDetails.css";


// function EventDetails() {
//   const { id } = useParams();
//   const [event, setEvent] = useState(null);

//   useEffect(() => {
//     const fetchEvent = async () => {
//       try {
//         const res = await axios.get(`http://localhost:5000/events/${id}`);
//         setEvent(res.data);
//       } catch (error) {
//         console.error("Error fetching event details", error);
//       }
//     };

//     fetchEvent();
//   }, [id]);

//   if (!event) {
//     return <p>Loading event details...</p>;
//   }

//   return (
//     <div style={{ maxWidth: "600px", margin: "auto", marginTop: "40px" }}>
//       <h2>{event.title}</h2>
//       <p><strong>Description:</strong> {event.description}</p>
//       <p><strong>Location:</strong> {event.location}</p>
//       <p><strong>Date:</strong> {event.date}</p>
//       <p><strong>Time:</strong> {event.time}</p>
//     </div>
//   );
// }

// export default EventDetails;

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./EventDetails.css";

function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const userId = localStorage.getItem("userId");
        
        if (!userId || userId === "null" || userId === "undefined") {
          setError("User authentication issue. Please log out and log in again.");
          setLoading(false);
          return;
        }
        
        const response = await axios.get(`http://localhost:5000/events/${id}?user_id=${userId}`);
        setEvent(response.data);
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="event-details-container">
        <div className="loading-spinner">Loading event details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="event-details-container">
        <div className="error-message">{error}</div>
        <Link to="/events" className="back-btn">Back to Events</Link>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-details-container">
        <div className="error-message">Event not found</div>
        <Link to="/events" className="back-btn">Back to Events</Link>
      </div>
    );
  }

  return (
    <div className="event-details-container">
      <div className="event-header">
        <h2>{event.title}</h2>
      </div>
      
      <div className="event-details-section">
        <p><strong>Description:</strong> {event.description || "No description provided"}</p>
      </div>
      
      <div className="event-details-section">
        <p><strong>Location:</strong> {event.location || "Location not specified"}</p>
      </div>
      
      <div className="event-details-section">
        <p><strong>Date:</strong> {event.date}</p>
      </div>
      
      <div className="event-details-section">
        <p><strong>Time:</strong> {event.time}</p>
      </div>
      
      <Link to="/events" className="back-btn">Back to Events</Link>
    </div>
  );
}

export default EventDetails;
