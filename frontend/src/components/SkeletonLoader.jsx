// src/components/SkeletonLoader.jsx
import "./SkeletonLoader.css";

export default function SkeletonLoader({ type = "card", count = 1 }) {
  const renderSkeleton = () => {
    switch (type) {
      case "page":
        return (
          <div
            className="skeleton-page"
            role="status"
            aria-label="Loading page content"
          >
            <div className="skeleton skeleton-hero" />
            <div className="skeleton-grid">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton skeleton-card-block" />
              ))}
            </div>
          </div>
        );
      case "chat":
        return (
          <div
            className="skeleton-chat"
            role="status"
            aria-label="Loading response"
          >
            <div
              className="skeleton skeleton-bubble"
              style={{ width: "80%" }}
            />
            <div
              className="skeleton skeleton-bubble"
              style={{ width: "60%" }}
            />
            <div
              className="skeleton skeleton-bubble"
              style={{ width: "70%" }}
            />
          </div>
        );
      case "candidate":
        return (
          <div
            className="skeleton-candidate"
            role="status"
            aria-label="Loading candidate"
          >
            <div
              className="skeleton"
              style={{ width: 64, height: 64, borderRadius: "50%" }}
            />
            <div className="skeleton skeleton-text" style={{ width: "60%" }} />
            <div className="skeleton skeleton-text" style={{ width: "40%" }} />
            <div className="skeleton skeleton-text" style={{ width: "80%" }} />
          </div>
        );
      default:
        return (
          <div className="card" role="status" aria-label="Loading">
            <div
              className="skeleton skeleton-text"
              style={{ width: "70%", height: 20 }}
            />
            <div className="skeleton skeleton-text" />
            <div className="skeleton skeleton-text" style={{ width: "50%" }} />
          </div>
        );
    }
  };

  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </>
  );
}
