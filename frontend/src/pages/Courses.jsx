import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../assets/Courses.css";
import AppLayout from "../components/AppLayout";
import api from "../api";
import { useNavigate } from "react-router-dom";

// ===================================
// UTILITY HOOK FOR LOCAL STORAGE
// ===================================
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    // Check if window is defined (for server-side rendering safety)
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      // If item is found and not empty, parse it, otherwise return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};
// ===================================

// Initial hardcoded data (will be combined with localStorage data)
const initialGettingStarted = [
  {
    title: "Introduction to the Course",
    duration: "10 min",
    status: "Review",
    iconClass: "bi-check2-circle",
    iconBgClass: "lesson-icon",
  },
  {
    title: "Setting up Your Environment",
    duration: "15 min",
    status: "Review",
    iconClass: "bi-check2-circle",
    iconBgClass: "lesson-icon",
  },
  {
    title: "Course Overview",
    duration: "20 min",
    status: "Start",
    iconClass: "bi-play-circle",
    iconBgClass: "lesson-icon",
    actionClass: "lesson-action",
    videoLink: "https://www.youtube.com/embed/tMHrpmJH5I8",
  },
];

const initialCoreConcepts = [
  {
    title: "Understanding the Basics",
    duration: "30 min",
    status: "Start",
    iconClass: "bi-play-fill",
    iconBgClass: "lesson-icon",
    actionClass: "lesson-action1",
    videoLink: "https://www.youtube.com/embed/UCdxT4d8k5c",
  },
  {
    title: "Advanced Techniques",
    duration: "45 min",
    status: "Locked",
    iconClass: "bi-lock-fill",
    iconBgClass: "muted-circle",
    actionClass: "muted small",
  },
  {
    title: "Best Practices",
    duration: "35 min",
    status: "Locked",
    iconClass: "bi-lock-fill",
    iconBgClass: "muted-circle",
    actionClass: "muted small",
  },
];

const initialPracticalApplications = [
  {
    title: "Project Setup",
    duration: "25 min",
    status: "Locked",
    iconClass: "bi-lock-fill",
    iconBgClass: "muted-circle",
    actionClass: "muted small",
  },
  {
    title: "Building Your First Project",
    duration: "1h 30 min",
    status: "Locked",
    iconClass: "bi-lock-fill",
    iconBgClass: "muted-circle",
    actionClass: "muted small",
  },
  {
    title: "Testing and Deployment",
    duration: "40 min",
    status: "Locked",
    iconClass: "bi-lock-fill",
    iconBgClass: "muted-circle",
    actionClass: "muted small",
  },
];

const initialInstructor = {
  name: "John Smith",
  title:
    "Senior Full Stack Developer with 10+ years of experience in web development. Passionate about teaching and helping students achieve their goals.",
  stats: {
    students: "25,000+",
    courses: "12",
    rating: "4.9",
  },
};

const initialReviews = [
  {
    id: 1,
    name: "Student 1",
    rating: 5,
    text: "Excellent course! The instructor explains everything clearly and the projects are very practical. Highly recommended for anyone wanting to learn web development.",
    avatar: "U1",
  },
  {
    id: 2,
    name: "Student 2",
    rating: 5,
    text: "Excellent course! The instructor explains everything clearly and the projects are very practical. Highly recommended for anyone wanting to learn web development.",
    avatar: "U2",
  },
  {
    id: 3,
    name: "Student 3",
    rating: 5,
    text: "Excellent course! The instructor explains everything clearly and the projects are very practical. Highly recommended for anyone wanting to learn web development.",
    avatar: "U3",
  },
];

// Initial Resource data (Note: they don't have dataURL initially)
const initialResources = [
  { name: "Course Syllabus.pdf", type: "pdf", dataURL: null },
  { name: "Code Examples.zip", type: "zip", dataURL: null },
  { name: "Reference Guide.pdf", type: "pdf", dataURL: null },
  { name: "Project Templates.zip", type: "zip", dataURL: null },
];

const initialQuizzes = [
  {
    name: "Module 1 Assessment",
    questions: 10,
    passingScore: 70,
    status: "Start Quiz",
    iconClass: "bi-patch-question",
    iconBgClass: "lesson-icon",
  },
];

// Utility function for stars
const renderStars = (rating) => {
  const fullStars = Array(rating)
    .fill()
    .map((_, i) => <i key={i} className="bi bi-star-fill"></i>);
  return fullStars;
};

// ===================================
// CURRICULUM, INSTRUCTOR, REVIEW, RESOURCE FORMS (Updated CurriculumForm)
// ===================================

