// src/pages/TimelinePage.jsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { timelineApi } from "../services/api";
import {
  requestNotificationPermission,
  onMessageListener,
} from "../services/notifications";
import SkeletonLoader from "../components/SkeletonLoader";
import "./TimelinePage.css";

export default function TimelinePage() {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [remindersSet, setRemindersSet] = useState(new Set());
  const [view, setView] = useState("timeline"); // 'timeline' | 'calendar'

  useEffect(() => {
    timelineApi
      .list()
      .then((res) => setEvents(res.data.events || []))
      .catch(() => setEvents([]))
      .finally(() => setIsLoading(false));
  }, []);

  const handleReminder = async (eventId) => {
    setRemindersSet((prev) => new Set([...prev, eventId]));

    try {
      const fcmToken = await requestNotificationPermission();
      if (fcmToken) {
        await timelineApi.scheduleReminder(eventId, fcmToken);
        // Show browser notification if supported as local fallback/confirmation
        if ("Notification" in globalThis && Notification.permission === "granted") {
          new Notification("🗳️ BallotBuddy Reminder Set!", {
            body: `You will be reminded about this election event.`,
            icon: "/vite.svg",
          });
        }
      }
    } catch (err) {
      if (import.meta.env.DEV)
        console.error("Failed to schedule reminder", err);
    }
  };

  const typeColors = {
    announcement: "#1a73e8",
    nomination: "#7c3aed",
    scrutiny: "#0891b2",
    withdrawal: "#d97706",
    campaign: "#059669",
    silence: "#94a3b8",
    polling: "#dc2626",
    counting: "#7c3aed",
    result: "#d97706",
  };

  if (isLoading)
    return (
      <div className="container section">
        <SkeletonLoader type="card" count={5} />
      </div>
    );

  return (
    <div className="timeline-page">
      <div className="container">
        <div className="timeline-header">
          <h1 className="timeline-title">📅 {t("timeline.title")}</h1>
          <p className="timeline-subtitle">{t("timeline.subtitle")}</p>

          <div
            className="view-switcher"
            role="group"
            aria-label="View switcher"
          >
            <button
              className={`view-btn ${view === "timeline" ? "active" : ""}`}
              onClick={() => setView("timeline")}
              aria-pressed={view === "timeline"}
            >
              📊 Timeline
            </button>
            <button
              className={`view-btn ${view === "calendar" ? "active" : ""}`}
              onClick={() => setView("calendar")}
              aria-pressed={view === "calendar"}
            >
              📅 Calendar
            </button>
          </div>
        </div>

        {view === "timeline" ? (
          <ol
            className="timeline-track"
            aria-label="Election timeline events"
          >
            {events.map((event, index) => {
              const color = typeColors[event.type] || "#1a73e8";
              const isReminderSet = remindersSet.has(event.id);

              return (
                <li
                  key={event.id}
                  className={`timeline-event ${event.completed ? "completed" : ""} ${event.current ? "current" : ""} ${event.important ? "important" : ""}`}
                  style={{ "--event-color": color }}
                  aria-label={`${event.title}: ${event.date}${event.completed ? ", completed" : ""}${event.current ? ", current" : ""}`}
                >
                  <div className="event-line-wrapper" aria-hidden="true">
                    <div
                      className={`event-dot ${event.completed ? "done" : ""}`}
                      style={{ background: color }}
                    >
                      {event.completed ? "✓" : event.icon}
                    </div>
                    {index < events.length - 1 && (
                      <div className="event-line" />
                    )}
                  </div>

                  <div className="event-card card">
                    <div className="event-card-header">
                      <div>
                        <div className="event-date">
                          {new Date(event.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </div>
                        <h2 className="event-title">{event.title}</h2>
                      </div>
                      <div className="event-badges">
                        {event.completed && (
                          <span className="badge badge-success">
                            {t("timeline.completed")}
                          </span>
                        )}
                        {event.current && (
                          <span className="badge badge-primary">
                            {t("timeline.current")}
                          </span>
                        )}
                        {!event.completed && !event.current && (
                          <span className="badge badge-warning">
                            {t("timeline.upcoming")}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="event-description">{event.description}</p>

                    {!event.completed && (
                      <button
                        className={`btn btn-sm ${isReminderSet ? "btn-secondary" : "btn-primary"} reminder-btn`}
                        onClick={() => handleReminder(event.id)}
                        disabled={isReminderSet}
                        aria-label={
                          isReminderSet
                            ? `Reminder set for ${event.title}`
                            : `Set reminder for ${event.title}`
                        }
                        aria-pressed={isReminderSet}
                      >
                        {isReminderSet
                          ? `🔔 ${t("timeline.reminder_set")}`
                          : `🔔 ${t("timeline.set_reminder")}`}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <ul
            className="calendar-grid"
            role="list"
            aria-label="Election Calendar Grid"
          >
            {events.map((event) => {
              const date = new Date(event.date);
              return (
                <li
                  key={event.id}
                  className={`cal-event card ${event.completed ? "completed" : ""} ${event.important ? "important" : ""}`}
                  style={{
                    "--event-color": typeColors[event.type] || "#1a73e8",
                  }}
                  aria-label={`${event.title} on ${date.toLocaleDateString("en-IN")}`}
                >
                  <div className="cal-date-block">
                    <span className="cal-day">{date.getDate()}</span>
                    <span className="cal-month">
                      {date.toLocaleString("en", { month: "short" })}
                    </span>
                    <span className="cal-year">{date.getFullYear()}</span>
                  </div>
                  <div className="cal-info">
                    <span className="cal-icon" aria-hidden="true">
                      {event.icon}
                    </span>
                    <div>
                      <div className="cal-title">{event.title}</div>
                      <div className="cal-type">{event.type}</div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
