import { useState, useMemo,useEffect } from "react";
import SmallChatBox from "../components/SmallChatBox";
import { Calendar, Video, Bell } from "lucide-react";
import "../assets/schedule.css";
import AppLayout from "../components/AppLayout";
 
function AddEventModal({ isOpen, onClose, onAdd }) {
  const [form, setForm] = useState({
    title: "",
    instructor: "",
    type: "Live Class",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    maxStudents: 30,
  });
 
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }
 
  function handleSubmit(e) {
    e.preventDefault();
    if (
      !form.title ||
      !form.instructor ||
      !form.date ||
      !form.startTime ||
      !form.endTime
    ) {
      alert(
        "Please fill in title, instructor, date, start time, and end time."
      );
      return;
    }
    const timeRange = `${form.startTime} - ${form.endTime}`;
    const newEvent = {
      title: form.title,
      instructor: form.instructor,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      location: form.location || "Online",
      maxStudents: form.maxStudents,
      type: form.type,
    };
 
    // Try to save to backend; fall back to local update on failure
    (async () => {
      try {
        const api = await import("../api");
        const res = await api.createEvent(newEvent);
        if (res && res._id) {
          onAdd({
            title: res.title,
            instructor: form.instructor,
            date: new Date(res.date).toLocaleDateString(),
            time: `${res.startTime || form.startTime} - ${res.endTime || form.endTime}`,
            location: res.location || 'Online',
            students: (res.enrolledStudents || []).length + ' students',
            type: res.type || form.type,
          });
        } else {
          onAdd({
            title: newEvent.title,
            instructor: newEvent.instructor,
            date: newEvent.date,
            time: timeRange,
            location: newEvent.location,
            students: `${newEvent.maxStudents} students`,
            type: newEvent.type,
          });
        }
      } catch (err) {
        console.warn('API create event failed, falling back to local state', err.message || err);
        onAdd({
          title: newEvent.title,
          instructor: newEvent.instructor,
          date: newEvent.date,
          time: timeRange,
          location: newEvent.location,
          students: `${newEvent.maxStudents} students`,
          type: newEvent.type,
        });
      }
      onClose();
    })();
  }
 
  if (!isOpen) return null;
 
  return (
    <div className="modal-backdrop">
      <div className="modal-panel">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 style={{ marginBottom: 0 }}>Add New Event</h5>
          <button className="btn btn-light btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>
 
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">Event Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="form-control"
                placeholder="e.g., Advanced Mathematics"
              />
            </div>
 
            <div className="col-md-6">
              <label className="form-label">Instructor</label>
              <input
                name="instructor"
                value={form.instructor}
                onChange={handleChange}
                className="form-control"
                placeholder="e.g., Dr. Sarah Smith"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Event Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="form-select"
              >
                <option>Live Class</option>
                <option>Workshop</option>
                <option>Lab Session</option>
                <option>Seminar</option>
              </select>
            </div>
 
            <div className="col-md-6">
              <label className="form-label">Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Start Time</label>
              <input
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">End Time</label>
              <input
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                className="form-control"
              />
            </div>
 
            <div className="col-md-6">
              <label className="form-label">Location</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                className="form-control"
                placeholder="e.g., Virtual Room 1"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Max Students</label>
              <input
                type="number"
                min="1"
                name="maxStudents"
                value={form.maxStudents}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>
 
          <div className="d-flex justify-content-end gap-2 mt-4">
            <button type="button" className="btn btn-light" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-modal">
              Add Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
 
function Schedule() {
  const initialClasses = [
    {
      title: "Advanced Mathematics",
      instructor: "Dr. Sarah Smith",
      date: "March 16, 2025",
      time: "1:00 PM - 2:30 PM",
      location: "Virtual Room 1",
      students: "45 students",
      type: "Live Class",
    },
    {
      title: "Physics Laboratory",
      instructor: "Prof. Michael Johnson",
      date: "March 17, 2025",
      time: "10:00 AM - 11:30 AM",
      location: "Virtual Lab 3",
      students: "30 students",
      type: "Lab Session",
    },
    {
      title: "Chemistry Fundamentals",
      instructor: "Dr. Emily Williams",
      date: "March 18, 2025",
      time: "2:00 PM - 3:30 PM",
      location: "Virtual Room 2",
      students: "52 students",
      type: "Live Class",
    },
    {
      title: "Web Development Workshop",
      instructor: "John Davis",
      date: "March 19, 2025",
      time: "3:00 PM - 5:00 PM",
      location: "Virtual Workshop Hall",
      students: "38 students",
      type: "Workshop",
    },
  ];
 
  const [classes, setClasses] = useState(initialClasses);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSmallChatOpen, setIsSmallChatOpen] = useState(false);
 
  // Load events from backend if available
  useEffect(() => {
    (async () => {
      try {
        const api = await import("../api");
        const res = await api.getEvents();
        if (Array.isArray(res)) {
          const mapped = res.map((e) => ({
            title: e.title,
            instructor: e.instructor && (e.instructor.fullName || e.instructor.email) || "TBD",
            date: e.date ? new Date(e.date).toLocaleDateString() : 'TBD',
            time: `${e.startTime || 'TBD'} - ${e.endTime || 'TBD'}`,
            location: e.location || 'Online',
            students: (e.enrolledStudents || []).length + ' students',
            type: e.type || 'Live Class',
          }));
          setClasses((prev) => [...mapped, ...prev]);
        }
      } catch (err) {
        console.warn('Failed to load events from API', err.message || err);
      }
    })();
  }, []);
 
  const todaySchedule = [
    {
      time: "09:00 AM",
      title: "Morning Study Session",
      bgColor: "#EDF2F7",
      textColor: "#4a5568",
    },
    {
      time: "11:00 AM",
      title: "Data Structures Lecture",
      bgColor: "#2B6CB0",
      textColor: "#ffffff",
    },
    {
      time: "02:00 PM",
      title: "AI Tutor Session",
      bgColor: "#38B2AC",
      textColor: "#ffffff",
    },
    {
      time: "04:00 PM",
      title: "Group Project Meeting",
      bgColor: "#48BB78",
      textColor: "#ffffff",
    },
  ];
 
  const [currentDate, setCurrentDate] = useState(() => new Date());
 
  const weekStart = useMemo(() => {
    const date = new Date(currentDate);
    const day = date.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    const start = new Date(date);
    start.setDate(date.getDate() + diff);
    start.setHours(0, 0, 0, 0);
    return start;
  }, [currentDate]);
 
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      days.push(d);
    }
    return days;
  }, [weekStart]);
 
  const monthLabel = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(undefined, {
      month: "long",
      year: "numeric",
    });
    return formatter.format(currentDate);
  }, [currentDate]);
 
  function handlePrevWeek() {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  }
 
  function handleNextWeek() {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  }
 
  return (
    <AppLayout showGreeting={false}>
      <div
        className="container-fluid"
        style={{
          backgroundColor: "#f5f7fa",
          minHeight: "100vh",
          padding: "24px",
        }}
      >
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1
                  style={{
                    fontSize: "1.875rem",
                    fontWeight: "600",
                    color: "#1e293b",
                    marginBottom: "4px",
                  }}
                >
                  My Schedule
                </h1>
                <p
                  style={{
                    color: "#64748b",
                    fontSize: "0.875rem",
                    marginBottom: 0,
                  }}
                >
                  Manage your classes and study sessions
                </p>
              </div>
 
              <button
                className="btn btn-event d-flex align-items-center gap-2"
                onClick={() => setIsAddOpen(true)}
              >
                <Calendar size={20} />
                Add Event
              </button>
            </div>
          </div>
        </div>
 
        {/* Calendar + Navigation */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="schedule-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "600",
                    marginBottom: 0,
                  }}
                >
                  {monthLabel}
                </h5>
 
                <div>
                  <button
                    className="btn btn-sm btn-light me-2"
                    onClick={handlePrevWeek}
                  >
                    Previous
                  </button>
 
                  <button
                    className="btn btn-sm btn-light"
                    onClick={handleNextWeek}
                  >
                    Next
                  </button>
                </div>
              </div>
 
              <div className="row g-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <div key={d} className="col text-center">
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#64748b",
                        marginBottom: "8px",
                        fontWeight: "500",
                      }}
                    >
                      {d}
                    </div>
                  </div>
                ))}
              </div>
 
              <div className="row g-2">
                {weekDays.map((day) => {
                  const isActive =
                    day.toDateString() === currentDate.toDateString();
                  return (
                    <div key={day.toISOString()} className="col">
                      <div
                        className={`calendar-day ${isActive ? "active" : ""}`}
                      >
                        {day.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
 
        {/* Main Content */}
        <div className="row">
          <div className="col-lg-8 mb-4">
            <h5
              style={{
                fontSize: "1.125rem",
                fontWeight: "600",
                marginBottom: "16px",
              }}
            >
              Upcoming Classes
            </h5>
 
            {classes.map((classItem, idx) => (
              <div key={idx} className="class-card">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h6
                      style={{
                        fontSize: "1.125rem",
                        fontWeight: "600",
                        marginBottom: "4px",
                      }}
                    >
                      {classItem.title}
                    </h6>
                    <p
                      style={{
                        color: "#64748b",
                        fontSize: "0.875rem",
                        marginBottom: 0,
                      }}
                    >
                      {classItem.instructor}
                    </p>
                  </div>
 
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-color btn-sm d-flex align-items-center gap-1"
                      onClick={() => alert(`Join ${classItem.title}`)}
                    >
                      <Video size={16} />
                      Join
                    </button>
 
                    <button
                      className="btn btn-reminder btn-sm d-flex align-items-center gap-1"
                      onClick={() =>
                        alert(`Reminder set for ${classItem.title}`)
                      }
                    >
                      <Bell size={16} />
                      Remind
                    </button>
                  </div>
                </div>
 
                <div
                  className="d-flex flex-wrap gap-3"
                  style={{ fontSize: "0.875rem", color: "#64748b" }}
                >
                  <div className="d-flex align-items-center gap-1">
                    <Calendar size={16} />
                    {classItem.date}
                  </div>
 
                  <div className="d-flex align-items-center gap-1">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {classItem.time}
                  </div>
                </div>
 
                <div
                  className="d-flex flex-wrap gap-3 mt-2"
                  style={{ fontSize: "0.875rem", color: "#64748b" }}
                >
                  <div className="d-flex align-items-center gap-1">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {classItem.location}
                  </div>
 
                  <div className="d-flex align-items-center gap-1">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    {classItem.students}
                  </div>
 
                  <span className={`schedule-badge`}>{classItem.type}</span>
                </div>
              </div>
            ))}
          </div>
 
          {/* Side Panel */}
          <div className="col-lg-4">
            <div className="schedule-card p-4 mb-4">
              <h5
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "600",
                  marginBottom: "16px",
                }}
              >
                Today's Schedule
              </h5>
 
              {todaySchedule.map((event, idx) => (
                <div
                  key={idx}
                  className="mb-3 d-flex align-items-center"
                  style={{ gap: "12px" }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#64748b",
                      minWidth: "72px",
                      textAlign: "right",
                    }}
                  >
                    {event.time}
                  </div>
 
                  <div
                    className="today-event flex-grow-1"
                    style={{
                      backgroundColor: event.bgColor,
                      color: event.textColor,
                    }}
                  >
                    {event.title}
                  </div>
                </div>
              ))}
            </div>
 
            {/* Weekly Summary */}
            <div className="schedule-card p-4 mb-4">
              <h5
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "600",
                  marginBottom: "16px",
                }}
              >
                This Week
              </h5>
 
              <div className="d-flex justify-content-between mb-3">
                <span style={{ color: "#64748b" }}>Classes Attended</span>
                <span style={{ fontWeight: "600" }}>12 / 15</span>
              </div>
 
              <div className="d-flex justify-content-between mb-3">
                <span style={{ color: "#64748b" }}>Study Hours</span>
                <span style={{ fontWeight: "600" }}>18.5h</span>
              </div>
 
              <div className="d-flex justify-content-between">
                <span style={{ color: "#64748b" }}>Upcoming Classes</span>
                <span style={{ fontWeight: "600" }}>4</span>
              </div>
            </div>
 
            {/* Help Card */}
            <div
              className="schedule-card p-4"
              style={{
                background: "linear-gradient(135deg, #2B75B0, #37AFAC)",
                color: "white",
              }}
            >
              <h5
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                Need Help?
              </h5>
 
              <p
                style={{
                  fontSize: "0.875rem",
                  marginBottom: "16px",
                  opacity: 0.9,
                }}
              >
                Chat with Kavya AI Tutor for study tips and schedule planning.
              </p>
 
              <button
                className="btn btn-light w-100"
                onClick={() => setIsSmallChatOpen(true)}
              >
                Start Chat
              </button>
              {isSmallChatOpen && (
                <div style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 4000 }}>
                  <SmallChatBox onClose={() => setIsSmallChatOpen(false)} />
                </div>
              )}
            </div>
          </div>
        </div>
 
        {/* Add Event Modal */}
        <AddEventModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onAdd={(evt) => setClasses((prev) => [...prev, evt])}
        />
      </div>
    </AppLayout>
  );
}
 
export default Schedule;