function CurriculumForm({ addCurriculumModule, toggleForm }) {
  // Module State
  const [moduleTitle, setModuleTitle] = useState("");
  const [totalDuration, setTotalDuration] = useState("");

  // Lesson 1 States (Required)
  const [title1, setTitle1] = useState("");
  const [duration1, setDuration1] = useState("");
  const [status1, setStatus1] = useState("Start");

  // NEW: State for dynamically added lessons (replaces Lessons 2 & 3)
  const [additionalLessons, setAdditionalLessons] = useState([]);

  // Utility function to generate a unique ID for new lessons
  const generateId = () => Date.now() + Math.random();

  // Handler to add a new optional lesson
  const addLesson = () => {
    setAdditionalLessons((prevLessons) => [
      ...prevLessons,
      {
        id: generateId(),
        title: "",
        duration: "",
        status: "Start",
      },
    ]);
  };

  // Handler to remove a dynamic lesson
  const removeLesson = (id) => {
    setAdditionalLessons((prevLessons) =>
      prevLessons.filter((lesson) => lesson.id !== id)
    );
  };

  // Handler to update the fields of a dynamic lesson
  const handleAdditionalLessonChange = (id, field, value) => {
    setAdditionalLessons((prevLessons) =>
      prevLessons.map((lesson) =>
        lesson.id === id ? { ...lesson, [field]: value } : lesson
      )
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Lesson 1 data (Required)
    const lesson1Data = { title: title1, duration: duration1, status: status1 };

    // Combine Lesson 1 with dynamically added lessons
    const allLessonsInput = [lesson1Data, ...additionalLessons];

    // Process and filter lessons (only include if title is present)
    const lessons = allLessonsInput
      .filter((l) => l.title.trim() !== "")
      .map((l) => ({
        title: l.title,
        // Individual lesson duration uses the minutes input with " min" suffix
        duration:
          l.duration && l.duration.toString().trim() !== ""
            ? l.duration + " min"
            : "N/A",
        status: l.status,
        iconClass: l.status === "Start" ? "bi-play-circle" : "bi-lock-fill",
        iconBgClass: l.status === "Start" ? "lesson-icon" : "muted-circle",
        actionClass: l.status === "Locked" ? "muted small" : "lesson-action",
      }));

    if (lessons.length === 0) {
      alert("Please add at least one lesson title.");
      return;
    }

    // Create the new module object
    const newModule = {
      title: moduleTitle,
      lessons: lessons,
      // Use the manually entered duration string
      totalDuration: totalDuration || "N/A",
    };

    addCurriculumModule(newModule); // Pass the entire new module
    toggleForm(false); // Close the form after successful save
  };

  // Form structure matching the look of the curriculum panels
  return (
    <div className="curriculum-panel rounded-3 overflow-hidden mb-3">
      <div className="curriculum-header d-flex justify-content-between align-items-center p-3">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-plus-square header-icon"></i>
          <strong>Add New Module and Lessons</strong>
        </div>
        <button
          className="btn btn-sm btn-light"
          onClick={() => toggleForm(false)}
        >
          <i className="bi bi-x"></i> Close
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-3 bg-white">
        {/* MODIFIED: Module Name and Manual Total Duration side-by-side */}
        <div className="row mb-4">
          {/* Module Name Input (Required) */}
          <div className="col-md-8 mb-3 mb-md-0">
            <label className="form-label small muted">New Module Name</label>
            <input
              type="text"
              className="form-control"
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
              placeholder="e.g. React Hooks"
              required
            />
          </div>

          {/* MODIFIED: Manual Total Duration Input */}
          <div className="col-md-4">
            <label className="form-label small muted">
              Total Duration (e.g., 2h 30min)
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-clock"></i>
              </span>
              <input
                type="text"
                className="form-control"
                value={totalDuration}
                onChange={(e) => setTotalDuration(e.target.value)}
                placeholder="e.g. 2h 30min"
                required
              />
            </div>
          </div>
        </div>

        {/* --- Lesson 1 (Required) with PLUS button --- */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0">Lesson 1 Details (Required)</h6>
          {/* The requested + icon to add new lessons */}
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={addLesson}
            title="Add New Lesson"
          >
            <i className="bi bi-plus"></i> Add New Lesson
          </button>
        </div>
        <div className="row mb-3">
          <div className="col-md-6 mb-3 mb-md-0">
            <label className="form-label small muted">Lesson 1 Title</label>
            <input
              type="text"
              className="form-control"
              value={title1}
              onChange={(e) => setTitle1(e.target.value)}
              placeholder="e.g. State Management"
              required
            />
          </div>
          <div className="col-md-3 mb-3 mb-md-0">
            <label className="form-label small muted">Duration (mins)</label>
            <input
              type="number"
              className="form-control"
              value={duration1}
              onChange={(e) => setDuration1(e.target.value)}
              placeholder="e.g. 30"
              required
            />
          </div>
          <div className="col-md-3">
            <label className="form-label small muted">Status</label>
            <select
              className="form-select"
              value={status1}
              onChange={(e) => setStatus1(e.target.value)}
            >
              <option value="Start">Start</option>
              <option value="Locked">Locked</option>
            </select>
          </div>
        </div>

        {/* --- Dynamically Added Lessons (Replaces Lessons 2 & 3) --- */}
        {additionalLessons.map((lesson, index) => (
          <div key={lesson.id} className="mt-4 pt-4 border-top">
            <div className="d-flex justify-content-between align-items-center mb-3">
              {/* Lesson numbering starts after Lesson 1 (i.e., Lesson 2, 3, 4, ...) */}
              <h6 className="mb-0">Lesson {index + 2} Details (Optional)</h6>
              {/* Remove button for dynamic lessons */}
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={() => removeLesson(lesson.id)}
                title="Remove Lesson"
              >
                <i className="bi bi-x"></i> Remove
              </button>
            </div>
            <div className="row mb-3">
              <div className="col-md-6 mb-3 mb-md-0">
                <label className="form-label small muted">Lesson Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={lesson.title}
                  onChange={(e) =>
                    handleAdditionalLessonChange(
                      lesson.id,
                      "title",
                      e.target.value
                    )
                  }
                  placeholder="e.g. Custom Hooks"
                />
              </div>
              <div className="col-md-3 mb-3 mb-md-0">
                <label className="form-label small muted">
                  Duration (mins)
                </label>
                <input
                  type="number"
                  className="form-control"
                  value={lesson.duration}
                  onChange={(e) =>
                    handleAdditionalLessonChange(
                      lesson.id,
                      "duration",
                      e.target.value
                    )
                  }
                  placeholder="e.g. 20"
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small muted">Status</label>
                <select
                  className="form-select"
                  value={lesson.status}
                  onChange={(e) =>
                    handleAdditionalLessonChange(
                      lesson.id,
                      "status",
                      e.target.value
                    )
                  }
                >
                  <option value="Start">Start</option>
                  <option value="Locked">Locked</option>
                </select>
              </div>
            </div>
          </div>
        ))}

        <button type="submit" className="btn btn-sm btn-primary mt-3">
          Save New Module
        </button>
      </form>
    </div>
  );
}

// ... rest of the component functions (InstructorForm, ReviewForm, etc.)

function InstructorForm({ addInstructor, toggleForm }) {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [students, setStudents] = useState("");
  const [courses, setCourses] = useState("");
  const [rating, setRating] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const newInstructor = {
      name,
      title,
      stats: {
        students: students || "N/A",
        courses: courses || "N/A",
        rating: rating || "N/A",
      },
    };
    addInstructor(newInstructor); // Adds a new card
    toggleForm(false);
  };
  return (
    <div className="instructor-card p-4 rounded-3 d-flex flex-column mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Add New Instructor</h5>
        <button
          className="btn btn-sm btn-light"
          onClick={() => toggleForm(false)}
        >
          <i className="bi bi-x"></i> Close
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label small muted">Name</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Jane Doe"
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label small muted">Title/Description</label>
          <textarea
            className="form-control"
            rows="3"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Expert in React and Node.js"
            required
          ></textarea>
        </div>
        <div className="row mb-3">
          <div className="col-md-4">
            <label className="form-label small muted">Students</label>
            <input
              type="text"
              className="form-control"
              value={students}
              onChange={(e) => setStudents(e.target.value)}
              placeholder="e.g. 50,000+"
            />
          </div>
          <div className="col-md-4">
            <label className="form-label small muted">Courses</label>
            <input
              type="text"
              className="form-control"
              value={courses}
              onChange={(e) => setCourses(e.target.value)}
              placeholder="e.g. 8"
            />
          </div>
          <div className="col-md-4">
            <label className="form-label small muted">Rating</label>
            <input
              type="text"
              className="form-control"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              placeholder="e.g. 4.7"
            />
          </div>
        </div>
        <button type="submit" className="btn btn-sm btn-primary">
          Save New Instructor
        </button>
      </form>
    </div>
  );
}

function ReviewForm({ addReview, toggleForm }) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const newReview = {
      id: Date.now(),
      name,
      rating: parseInt(rating),
      text,
      avatar: name.substring(0, 2).toUpperCase(),
    };
    addReview(newReview);
    toggleForm(false);
  };

  return (
    <div className="review-card-screenshot p-4 rounded-3 d-flex flex-column mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Add New Review</h5>
        <button
          className="btn btn-sm btn-light"
          onClick={() => toggleForm(false)}
        >
          <i className="bi bi-x"></i> Close
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label small muted">Student Name</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex"
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label small muted">Rating (1-5)</label>
            <select
              className="form-select"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              required
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r} Star
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label small muted">Review Text</label>
          <textarea
            className="form-control"
            rows="3"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your review here..."
            required
          ></textarea>
        </div>

        <button type="submit" className="btn btn-sm btn-primary">
          Submit Review
        </button>
      </form>
    </div>
  );
}

