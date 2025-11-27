import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import AppLayout from "../components/AppLayout";
import SmallChatBox from "../components/SmallChatBox";
import 'bootstrap/dist/css/bootstrap.min.css';

import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  Edit3,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import "../assets/Profile.css";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isSmallChatOpen, setIsSmallChatOpen] = useState(false);

  const [profile, setProfile] = useState({
    initials: "DK",
    name: "Deepak Kumar",
    badge: "Premium Member",
    bio: "Passionate learner exploring web development and computer science. On a mission to master full-stack development!",
    email: "deepak@example.com",
    phone: "+91 98765 43210",
    location: "Mumbai, India",
    joined: "Joined March 2024",
    stats: {
      courses: 12,
      hours: 124,
      achievements: 8,
      avg: "95%",
    },
  });

  useEffect(() => {
    (async () => {
      try {
        const api = await import("../api");
        const res = await api.getProfile();
        if (res && res._id) {
          setProfile((prev) => ({
            ...prev,
            name: res.fullName || prev.name,
            email: res.email || prev.email,
            initials: (res.fullName || prev.name).split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase(),
            joined: res.createdAt ? `Joined ${new Date(res.createdAt).toLocaleString()}` : prev.joined,
            // stats mapping if available
            stats: {
              courses: prev.stats.courses,
              hours: prev.stats.hours,
              achievements: prev.stats.achievements,
              avg: prev.stats.avg,
            }
          }));
        }
      } catch (err) {
        // ignore if unauthenticated
      }
    })();
  }, []);

  const skills = [
    { name: "JavaScript", percent: 90, color: "#1b65d4" },
    { name: "Python", percent: 85, color: "#2db88e" },
    { name: "React", percent: 80, color: "#4acb9a" },
    { name: "Data Structures", percent: 75, color: "#1b65d4" },
    { name: "Web Development", percent: 88, color: "#27c5aa" },
  ];

  const activities = [
    {
      text: 'Completed "Advanced JavaScript"',
      time: "2 hours ago",
      color: "#28a745",
    },
    {
      text: 'Earned "Fast Learner" badge',
      time: "1 day ago",
      color: "#f1c40f",
    },
    {
      text: 'Joined "Web Development" course',
      time: "2 days ago",
      color: "#1b65d4",
    },
    {
      text: "Scored 98% in Data Structures quiz",
      time: "3 days ago",
      color: "#27c5aa",
    },
  ];

  const certificates = [
    { title: "Full Stack Development", date: "Oct 2024" },
    { title: "Advanced JavaScript", date: "Sep 2024" },
    { title: "Data Structures & Algorithms", date: "Aug 2024" },
  ];

  const prefs = {
    goal: "2 hours",
    level: "Intermediate",
    style: "Visual",
    notifications: "Enabled",
  };

  const handleDownloadCertificate = (cert) => {
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
    doc.text(profile.name, pageWidth / 2, 200, { align: "center" });

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

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsEditing(false);
    alert("✅ Profile updated successfully!");
  };

  // prevent background scrolling when modal is open
  useEffect(() => {
    document.body.classList.toggle("modal-open", isEditing || isContactModalOpen);
  }, [isEditing, isContactModalOpen]);

  return (
    <AppLayout showGreeting={false}>
      <div className="profile-page">
        {/* === Profile Card === */}
        <div className="profile-wrapper">
          <div className="profile-top-card">
            <div className="avatar">{profile.initials}</div>

            <div className="profile-main">
              <div className="profile-main-row">
                <h2 className="profile-name">{profile.name}</h2>
                <span className="badge">{profile.badge}</span>
              </div>

              <p className="profile-bio">{profile.bio}</p>
              <div className="profile-contacts">
                <div className="left">
                  <div className="contact-item">
                    <Mail size={16} /> {profile.email}
                  </div>
                  <div className="contact-item">
                    <MapPin size={16} /> {profile.location}
                  </div>
                </div>
                <div className="right">
                  <div className="contact-item">
                    <Phone size={16} /> {profile.phone}
                  </div>
                  <div className="contact-item">
                    <Calendar size={16} /> {profile.joined}
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-action">
              <button className="btn-edit" onClick={() => setIsEditing(true)}>
                <Edit3 size={16} /> Edit Profile
              </button>
            </div>
          </div>

          <div className="profile-stat-grid">
            <ProfileStatCard
              icon={<BookOpen color="#1b337f" size={25} />}
              value={profile.stats.courses}
              label="Courses Enrolled"
              iconColor="#eaf1ff"
              valueColor="#1b337f"
            />
            <ProfileStatCard
              icon={<Clock color="#00796b" size={25} />}
              value={profile.stats.hours}
              label="Hours Learned"
              iconColor="#eaf1ff"
              valueColor="#00796b"
            />
            <ProfileStatCard
              icon={<Award color="#60b684ff" size={25} />}
              value={profile.stats.achievements}
              label="Achievements"
              iconColor="#eaf1ff"
              valueColor="#60b684ff"
            />
            <ProfileStatCard
              icon={<TrendingUp color="#388e3c" size={25} />}
              value={profile.stats.avg}
              label="Avg. Score"
              iconColor="#eaf1ff"
              valueColor="#388e3c"
            />
          </div>
        </div>

        {/* === Skills and Activity === */}
        <div className="skills-activity-section">
          <div className="skills-card">
            <h3>Skills & Progress</h3>
            {skills.map((skill, i) => (
              <div className="skill-item" key={i}>
                <div className="skill-header">
                  <span>{skill.name}</span>
                  <span className="percent">{skill.percent}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${skill.percent}%`,
                      background: skill.color,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="activity-card">
            <h3>Recent Activity</h3>
            <ul>
              {activities.map((a, i) => (
                <li key={i}>
                  <span
                    className="activity-dot"
                    style={{ background: a.color }}
                  ></span>
                  <div>
                    <p className="activity-text">{a.text}</p>
                    <p className="activity-time">{a.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* === Bottom Section === */}
        <div className="bottom-sections">
          <div className="left-column">
            <div className="certificates-section">
              <div className="certificates-header">
                <h3>Certificates</h3>
                <button className="view-all-btn">View All</button>
              </div>
              <div className="certificates-grid">
                {certificates.map((cert, i) => (
                  <div className="certificate-card" key={i}>
                    <div className="cert-info">
                      <div className="cert-icon">
                        <Award size={18} />
                      </div>
                      <div>
                        <h4>{cert.title}</h4>
                        <p>{cert.date}</p>
                      </div>
                    </div>
                    <button
                      className="download-btn"
                      onClick={() => handleDownloadCertificate(cert)}
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="right-columnn">
            <div className="preferences-card">
              <h3>Learning Preferences</h3>
              <div className="pref-row">
                <span>Daily Goal</span>
                <span>{prefs.goal}</span>
              </div>
              <div className="pref-row">
                <span>Difficulty Level</span>
                <span>{prefs.level}</span>
              </div>
              <div className="pref-row">
                <span>Learning Style</span>
                <span>{prefs.style}</span>
              </div>
              <div className="pref-row">
                <span>Notifications</span>
                <span>{prefs.notifications}</span>
              </div>
            </div>

            <div className="streak-card">
              <h3>Achievement Streak</h3>
              <div className="streak-icon">
                <Award size={36} color="white" />
              </div>
              <h4>45 Days</h4>
              <p>Keep up the great work!</p>
            </div>

            <div className="support-card">
              <h3>Need Help?</h3>
              <p>
                Contact our support team or chat with{" "}
                <strong>Kavya AI Tutor</strong> for assistance.
              </p>
              <div className="support-buttons">
                <button className="support-btn" onClick={() => setIsContactModalOpen(true)}>Contact Support</button>
                <button className="ai-btn" onClick={() => setIsSmallChatOpen(true)}>Chat with AI Tutor</button>
                {isSmallChatOpen && (
                  <div style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 4000 }}>
                    <SmallChatBox onClose={() => setIsSmallChatOpen(false)} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* === 🧩 Modal for Editing Profile === */}
        {isEditing && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Edit Profile</h2>
              <form className="edit-form" onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  placeholder="Name"
                />
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  placeholder="Email"
                />
                <input
                  type="text"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  placeholder="Phone"
                />
                <input
                  type="text"
                  name="location"
                  value={profile.location}
                  onChange={handleChange}
                  placeholder="Location"
                />
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  placeholder="Bio"
                  rows={3}
                />
                <div className="form-buttons">
                  <button type="submit" className="btn-save">
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* === 🧩 Modal for Contact Support === */}
        {isContactModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Contact Support</h2>
              <p>Call our support team for assistance:</p>
              <div className="contact-phone-section">
                <Phone size={24} />
                <a href="tel:+918888999910" className="phone-link">+91 8888999910</a>
              </div>
              <div className="form-buttons">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsContactModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

/* Small sub-component for Stats */
function ProfileStatCard({ icon, value, label, iconColor, valueColor }) {
  return (
    <div className="profile-stat-card">
      <div className="stat-left">
        <div className="icon" style={{ backgroundColor: iconColor }}>
          {icon}
        </div>
        <p className="stat-label">{label}</p>
      </div>
      <h4 className="stat-value" style={{ color: valueColor }}>
        {value}
      </h4>
    </div>
  );
}
