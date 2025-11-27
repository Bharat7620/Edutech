import {
  Trophy,
  Crown,
  TrendingUp,
  TrendingDown,
  Award,
  Star,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/leaderboard.css";
import AppLayout from "../components/AppLayout";

// --- Static Data (unchanged) ---
const topPerformers = [
  { rank: 2, name: "Shweta", points: 2845, initials: "SS", color: "#3b6ea5" },
  { rank: 1, name: "Deepak", points: 2845, initials: "DK", color: "#1e3a5f" },
  { rank: 3, name: "Rahul", points: 2820, initials: "RV", color: "#4ca89a" },
];

const fullRankings = [
  {
    rank: 1,
    name: "Deepak Kumar",
    initials: "DK",
    points: 2845,
    courses: 12,
    avg: 95,
    streak: 45,
    trend: "up",
  },
  {
    rank: 2,
    name: "Shweta Sharma",
    initials: "SS",
    points: 2845,
    courses: 11,
    avg: 94,
    streak: 42,
    trend: "up",
  },
  {
    rank: 3,
    name: "Rahul Verma",
    initials: "RV",
    points: 2820,
    courses: 10,
    avg: 93,
    streak: 38,
    trend: "down",
  },
  {
    rank: 4,
    name: "Priya Patel",
    initials: "PP",
    points: 2780,
    courses: 11,
    avg: 92,
    streak: 35,
    trend: "up",
  },
  {
    rank: 5,
    name: "Amit Singh",
    initials: "AS",
    points: 2750,
    courses: 9,
    avg: 91,
    streak: 32,
    trend: "up",
  },
  {
    rank: 6,
    name: "Neha Gupta",
    initials: "NG",
    points: 2720,
    courses: 10,
    avg: 90,
    streak: 30,
    trend: "up",
  },
  {
    rank: 7,
    name: "Vikram Rao",
    initials: "VR",
    points: 2690,
    courses: 8,
    avg: 89,
    streak: 28,
    trend: "up",
  },
  {
    rank: 8,
    name: "Ananya Reddy",
    initials: "AR",
    points: 2650,
    courses: 9,
    avg: 88,
    streak: 25,
    trend: "down",
  },
];

const achievements = [
  { icon: Crown, label: "Top Performer", color: "#fbbf24" },
  { icon: TrendingUp, label: "Fast Learner", color: "#60a5fa" },
  { icon: Award, label: "Consistent", color: "#4ade80" },
  { icon: Star, label: "High Scorer", color: "#60a5fa" },
];

// ==========================================

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState("Overall");
  const [selectedRank, setSelectedRank] = useState(null);
  const [, setLeaderboardHover] = useState(false);
  const [topPerformersHover, setTopPerformersHover] = useState(false);
  const [fullRankingsHover, setFullRankingsHover] = useState(false);
  const [yourRankingHover, setYourRankingHover] = useState(false);
  const [achievementsHover, setAchievementsHover] = useState(false);
  const [challengeHover, setChallengeHover] = useState(false);
  const [motivationHover, setMotivationHover] = useState(false);

  const interactiveStyle = {
    transition: "all 0.3s ease-in-out",
    cursor: "pointer",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06)",
  };

  const hoverEffect = {
    transform: "translateY(-2px)",
    boxShadow:
      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05)",
  };

  const tabs = ["Overall", "This Month", "This Week", "My Courses"];

  const navigate = useNavigate();

  const renderLeaderboardContent = () => {
    const streakAchievement = achievements.find(
      (a) => a.label === "Consistent"
    ) || {
      icon: Award,
      color: "#fbbf24",
    };

    const StreakIcon = streakAchievement.icon;
    const streakColor = streakAchievement.color;

    if (activeTab === "Overall") {
      return (
        <div className="content-grid">
          <div className="left-column">
            {/* --- Top Performers --- */}
            <div
              className="top-performers-card"
              style={{
                ...interactiveStyle,
                ...(topPerformersHover ? hoverEffect : {}),
              }}
              onMouseEnter={() => setTopPerformersHover(true)}
              onMouseLeave={() => setTopPerformersHover(false)}
            >
              <h2 className="section-title">Top Performers</h2>

              <div className="podium">
                {topPerformers.map((performer) => (
                  <div
                    key={performer.rank}
                    className={`podium-item podium-rank-${performer.rank}`}
                    onClick={() => navigate('/profile', { state: { user: performer } })}
                    style={{ cursor: 'pointer' }}
                  >
                    <div
                      className="podium-avatar"
                      style={{ backgroundColor: performer.color }}
                    >
                      {performer.rank === 1 && (
                        <Crown
                          className="crown-icon"
                          size={24}
                          style={{ marginBottom: "8px" }}
                        />
                      )}
                      <span
                        className={`rank-number ${
                          performer.rank === 1 ? "rank-number-1st" : ""
                        }`}
                      >
                        {performer.rank === 1
                          ? "1st"
                          : performer.rank === 2
                          ? "2nd"
                          : "3rd"}
                      </span>
                    </div>

                    <div className="podium-name">{performer.name}</div>
                    <div className="podium-points">{performer.points} pts</div>

                    <div
                      className="podium-bar"
                      style={{ backgroundColor: performer.color }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>

            {/* --- Full Rankings --- */}
            <div
              className="full-rankings-card"
              style={{
                ...interactiveStyle,
                ...(fullRankingsHover ? hoverEffect : {}),
              }}
              onMouseEnter={() => setFullRankingsHover(true)}
              onMouseLeave={() => setFullRankingsHover(false)}
            >
              <h2 className="section-title">Full Rankings</h2>

              <div className="rankings-list">
                {fullRankings.map((user) => (
                  <div
                    key={user.rank}
                    className={`ranking-item ${
                      selectedRank === user.rank ? "ranking-selected" : ""
                    }`}
                    style={
                      selectedRank === user.rank
                        ? { border: "1px solid black" }
                        : {}
                    }
                    onClick={() => {
                      setSelectedRank(user.rank);
                      navigate('/profile', { state: { user } });
                    }}
                  >
                    <div className="ranking-rank">{user.rank}</div>

                    <div
                      className="ranking-avatar"
                      style={{
                        backgroundColor:
                          user.rank === 1
                            ? "#1e3a5f"
                            : user.rank === 2
                            ? "#3b6ea5"
                            : user.rank === 3
                            ? "#4ca89a"
                            : "#3b6ea5",
                      }}
                    >
                      {user.initials}
                    </div>

                    <div className="ranking-info">
                      <div className="ranking-name">{user.name}</div>

                      <div className="ranking-stats">
                        {user.courses} courses · {user.avg}% avg ·{" "}
                        <StreakIcon size={14} style={{ color: streakColor }} />{" "}
                        {user.streak} day streak
                      </div>
                    </div>

                    <div className="ranking-points">{user.points}</div>

                    {user.trend === "up" ? (
                      <TrendingUp
                        className="ranking-trend trend-up"
                        size={20}
                      />
                    ) : (
                      <TrendingDown
                        className="ranking-trend trend-down"
                        size={20}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* --- Right Column --- */}
          <div className="right-column">
            {/* Your Ranking */}
            <div
              className="your-ranking-card"
              style={{
                ...interactiveStyle,
                ...(yourRankingHover ? hoverEffect : {}),
              }}
              onMouseEnter={() => setYourRankingHover(true)}
              onMouseLeave={() => setYourRankingHover(false)}
            >
              <div className="your-ranking-header">
                <span>Your Ranking</span>
                <Trophy size={24} />
              </div>

              <div className="your-ranking-badge">
                <div className="ranking-circle">1</div>
              </div>

              <div className="your-ranking-points">2,845</div>
              <div className="your-ranking-label">Total Points</div>

              <div className="your-ranking-stats">
                <div className="stat-row">
                  <span>Courses Completed</span>
                  <span className="stat-value">12</span>
                </div>
                <div className="stat-row">
                  <span>Average Score</span>
                  <span className="stat-value">95%</span>
                </div>
                <div className="stat-row">
                  <span>Current Streak</span>
                  <span className="stat-value">45 days</span>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div
              className="achievements-card"
              style={{
                ...interactiveStyle,
                ...(achievementsHover ? hoverEffect : {}),
              }}
              onMouseEnter={() => setAchievementsHover(true)}
              onMouseLeave={() => setAchievementsHover(false)}
            >
              <h3 className="section-title">Your Achievements</h3>

              <div className="achievements-list">
                {achievements.map((achievement, index) => (
                  <div key={index} className="achievement-item">
                    <achievement.icon
                      className="achievement-icon"
                      size={20}
                      style={{ color: achievement.color }}
                    />
                    <span>{achievement.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Challenge */}
            <div
              className="challenge-card"
              style={{
                ...interactiveStyle,
                ...(challengeHover ? hoverEffect : {}),
              }}
              onMouseEnter={() => setChallengeHover(true)}
              onMouseLeave={() => setChallengeHover(false)}
            >
              <h3 className="section-title">Weekly Challenge</h3>

              <div className="challenge-item">
                <div className="challenge-label-row">
                  <div>Complete 5 Courses</div>
                  <div className="challenge-progress-value">3/5</div>
                </div>

                <div className="challenge-progress-bar">
                  <div
                    className="challenge-progress-fill"
                    style={{ width: "60%", backgroundColor: "#4ade80" }}
                  ></div>
                </div>
              </div>

              <div className="challenge-item">
                <div className="challenge-label-row">
                  <div>Study 10 Hours</div>
                  <div className="challenge-progress-value">7/10</div>
                </div>

                <div className="challenge-progress-bar">
                  <div
                    className="challenge-progress-fill"
                    style={{ width: "70%", backgroundColor: "#3b82f6" }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Motivation */}
            <div
              className="motivation-card"
              style={{
                ...interactiveStyle,
                ...(motivationHover ? hoverEffect : {}),
              }}
              onMouseEnter={() => setMotivationHover(true)}
              onMouseLeave={() => setMotivationHover(false)}
            >
              <Star className="motivation-icon" size={24} />
              <h4 className="motivation-title">Keep Going!</h4>
              <p className="motivation-text">
                You're just 50 points away from overtaking the 2nd position.
                Keep up the great work!
              </p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <AppLayout showGreeting={false}>
      <div
        className="leaderboard-container"
        onMouseEnter={() => setLeaderboardHover(true)}
        onMouseLeave={() => setLeaderboardHover(false)}
      >
        <div className="leaderboard-header">
          <Trophy className="header-icon" size={40} />

          <div>
            <h1 className="header-title">Leaderboard</h1>
            <p className="header-subtitle">
              Compete with peers and track your progress
            </p>
          </div>
        </div>

        {/* TABS */}
        <div className="filter-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? "tab-active" : ""}`}
              onClick={() => {
                // For month/week tabs, navigate straight to Profile page
                if (tab === "This Month" || tab === "This Week") {
                  navigate("/profile");
                  setActiveTab(tab);
                  return;
                }

                // For 'My Courses' tab, navigate to courses page
                if (tab === "My Courses") {
                  navigate("/courses");
                  setActiveTab(tab);
                  return;
                }

                setActiveTab(tab);
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        {renderLeaderboardContent()}
      </div>
    </AppLayout>
  );
}