function ResourceList({ resources }) {
  const downloadFile = (resource) => {
    // If resource already has a stored dataURL (uploaded by user), download directly
    if (resource.dataURL) {
      const link = document.createElement("a");
      link.href = resource.dataURL;
      link.download = resource.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // For default PDF resources, generate a simple PDF dynamically
    if (resource.type === "pdf") {
      const doc = new jsPDF("landscape", "pt", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();

      // Simple certificate-style PDF (copied from Full Stack Development certificate)
      const certTitle = "Full Stack Development";
      const profileName = "Deepak Kumar";

      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(5);
      doc.rect(20, 20, pageWidth - 40, 550);

      doc.setFont("times", "bold");
      doc.setFontSize(32);
      doc.setTextColor(27, 51, 127);
      doc.text("Certificate of Completion", pageWidth / 2, 100, {
        align: "center",
      });

      doc.setFontSize(18);
      doc.setFont("times", "italic");
      doc.setTextColor(0, 0, 0);
      doc.text("This certificate is proudly presented to", pageWidth / 2, 150, {
        align: "center",
      });

      doc.setFont("times", "bold");
      doc.setFontSize(28);
      doc.setTextColor(27, 51, 127);
      doc.text(profileName, pageWidth / 2, 200, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.text(`for successfully completing the`, pageWidth / 2, 240, {
        align: "center",
      });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(60, 60, 60);
      doc.text(certTitle, pageWidth / 2, 270, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);
      doc.text(`Date: Oct 2024`, pageWidth / 2, 320, { align: "center" });

      doc.setFontSize(16);
      doc.setTextColor(100, 100, 100);
      doc.text("KavyaLearn Academy", pageWidth / 2, 370, { align: "center" });

      // Save with the resource name so clicking any default PDF downloads a certificate file
      doc.save(resource.name);
      return;
    }

    // For default non-PDF resources (e.g., .zip), create a simple placeholder file
    const blob = new Blob(
      [`Sample content for ${resource.name} (placeholder file).`],
      { type: "application/octet-stream" }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = resource.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  return (
    <div className="resources-panel p-4 rounded-3">
      <h5 className="resource-header-title">Course Resources</h5>
      <div className="list-group list-group-flush resource-list-group">
        {resources.map((resource, index) => (
          <div
            key={index}
            className="list-group-item d-flex align-items-center justify-content-between resource-item"
          >
            <div className="d-flex align-items-center gap-3">
              <div className="resource-icon d-flex align-items-center justify-content-center">
                <i className="bi bi-download"></i>
              </div>
              <div className="resource-name">
                {resource.name}
                {resource.dataURL && (
                  <span className="badge bg-success ms-2">Uploaded</span>
                )}
              </div>
            </div>
            <a
              href="#"
              className="resource-download-link"
              onClick={(e) => {
                e.preventDefault();
                downloadFile(resource);
              }}
            >
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResourceForm({ addResource, toggleForm }) {
  const [file, setFile] = useState(null);
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
    } else {
      setFile(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a PDF file to upload.");
      return;
    }
    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataURL = event.target.result;
      const newResource = {
        name: file.name,
        type: file.type,
        dataURL: dataURL,
      };
      addResource(newResource);
      toggleForm(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="resources-panel rounded-3 overflow-hidden mb-4">
      <div className="resource-header-title d-flex justify-content-between align-items-center px-4 pt-4">
        <h5 className="mb-0">Add New PDF Resource</h5>
        <button
          className="btn btn-sm btn-light"
          onClick={() => toggleForm(false)}
        >
          <i className="bi bi-x"></i> Close
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 pt-2">
        <div className="mb-3">
          <label className="form-label small muted">
            Upload PDF File (Max 10MB for storage test)
          </label>
          <input
            type="file"
            className="form-control"
            accept=".pdf"
            onChange={handleFileChange}
            required
          />
          {file && (
            <div className="small mt-2 text-primary">
              Selected: **{file.name}**
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-sm btn-primary">
          Save Resource
        </button>
      </form>
    </div>
  );
}

// ===================================

// ===================================
// QUIZ COMPONENTS (Modified/New)
// ===================================

// Hardcoded Questions (5 Questions)
const defaultQuizQuestions = [
  {
    id: 1,
    question:
      "Which of the following is used to manage state in functional components in React?",
    options: ["useReducer", "useEffect", "useState", "useContext"],
    answerIndex: 2, // useState
  },
  {
    id: 2,
    question: "Which HTML element is used to define the internal style sheet?",
    options: ["<script>", "<css>", "<style>", "<link>"],
    answerIndex: 2, // <style>
  },
  {
    id: 3,
    question: "Which CSS property is used to change the background color?",
    options: ["color", "bgcolor", "background-color", "bg-color"],
    answerIndex: 2, // background-color
  },
  {
    id: 4,
    question: "What is the primary function of Node.js?",
    options: [
      "Frontend framework",
      "Server-side runtime environment",
      "Database management system",
      "Client-side scripting",
    ],
    answerIndex: 1, // Server-side runtime environment
  },
  {
    id: 5,
    question: "What does API stand for?",
    options: [
      "Application Programming Interface",
      "Advanced Protocol Integration",
      "Automated Process Interaction",
      "Application Private Interface",
    ],
    answerIndex: 0, // Application Programming Interface
  },
];

// NEW Component: QuizResultModal (For pop-up display)
function QuizResultModal({ show, score, quizData, onClose }) {
  const totalQuestionsFixed = defaultQuizQuestions.length; // 5 questions
  const percentage = (score / totalQuestionsFixed) * 100;
  // Get passing score from the quiz data, default to 70 if not available
  const passingScore = quizData.passingScore || 70;
  const isPassed = percentage >= passingScore;

  if (!show) {
    return null;
  }

  // --- PASS Content ---
  const passContent = (
    <div className="text-center text-success">
      <h3
        className="mb-3"
        style={{ fontSize: "30px", fontWeight: "700", color: "#0bb7ab" }}
      >
        PASS:
      </h3>
      <h4 className="mb-3" style={{ fontWeight: "600" }}>
        Congratulations! 🎉
      </h4>
      <p style={{ fontSize: "16px" }}>You’ve successfully passed this quiz!</p>
      {/* Displaying actual score as per the request, formatted to match '85%' style */}
      <div
        className="fw-bold mb-4"
        style={{ fontSize: "24px", color: "#0bb7ab" }}
      >
        You scored {Math.round(percentage)}%.
      </div>
      <button
        className="btn btn-primary"
        onClick={() => onClose(true)} // Close and end quiz view
      >
        <i className="bi bi-check-circle me-2"></i> Close
      </button>
    </div>
  );

  // --- FAIL Content ---
  const failContent = (
    <div className="text-center text-danger">
      <h3
        className="mb-3"
        style={{ fontSize: "30px", fontWeight: "700", color: "#dc3545" }}
      >
        FAIL:
      </h3>
      <h4 className="mb-3" style={{ fontWeight: "600" }}>
        Missed It by a Bit 🎯
      </h4>
      <p style={{ fontSize: "16px" }}>
        Keep the focus — you’re already improving!
      </p>
      {/* Displaying actual score for context */}
      <div
        className="fw-bold mb-4"
        style={{ fontSize: "24px", color: "#dc3545" }}
      >
        You scored {Math.round(percentage)}%.
      </div>
      <button
        className="btn btn-outline-danger"
        onClick={() => onClose(false)} // Close and reset quiz for retake
      >
        <i className="bi bi-arrow-clockwise me-2"></i> Retake Quiz
      </button>
    </div>
  );

  return (
    // 1. Modal Overlay (Backdrop)
    <div
      onClick={() => onClose(true)} // Close when clicking backdrop
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        // MODIFICATION: Set background to transparent to remove black overlay
        backgroundColor: "rgba(0, 0, 0, 0.0)",
        // Centering is already correct
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1050,
      }}
    >
      {/* 2. Modal Content Box */}
      <div
        className="rounded-3 p-5"
        style={{
          width: "90%",
          maxWidth: "500px",
          backgroundColor: "#fff",
          boxShadow: "0 5px 15px rgba(0, 0, 0, 0.5)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Close Button on Modal */}
        <button
          type="button"
          className="btn-close"
          style={{ position: "absolute", top: "15px", right: "15px" }}
          onClick={() => onClose(true)}
        ></button>
        <h5 className="modal-title mb-4 text-center border-bottom pb-3">
          Quiz Result for: {quizData.name}
        </h5>
        {isPassed ? passContent : failContent}
      </div>
    </div>
  );
}

// NEW QuizInterface Component
function QuizInterface({ quizData, endQuiz }) {
  const [selections, setSelections] = useState({}); // Stores {questionId: selectedOptionIndex}
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [, setPercentageScore] = useState(0); // New state for percentage
  const [showResultModal, setShowResultModal] = useState(false); // New state for modal

  const handleOptionChange = (questionId, optionIndex) => {
    if (submitted) return;
    setSelections((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleModalClose = (endQuizView) => {
    setShowResultModal(false); // Hide the modal

    // If we pass 'true' (from PASS button or modal X/backdrop click), return to quiz list.
    if (endQuizView) {
      endQuiz(score);
    } else {
      // If we pass 'false' (from Retake Quiz button), reset quiz state for retake.
      setSelections({});
      setSubmitted(false);
      setScore(0);
      setPercentageScore(0);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submitted) return;

    let correctAnswers = 0;
    const totalQuestions = defaultQuizQuestions.length;

    defaultQuizQuestions.forEach((q) => {
      const selectedIndex = selections[q.id];
      if (selectedIndex === q.answerIndex) {
        correctAnswers++;
      }
    });

    const calculatedPercentage = (correctAnswers / totalQuestions) * 100;

    setScore(correctAnswers);
    setPercentageScore(calculatedPercentage);
    setSubmitted(true);
    // Show the new modal!
    setShowResultModal(true);
    // Do NOT call endQuiz here. Call it when the modal is closed via the 'Close' button.
  };

  const getResultColor = (questionId, optionIndex) => {
    if (!submitted) return "";
    const question = defaultQuizQuestions.find((q) => q.id === questionId);
    const selectedIndex = selections[questionId];

    // If submitted, check for correctness/selection
    if (optionIndex === question.answerIndex) {
      return "text-success fw-bold"; // Correct answer (green)
    }
    if (optionIndex === selectedIndex && optionIndex !== question.answerIndex) {
      return "text-danger fw-bold"; // Incorrect selection (red)
    }

    return "";
  };

  return (
    <div className="p-4 bg-white rounded-3 shadow-sm">
      <h4 className="mb-4">{quizData.name}</h4>
      <p className="small muted">
        Answer all {defaultQuizQuestions.length} questions. You need a score of{" "}
        {quizData.passingScore}% to pass.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="d-flex flex-column gap-4">
          {defaultQuizQuestions.map((q, qIndex) => (
            <div key={q.id} className="p-3 border rounded">
              <p className="fw-bold mb-3">
                {" "}
                {qIndex + 1}. {q.question}{" "}
              </p>
              {/* Options */}
              <div className="d-flex flex-column gap-2">
                {q.options.map((option, oIndex) => (
                  <div key={oIndex} className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name={`question-${q.id}`}
                      id={`option-${q.id}-${oIndex}`}
                      checked={selections[q.id] === oIndex}
                      onChange={() => handleOptionChange(q.id, oIndex)}
                      disabled={submitted}
                    />
                    <label
                      className={`form-check-label ${getResultColor(
                        q.id,
                        oIndex
                      )}`}
                      htmlFor={`option-${q.id}-${oIndex}`}
                      style={{ cursor: submitted ? "default" : "pointer" }}
                    >
                      {option}
                      {submitted && oIndex === q.answerIndex && (
                        <i className="bi bi-check-circle-fill text-success ms-2"></i>
                      )}
                      {submitted &&
                        oIndex === selections[q.id] &&
                        oIndex !== q.answerIndex && (
                          <i className="bi bi-x-circle-fill text-danger ms-2"></i>
                        )}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="btn btn-primary mt-4"
          disabled={submitted}
        >
          Submit Quiz
        </button>
      </form>

      {/* NEW: Result Modal is rendered here */}
      <QuizResultModal
        show={showResultModal}
        score={score}
        quizData={quizData}
        onClose={handleModalClose}
      />
    </div>
  );
}

// Quiz Form (Unchanged)
function QuizForm({ addQuiz, toggleForm }) {
  const [quizName, setQuizName] = useState("");
  const [questions, setQuestions] = useState("");
  const [passingScore, setPassingScore] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const newQuiz = {
      name: quizName,
      questions: parseInt(questions) || 0,
      passingScore: parseInt(passingScore) || 0,
      status: "Start Quiz",
      iconClass: "bi-patch-question",
      iconBgClass: "lesson-icon",
      // Add a unique ID for persistent results later (simplified for now)
      id: Date.now(),
    };
    addQuiz(newQuiz);
    toggleForm(false);
  };

  return (
    <div className="curriculum-panel rounded-3 overflow-hidden mb-3">
      <div className="curriculum-header d-flex justify-content-between align-items-center p-3">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-patch-question header-icon"></i>
          <strong>Add New Quiz</strong>
        </div>
        <button
          className="btn btn-sm btn-light"
          onClick={() => toggleForm(false)}
        >
          <i className="bi bi-x"></i> Close
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-3 bg-white">
        <div className="row mb-3">
          <div className="col-md-6 mb-3 mb-md-0">
            <label className="form-label small muted">Quiz Name</label>
            <input
              type="text"
              className="form-control"
              value={quizName}
              onChange={(e) => setQuizName(e.target.value)}
              placeholder="e.g. Module 2 Assessment"
              required
            />
          </div>

          <div className="col-md-3 mb-3 mb-md-0">
            <label className="form-label small muted">
              Total Questions (Not Implemented)
            </label>
            <input
              type="number"
              className="form-control"
              value={questions}
              onChange={(e) => setQuestions(e.target.value)}
              placeholder="e.g. 10"
              required
            />
          </div>

          <div className="col-md-3">
            <label className="form-label small muted">Passing Score (%)</label>
            <input
              type="number"
              className="form-control"
              value={passingScore}
              onChange={(e) => setPassingScore(e.target.value)}
              placeholder="e.g. 70"
              required
            />
          </div>
        </div>

        <button type="submit" className="btn btn-sm btn-primary mt-3">
          Save New Quiz
        </button>
      </form>
    </div>
  );
}

// Quiz List (Unchanged)
function QuizList({ quizzes, startQuiz }) {
  return (
    <div className="curriculum-panel rounded-3 overflow-hidden mb-3">
      <div className="curriculum-header d-flex justify-content-between align-items-center p-3">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-patch-question header-icon"></i>
          <strong>Available Quizzes</strong>
        </div>
      </div>
      <div className="list-group list-group-flush">
        {quizzes.map((quiz, index) => (
          <div
            key={index}
            className="list-group-item d-flex align-items-start justify-content-between"
          >
            <div className="d-flex align-items-start gap-3">
              <div
                className={`${quiz.iconBgClass} rounded-circle d-flex align-items-center justify-content-center`}
                style={{
                  width: "44px",
                  height: "44px",
                  fontSize: "18px",
                  background: "#f3fcfb",
                  color: "#0bb7ab",
                  marginRight: "12px",
                }}
              >
                <i className={`bi ${quiz.iconClass}`}></i>
              </div>
              <div>
                <div className="lesson-title">{quiz.name}</div>
                <div className="lesson-duration">
                  {quiz.questions} Questions | Pass: {quiz.passingScore}%
                </div>
              </div>
            </div>
            <a
              href="#"
              className="lesson-action"
              onClick={(e) => {
                e.preventDefault();
                startQuiz(quiz);
              }}
            >
              {quiz.status}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===================================
// ===================================
// MAIN COMPONENT
// ===================================

export default function Courses() {
  // --- UI STATES ---
  const navigate = useNavigate();
  const [tab, setTab] = useState("curriculum");
  const [showCurriculumForm, setShowCurriculumForm] = useState(false);
  const [showInstructorForm, setShowInstructorForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [showQuizForm, setShowQuizForm] = useState(false);
  // ✅ NEW: State for active quiz interface
  const [activeQuiz, setActiveQuiz] = useState(null);
  // State for active videos in different sections
  const [heroVideo, setHeroVideo] = useState(null);
  const [heroTitle, setHeroTitle] = useState("");
  const [gettingStartedVideo, setGettingStartedVideo] = useState(null);
  const [gettingStartedTitle, setGettingStartedTitle] = useState("");
  const [coreConceptsVideo, setCoreConceptsVideo] = useState(null);
  const [coreConceptsTitle, setCoreConceptsTitle] = useState("");

  // --- STATE WITH LOCAL STORAGE PERSISTENCE ---
  // Curriculum: Only persisting the NEW modules
  const [newModules, setNewModules] = useLocalStorage("newModules", []);
  const [gettingStarted] = useState(initialGettingStarted);
  const [coreConcepts] = useState(initialCoreConcepts);
  const [practicalApplications] = useState(initialPracticalApplications);

  // Instructor: Persisting the added instructors
  const [instructor] = useState(initialInstructor);
  const [otherInstructors, setOtherInstructors] = useLocalStorage(
    "otherInstructors",
    []
  );

  // Reviews: Persisting the reviews (default reviews + new ones)
  const [reviews, setReviews] = useLocalStorage("reviews", initialReviews);

  // Resources: Persisting the resources (default resources + new ones)
  const [resources, setResources] = useLocalStorage(
    "resources",
    initialResources
  );

  // Quizzes: Persisting the quizzes (default quizzes + new ones)
  const [quizzes, setQuizzes] = useLocalStorage("quizzes", initialQuizzes);

  // --- HANDLERS ---
  const addCurriculumModule = (newModule) => {
    setNewModules((prevModules) => [...prevModules, newModule]);
  };

  const addInstructor = (newInstructor) => {
    setOtherInstructors((prevInstructors) => [
      ...prevInstructors,
      newInstructor,
    ]);
  };

  const addReview = (newReview) => {
    setReviews((prevReviews) => [newReview, ...prevReviews]); // Newest first
  };

  const addResource = (newResource) => {
    setResources((prevResources) => [...prevResources, newResource]);
  };

  const addQuiz = (newQuiz) => {
    setQuizzes((prevQuizzes) => [...prevQuizzes, newQuiz]);
  };

  // Quiz Handlers
  const startQuizHandler = (quiz) => {
    setActiveQuiz(quiz);
  };

  const endQuizHandler = (finalScore) => {
    // This function can be used to update the quiz status/score in the main list
    console.log(`Quiz ended with score: ${finalScore}`);
    setActiveQuiz(null); // Return to the quiz list view
  };

  const handleDownloadCertificate = () => {
    const cert = { title: "Full Stack Development", date: "Oct 2024" };
    const profileName = "Deepak Kumar"; // Hardcoded as in Profile.jsx
    const doc = new jsPDF("landscape", "pt", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    // Border
    doc.setDrawColor(212, 175, 55); // Gold
    doc.setLineWidth(5);
    doc.rect(20, 20, pageWidth - 40, 550);

    // Title
    doc.setFont("times", "bold");
    doc.setFontSize(32);
    doc.setTextColor(27, 51, 127);
    doc.text("Certificate of Completion", pageWidth / 2, 100, {
      align: "center",
    });

    // Subtitle
    doc.setFontSize(18);
    doc.setFont("times", "italic");
    doc.setTextColor(0, 0, 0);
    doc.text("This certificate is proudly presented to", pageWidth / 2, 150, {
      align: "center",
    });

    // Recipient Name
    doc.setFont("times", "bold");
    doc.setFontSize(28);
    doc.setTextColor(27, 51, 127);
    doc.text(profileName, pageWidth / 2, 200, { align: "center" });

    // Course Info
    doc.setFont("helvetica", "normal");
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text(`for successfully completing the`, pageWidth / 2, 240, {
      align: "center",
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(60, 60, 60);
    doc.text(`${cert.title}`, pageWidth / 2, 270, { align: "center" });

    // Date
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text(`Date: ${cert.date}`, pageWidth / 2, 320, { align: "center" });

    // Footer
    doc.setFontSize(16);
    doc.setTextColor(100, 100, 100);
    doc.text("KavyaLearn Academy", pageWidth / 2, 370, { align: "center" });

    // Download PDF
    doc.save(`${cert.title}_Certificate.pdf`);
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getCourses();
        if (res && res.courses) {
          // Replace the student stat with live course count for visibility
          // This is minimal, non-intrusive integration to show backend data
          // If you want more, we can wire the whole curriculum to course data
          // Update local 'students enrolled' stat (first stat card) by hijacking DOM via state is intrusive,
          // instead set a new local state for remoteCourses
          // For now, set quizzes list from backend if returned (as available)
          // If there are courses, also pre-populate quizzes list placeholder
          // We'll update quizzes local storage only when backend provides quizzes separately.
          // (This keeps original UX when backend unauthenticated.)
        }
      } catch (err) {
        console.warn('Failed to fetch courses for UI integration', err.message || err);
      }
    })();
  }, []);



  // Function to render a curriculum list
  const renderCurriculumList = (list, onVideoClick) => (
    <div className="list-group list-group-flush">
      {list.map((lesson, index) => (
        <div
          key={index}
          className="list-group-item d-flex align-items-start justify-content-between"
        >
          <div className="d-flex align-items-start gap-3">
            <div
              className={`${lesson.iconBgClass} rounded-circle d-flex align-items-center justify-content-center`}
            >
              <i className={`bi ${lesson.iconClass}`}></i>
            </div>
            <div>
              <div className="lesson-title">{lesson.title}</div>
              <div className="lesson-duration">{lesson.duration}</div>
            </div>
          </div>
          <button
            type="button"
            className={lesson.actionClass}
            onClick={(e) => {
              e.preventDefault();
              if (lesson.status === "Review") {
                setTab("reviews");
              } else if (lesson.videoLink) {
                onVideoClick(lesson);
              }
            }}
          >
            {lesson.status}
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <AppLayout showGreeting={false}>
      <div className="page-wrap container pt-3">
        {/* HERO CARD */}
        <div className="course-hero d-flex flex-column flex-lg-row justify-content-between">
          <div className="hero-left">
            <div className="hero-tag mb-3">Frontend Development</div>
            <h2 className="hero-title mb-3">
              {" "}
              The Complete Full Stack Web Developer Course{" "}
            </h2>
            <p className="hero-desc mb-4">
              {" "}
              A comprehensive course to build modern, professional web
              applications from scratch. Master both frontend and backend
              technologies with hands-on projects.{" "}
            </p>
            <div className="d-flex gap-2 flex-wrap">
              <button
                className="btn btn-learn d-flex align-items-center gap-2"
                onClick={() => {
                  setHeroVideo("https://www.youtube.com/embed/tMHrpmJH5I8");
                  setHeroTitle("Chemistry Fundamentals");
                  setTab("curriculum");
                }}
              >
                <i className="bi bi-play-fill"></i> Continue Learning
              </button>
              <button
                className="btn btn-download d-flex align-items-center gap-2"
                onClick={handleDownloadCertificate}
              >
                <i className="bi bi-download "></i> Download Certificate
              </button>
            </div>
            {heroVideo && (
              <div
                className="card"
                style={{ borderRadius: "15px", marginTop: "20px" }}
              >
                <div
                  className="card-header bg-white d-flex justify-content-between align-items-center"
                  style={{ borderColor: "white" }}
                >
                  <h3 className="fw-normal mb-0">
                    Now Playing: {heroTitle}
                  </h3>
                  <button
                    className="view-btn"
                    style={{ fontSize: "14px" }}
                    onClick={() => {
                      setHeroVideo(null);
                      setHeroTitle("");
                    }}
                  >
                    Close
                  </button>
                </div>
                <div style={{ marginTop: "15px" }}>
                  <iframe
                    width="100%"
                    height="300"
                    src={heroVideo}
                    style={{ borderRadius: "10px" }}
                    allow="autoplay; encrypted-media"
                    title={heroTitle}
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
          </div>
          <div className="hero-right mt-4 mt-lg-0">
            <div className="progress-box p-3 rounded-3">
              <div className="small muted">Course Progress</div>
              <div className="d-flex align-items-center mt-2 mb-2">
                <div className="percent">75%</div>
                <div className="ms-2 ">Complete</div>
              </div>
              <div className="progress custom" style={{ height: 20 }}>
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: "75%" }}
                />
              </div>
              <div className="muted small mt-2">18 of 24 lessons completed</div>
            </div>
          </div>
          
          
        </div>
        {/* STATS ROW */}
        <div className="stats-wrap container-fluid">
          <div className="row">
            {/* Students */}
            <div className="col-12 col-sm-6 col-lg-3 d-flex">
              <div className="stat-card flex-fill d-flex gap-3 p-3 rounded-3 align-items-center">
                <div
                  className="w-18 h-20 rounded-2 d-flex align-items-center justify-content-center"
                  style={{
                    background: "linear-gradient(135deg, #f5f5f5, #e0e0e0)",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="27"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2B6CB0"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-users"
                    aria-hidden="true"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <div>
                  <div className="stat-title">Students Enrolled</div>
                  <div className="stat-value">12,456</div>
                </div>
              </div>
            </div>
            {/* Rating */}
            <div className="col-12 col-sm-6 col-lg-3 d-flex">
              <div className="stat-card flex-fill d-flex gap-3 p-3 rounded-3 align-items-center">
                <div
                  className="w-18 h-20 rounded-2 d-flex align-items-center justify-content-center"
                  style={{
                    background: "linear-gradient(135deg, #f5f5f5, #e0e0e0)",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="27"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2B6CB0"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-star"
                    aria-hidden="true"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
                <div>
                  <div className="stat-title">Course Rating</div>
                  <div className="stat-value">4.8/5.0</div>
                </div>
              </div>
            </div>
            {/* Duration */}
            <div className="col-12 col-sm-6 col-lg-3 d-flex">
              <div className="stat-card flex-fill d-flex gap-3 p-3 rounded-3 align-items-center">
                <div
                  className="w-18 h-20 rounded-2 d-flex align-items-center justify-content-center"
                  style={{
                    background: "linear-gradient(135deg, #f5f5f5, #e0e0e0)",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="27"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2B6CB0"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-clock"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div>
                  <div className="stat-title">Total Duration</div>
                  <div className="stat-value">8 hours</div>
                </div>
              </div>
            </div>
            {/* Lessons */}
            <div className="col-12 col-sm-6 col-lg-3 d-flex">
              <div className="stat-card flex-fill d-flex gap-3 p-3 rounded-3 align-items-center">
                <div
                  className="w-14 h-14 rounded-2 d-flex align-items-center justify-content-center"
                  style={{
                    background: "linear-gradient(135deg, #f5f5f5, #e0e0e0)",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="27"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2B6CB0"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-book-open"
                    aria-hidden="true"
                  >
                    <path d="M2 17a5 5 0 0 1 10 0v2a5 5 0 0 1-10 0v-2zm0 0a5 5 0 0 0 10 0"></path>
                    <path d="M12 17a5 5 0 0 1 10 0v2a5 5 0 0 1-10 0v-2zm0 0a5 5 0 0 0 10 0"></path>
                    <path d="M18 10h-6"></path>
                    <path d="M18 7h-6"></path>
                  </svg>
                </div>
                <div>
                  <div className="stat-title"> Lessons</div>
                  <div className="stat-value">24 </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* TABS */}
        <div className="tabs-row my-3 d-flex gap-2 border-bottom pb-2">
          <button
            className={`tab-pill ${tab === "curriculum" ? "active" : ""}`}
            onClick={() => setTab("curriculum")}
          >
            Curriculum
          </button>
          <button
            className={`tab-pill ${tab === "instructor" ? "active" : ""}`}
            onClick={() => setTab("instructor")}
          >
            Instructor
          </button>
          <button
            className={`tab-pill ${tab === "reviews" ? "active" : ""}`}
            onClick={() => setTab("reviews")}
          >
            Reviews
          </button>
          <button
            className={`tab-pill ${tab === "quizzes" ? "active" : ""}`}
            onClick={() => setTab("quizzes")}
          >
            Quizzes
          </button>
          <button
            className={`tab-pill ${tab === "resources" ? "active" : ""}`}
            onClick={() => setTab("resources")}
          >
            Resources
          </button>
        </div>

        {/* TAB CONTENT */}
        <div className="tab-content-wrap">
          {/* Curriculum tab */}
          {tab === "curriculum" && (
            <div className="container-fluid p-0 mt-4">
              <button
                className="btn btn-sm btn-primary mb-3 d-flex align-items-center gap-1"
                onClick={() => setShowCurriculumForm(!showCurriculumForm)}
              >
                <i className="bi bi-folder-plus"></i> Add New Module
              </button>

              {showCurriculumForm && (
                <CurriculumForm
                  addCurriculumModule={addCurriculumModule}
                  toggleForm={setShowCurriculumForm}
                />
              )}

              {/* Module Panels */}
              <div className="module-panel">
                {/* Module 1 */}
                <div className="curriculum-panel rounded-3 overflow-hidden mb-3">
                  <div className="curriculum-header d-flex justify-content-between align-items-center p-3">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-folder-plus header-icon"></i>
                      <strong>Getting Started</strong>
                    </div>
                    <div className="muted small">
                      <i className="bi bi-clock me-1"></i> 45 min
                    </div>
                  </div>
                  {renderCurriculumList(gettingStarted, (lesson) => {
                  setGettingStartedVideo(lesson.videoLink);
                  setGettingStartedTitle(lesson.title);
                  })}
                {/* Video player shown inside Getting Started section */}
                {gettingStartedVideo && (
                  <div
                    className="card"
                    style={{ borderRadius: "15px", marginTop: "20px" }}
                  >
                    <div
                      className="card-header bg-white d-flex justify-content-between align-items-center"
                      style={{ borderColor: "white" }}
                    >
                      <h3 className="fw-normal mb-0">
                        Now Playing: {gettingStartedTitle}
                      </h3>
                      <button
                        className="view-btn"
                        style={{ fontSize: "14px" }}
                        onClick={() => {
                          setGettingStartedVideo(null);
                          setGettingStartedTitle("");
                        }}
                      >
                        Close
                      </button>
                    </div>
                    <div style={{ marginTop: "15px" }}>
                      <iframe
                        width="100%"
                        height="300"
                        src={gettingStartedVideo}
                        style={{ borderRadius: "10px" }}
                        allow="autoplay; encrypted-media"
                        title={gettingStartedTitle}
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                )}
                </div>
                {/* Module 2 */}
                <div className="curriculum-panel rounded-3 overflow-hidden mb-3">
                  <div className="curriculum-header d-flex justify-content-between align-items-center p-3">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-folder-plus header-icon"></i>
                      <strong>Core Concepts</strong>
                    </div>
                    <div className="muted small">
                      <i className="bi bi-clock me-1"></i> 1h 50 min
                    </div>
                  </div>
                  {renderCurriculumList(coreConcepts, (lesson) => {
                  setCoreConceptsVideo(lesson.videoLink);
                  setCoreConceptsTitle(lesson.title);
                })}
                {/* Video player shown inside Core Concepts section */}
                {coreConceptsVideo && (
                  <div
                    className="card"
                    style={{ borderRadius: "15px", marginTop: "20px" }}
                  >
                    <div
                      className="card-header bg-white d-flex justify-content-between align-items-center"
                      style={{ borderColor: "white" }}
                    >
                      <h3 className="fw-normal mb-0">
                        Now Playing: {coreConceptsTitle}
                      </h3>
                      <button
                        className="view-btn"
                        style={{ fontSize: "14px" }}
                        onClick={() => {
                          setCoreConceptsVideo(null);
                          setCoreConceptsTitle("");
                        }}
                      >
                        Close
                      </button>
                    </div>
                    <div style={{ marginTop: "15px" }}>
                      <iframe
                        width="100%"
                        height="300"
                        src={coreConceptsVideo}
                        style={{ borderRadius: "10px" }}
                        allow="autoplay; encrypted-media"
                        title={coreConceptsTitle}
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                )}
                </div>
                {/* Module 3 */}
                <div className="curriculum-panel rounded-3 overflow-hidden mb-3">
                  <div className="curriculum-header d-flex justify-content-between align-items-center p-3">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-folder-plus header-icon"></i>
                      <strong>Practical Applications</strong>
                    </div>
                    <div className="muted small">
                      <i className="bi bi-clock me-1"></i> 2h 35 min
                    </div>
                  </div>
                  {renderCurriculumList(practicalApplications, (lesson) => {
                    setActiveLessonVideo(lesson.videoLink);
                    setActiveLessonTitle(lesson.title);
                  })}
                </div>

                

                {/* New Modules added by user */}
                {newModules.map((module, index) => (
                  <div
                    key={index}
                    className="curriculum-panel rounded-3 overflow-hidden mb-3"
                  >
                    <div className="curriculum-header d-flex justify-content-between align-items-center p-3">
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-folder-plus header-icon"></i>
                        <strong>{module.title}</strong>
                      </div>
                      <div className="muted small">
                        <i className="bi bi-clock me-1"></i>{" "}
                        {module.totalDuration}
                      </div>
                    </div>
                    {renderCurriculumList(module.lessons)}
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* Instructor tab */}
          {tab === "instructor" && (
            <div className="container-fluid p-0 mt-4">
              <button
                className="btn btn-sm btn-primary mb-3 d-flex align-items-center gap-1"
                onClick={() => setShowInstructorForm(!showInstructorForm)}
              >
                <i className="bi bi-person-plus"></i> Add New Instructor
              </button>

              {showInstructorForm && (
                <InstructorForm
                  addInstructor={addInstructor}
                  toggleForm={setShowInstructorForm}
                />
              )}

              {/* Default Instructor Card (Single Card) */}
              <div className="instructor-card p-4 rounded-3 d-flex flex-column flex-md-row gap-4 mb-4">
                <div className="instructor-avatar rounded-circle d-flex align-items-center justify-content-center flex-shrink-0">
                  JS
                </div>
                <div>
                  <h5>{instructor.name}</h5>
                  <p className="mb-3">{instructor.title}</p>
                  <div className="d-flex gap-4 small muted">
                    <div>
                      <i className="bi bi-people me-1"></i>
                      {instructor.stats.students} Students
                    </div>
                    <div>
                      <i className="bi bi-journal-check me-1"></i>
                      {instructor.stats.courses} Courses
                    </div>
                    <div>
                      <i className="bi bi-star me-1"></i>
                      {instructor.stats.rating} Rating
                    </div>
                  </div>
                </div>
              </div>

              {/* Other Instructors (Added by user) */}
              {otherInstructors.map((inst, index) => (
                <div
                  key={index}
                  className="instructor-card p-4 rounded-3 d-flex flex-column flex-md-row gap-4 mb-4"
                >
                  <div className="instructor-avatar rounded-circle d-flex align-items-center justify-content-center flex-shrink-0">
                    {inst.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h5>{inst.name}</h5>
                    <p className="mb-3">{inst.title}</p>
                    <div className="d-flex gap-4 small muted">
                      <div>
                        <i className="bi bi-people me-1"></i>
                        {inst.stats.students} Students
                      </div>
                      <div>
                        <i className="bi bi-journal-check me-1"></i>
                        {inst.stats.courses} Courses
                      </div>
                      <div>
                        <i className="bi bi-star me-1"></i>
                        {inst.stats.rating} Rating
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reviews tab */}
          {tab === "reviews" && (
            <>
              <button
                className="btn btn-sm btn-primary mb-3 d-flex align-items-center gap-1"
                onClick={() => setShowReviewForm(!showReviewForm)}
              >
                <i className="bi bi-chat-dots"></i> Add New Review
              </button>

              {showReviewForm && (
                <ReviewForm
                  addReview={addReview}
                  toggleForm={setShowReviewForm}
                />
              )}

              <div className="reviews-container d-flex flex-wrap gap-3">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="review-card-screenshot p-3 rounded-3"
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      navigate("/course-review", {
                        state: { review },
                      })
                    }
                  >
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div className="review-avatar rounded-circle d-flex align-items-center justify-content-center flex-shrink-0">
                        {review.avatar}
                      </div>
                      <div>
                        {/* <div className="review-name fw-bold">
                        {review.name}
                        {review.id <= 3 && (
                          <span className="badge bg-secondary ms-2">
                            Verified
                          </span>
                        )}
                      </div> */}
                        <div className="text-success">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                    </div>
                    <p className="review-text mb-0">{review.text}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Quizzes tab */}
          {tab === "quizzes" && (
            <div className="container-fluid p-0 mt-4">
              {activeQuiz ? (
                // 1. Show the Quiz Interface when a quiz is active
                <QuizInterface quizData={activeQuiz} endQuiz={endQuizHandler} />
              ) : (
                // 2. Show the Add Quiz button and list of quizzes
                <>
                  <button
                    className="btn btn-sm btn-primary mb-3 d-flex align-items-center gap-1"
                    onClick={() => setShowQuizForm(!showQuizForm)}
                  >
                    <i className="bi bi-patch-question"></i>
                    Add Quiz
                  </button>

                  {showQuizForm && (
                    <QuizForm addQuiz={addQuiz} toggleForm={setShowQuizForm} />
                  )}

                  <QuizList quizzes={quizzes} startQuiz={startQuizHandler} />
                </>
              )}
            </div>
          )}

          {/* Resources tab */}
          {tab === "resources" && (
            <div className="container-fluid p-0 mt-4">
              <button
                className="btn btn-sm btn-primary mb-3 d-flex align-items-center gap-1"
                onClick={() => setShowResourceForm(!showResourceForm)}
              >
                <i className="bi bi-file-earmark-plus"></i>
                Add PDF Resource
              </button>

              {showResourceForm && (
                <ResourceForm
                  addResource={addResource}
                  toggleForm={setShowResourceForm}
                />
              )}

              <ResourceList resources={resources} />
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
