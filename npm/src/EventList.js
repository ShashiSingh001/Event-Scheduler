import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./EventList.css";

function EventList() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const navigate = useNavigate();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      
      // Only fetch events if we have a valid user ID
      if (userId && userId !== "null" && userId !== "undefined") {
        const res = await axios.get(`http://localhost:5000/events?user_id=${userId}`);
        setEvents(res.data);
        setFilteredEvents(res.data);
      } else {
        console.error("Invalid user ID found:", userId);
        setEvents([]);
        setFilteredEvents([]);
      }
    } catch (error) {
      console.error("Failed to fetch events", error);
      setEvents([]);
      setFilteredEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id) => {
    try {
      const userId = localStorage.getItem("userId");
      await axios.delete(`http://localhost:5000/events/${id}?user_id=${userId}`);
      fetchEvents();
    } catch (error) {
      console.error("Failed to delete event", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Apply filters
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredEvents(events);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    let result = [...events];
    
    switch (selectedFilter) {
      case "title":
        result = result.filter(event => 
          event.title?.toLowerCase().includes(term)
        );
        break;
      case "location":
        result = result.filter(event => 
          event.location?.toLowerCase().includes(term)
        );
        break;
      case "time":
        result = result.filter(event => 
          event.time?.toLowerCase().includes(term)
        );
        break;
      case "description":
        result = result.filter(event => 
          event.description?.toLowerCase().includes(term)
        );
        break;
      default: // "all"
        result = result.filter(event => 
          event.title?.toLowerCase().includes(term) ||
          event.location?.toLowerCase().includes(term) ||
          event.description?.toLowerCase().includes(term) ||
          event.time?.toLowerCase().includes(term)
        );
    }
    
    setFilteredEvents(result);
  }, [searchTerm, selectedFilter, events]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setSelectedFilter(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSelectedFilter("all");
  };

  return (
    <div className="events-container">
      <div className="events-header">
        <h2 className="events-title">Events</h2>
        <button className="add-event-btn" onClick={() => navigate("/add")}>
          <i className="plus-icon">+</i> Add Event
        </button>
      </div>

      <div className="search-filter-container">
        <h3 className="filter-section-title">Search & Filter Events</h3>
        <div className="search-controls">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            {searchTerm && (
              <button 
                className="clear-search-btn"
                onClick={clearSearch}
              >
                ✕
              </button>
            )}
          </div>
          
          <div className="filter-dropdown-container">
            <select
              value={selectedFilter}
              onChange={handleFilterChange}
              className="filter-dropdown"
            >
              <option value="all">All Fields</option>
              <option value="title">Title</option>
              <option value="location">Location</option>
              <option value="time">Time</option>
              <option value="description">Description</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="no-events">
          {searchTerm ? (
            <p>No events found matching your criteria. Try different search terms.</p>
          ) : (
            <p>No events found. Create your first event!</p>
          )}
        </div>
      ) : (
        <div className="event-list">
          {filteredEvents.map((event) => (
            <div className="event-list-item" key={event.id} onClick={() => navigate(`/events/${event.id}`)}>
              <h3 className="event-title">{event.title}</h3>
              <div className="event-actions">
                <button 
                  className="edit-btn" 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/edit/${event.id}`);
                  }}
                >
                  Edit
                </button>
                <button 
                  className="delete-btn" 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm("Are you sure you want to delete this event?")) {
                      deleteEvent(event.id);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EventList;
