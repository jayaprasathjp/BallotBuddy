// src/pages/CandidatesPage.jsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { candidatesApi } from "../services/api";
import SkeletonLoader from "../components/SkeletonLoader";
import "./CandidatesPage.css";

import PropTypes from "prop-types";

const CandidateCard = ({ candidate, selected, onSelect, t }) => {
  return (
    <li
      className={`candidate-card card ${selected ? "selected" : ""}`}
      aria-label={`Candidate: ${candidate.name}, Party: ${candidate.party}`}
    >
      <div
        className="candidate-avatar"
        style={{
          background: `${candidate.partyColor}20`,
          color: candidate.partyColor,
        }}
        aria-hidden="true"
      >
        {candidate.imageInitial || candidate.name[0]}
      </div>
      <div className="candidate-info">
        <h2 className="candidate-name">{candidate.name}</h2>
        <div
          className="party-chip"
          style={{
            background: `${candidate.partyColor}20`,
            color: candidate.partyColor,
          }}
        >
          {candidate.party}
        </div>
        <ul className="candidate-meta" aria-label="Candidate details">
          <li>
            <span className="meta-label">{t("candidates.education")}:</span>{" "}
            {candidate.education}
          </li>
          <li>
            <span className="meta-label">{t("candidates.experience")}:</span>{" "}
            {candidate.experience}
          </li>
          <li>
            <span className="meta-label">{t("candidates.assets")}:</span>{" "}
            {candidate.assets}
          </li>
          <li>
            <span className="meta-label">
              {t("candidates.criminal_cases")}:
            </span>{" "}
            <span
              className={
                candidate.criminalCases > 0 ? "text-danger" : "text-success"
              }
            >
              {candidate.criminalCases === 0 ? "None" : candidate.criminalCases}
            </span>
          </li>
        </ul>
        {(candidate.manifesto ?? []).length > 0 && (
          <div className="manifesto-chips">
            {(candidate.manifesto ?? []).slice(0, 3).map((item) => (
              <span key={item} className="manifesto-chip">
                {item}
              </span>
            ))}
          </div>
        )}
      </div>
      <button
        type="button"
        className={`btn btn-sm ${selected ? "btn-primary" : "btn-secondary"} compare-toggle`}
        onClick={() => onSelect(candidate.id)}
        aria-pressed={selected}
        aria-label={
          selected
            ? `Remove ${candidate.name} from comparison`
            : `Add ${candidate.name} to comparison`
        }
      >
        {selected ? "✓ Selected" : "+ Compare"}
      </button>
    </li>
  );
};

CandidateCard.propTypes = {
  candidate: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    party: PropTypes.string.isRequired,
    partyColor: PropTypes.string,
    imageInitial: PropTypes.string,
    education: PropTypes.string,
    experience: PropTypes.string,
    assets: PropTypes.string,
    criminalCases: PropTypes.number,
    manifesto: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  selected: PropTypes.bool,
  onSelect: PropTypes.func,
  t: PropTypes.func.isRequired,
};

export default function CandidatesPage() {
  const { t } = useTranslation();
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    candidatesApi
      .list()
      .then((res) => setCandidates(res.data.candidates || []))
      .catch(() => setCandidates([]))
      .finally(() => setIsLoading(false));
  }, []);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id].slice(0, 4),
    );
    setComparison(null);
  };

  const handleCompare = async () => {
    if (selected.length < 2) return;
    setIsComparing(true);
    try {
      const res = await candidatesApi.compare(selected);
      setComparison(res.data);
    } catch (e) {
      setComparison({ error: t("common.error") });
    } finally {
      setIsComparing(false);
    }
  };

  if (isLoading)
    return (
      <div className="container section">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1rem",
          }}
        >
          <SkeletonLoader type="candidate" count={4} />
        </div>
      </div>
    );

  const selectedCandidates = candidates.filter((c) => selected.includes(c.id));

  return (
    <div className="candidates-page">
      <div className="container">
        <div className="candidates-header">
          <h1 className="candidates-title">👥 {t("candidates.title")}</h1>
          <p className="candidates-subtitle">{t("candidates.subtitle")}</p>

          {selected.length >= 2 && (
            <div className="compare-bar" role="status" aria-live="polite">
              <span>{selected.length} candidates selected</span>
              <button
                className="btn btn-primary"
                onClick={handleCompare}
                disabled={isComparing}
                aria-label={`Compare ${selected.length} selected candidates`}
              >
                {isComparing
                  ? "🤖 Analyzing..."
                  : `🤖 ${t("candidates.compare")}`}
              </button>
            </div>
          )}

          {selected.length === 0 && (
            <p className="select-hint" role="note">
              {t("candidates.select_to_compare")}
            </p>
          )}
        </div>

        {/* AI Comparison Result */}
        {comparison && !comparison.error && (
          <div
            className="comparison-panel"
            role="region"
            aria-label="AI comparison results"
          >
            <h2 className="comparison-title">
              🤖 {t("candidates.ai_comparison")}
            </h2>
            <p className="comparison-summary">{comparison.summary}</p>
            <ul className="comparison-cards">
              {comparison.candidates?.map((c) => (
                <li
                  key={c.id}
                  className="compare-mini-card"
                  aria-label={`${c.name} comparison summary`}
                >
                  <div
                    className="compare-avatar"
                    style={{
                      background: `${c.partyColor}20`,
                      color: c.partyColor,
                    }}
                  >
                    {c.imageInitial}
                  </div>
                  <div className="compare-name">{c.name}</div>
                  <div
                    className="compare-party"
                    style={{ color: c.partyColor }}
                  >
                    {c.party}
                  </div>
                  <div className="compare-detail">
                    <b>Assets:</b> {c.assets}
                  </div>
                  <div className="compare-detail">
                    <b>Cases:</b>{" "}
                    {c.criminalCases === 0 ? "None" : c.criminalCases}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Candidate Grid */}
        <ul className="candidates-grid" aria-label="All candidates">
          {candidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              selected={selected.includes(candidate.id)}
              onSelect={toggleSelect}
              t={t}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
