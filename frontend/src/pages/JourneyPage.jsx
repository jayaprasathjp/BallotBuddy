// src/pages/JourneyPage.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import "./JourneyPage.css";

const JOURNEY_STEPS = [
  {
    id: 1,
    icon: "✅",
    title: "Eligibility Check",
    color: "#1a73e8",
    summary: "Verify you meet the requirements to vote in Indian elections.",
    content: {
      overview:
        "Before registering to vote, ensure you meet all eligibility requirements set by the Election Commission of India (ECI).",
      requirements: [
        "Indian citizen (by birth or naturalization)",
        "Minimum age of 18 years on January 1st of the qualifying year",
        "Ordinary resident of the constituency",
        "Not of unsound mind",
        "Not disqualified under any election law",
      ],
      documents: [
        "Proof of age: Birth Certificate, Passport, or Matriculation Certificate",
        "Proof of citizenship: Passport or Naturalization Certificate",
        "Proof of residence: Aadhaar Card, Utility Bill, or Bank Passbook",
      ],
      tip: "Even if you are 17, you can apply in advance and your registration will activate when you turn 18.",
    },
  },
  {
    id: 2,
    icon: "📝",
    title: "Voter Registration",
    color: "#7c3aed",
    summary: "Register yourself on the Electoral Roll using Form 6.",
    content: {
      overview:
        "Voter registration (enrollment) is the process of adding your name to the Electoral Roll of your constituency. This is free and mandatory for voting.",
      requirements: [
        "Visit voters.eci.gov.in or download the Voter Helpline App",
        "Fill Form 6 – Application for inclusion in Electoral Roll",
        "Upload required documents (age proof + address proof + photo)",
        "Track your application using the reference number",
        "BLO (Booth Level Officer) will verify your details",
      ],
      documents: [
        "Age Proof: Any government document showing date of birth",
        "Address Proof: Aadhaar Card, Electricity/Water Bill, Bank Passbook",
        "Recent passport-size photograph (JPEG format)",
      ],
      tip: "Applications are processed within 30 days. You will receive SMS updates on your mobile number.",
    },
  },
  {
    id: 3,
    icon: "🔍",
    title: "Electoral Roll Verification",
    color: "#0891b2",
    summary:
      "Verify your name appears on the Electoral Roll before election day.",
    content: {
      overview:
        "After registration, verify your name on the Electoral Roll to ensure you can vote. Also find your polling booth address.",
      requirements: [
        "Visit electoralsearch.eci.gov.in",
        "Search by name, EPIC number, or mobile number",
        "Download or note your polling booth number and address",
        "Report any errors using Form 8 for corrections",
      ],
      documents: ["Your EPIC (Voter ID) card or enrollment number"],
      tip: "Check the Electoral Roll at least 30 days before the election date to allow time for corrections if needed.",
    },
  },
  {
    id: 4,
    icon: "👥",
    title: "Candidate Awareness",
    color: "#059669",
    summary: "Research candidates standing for election in your constituency.",
    content: {
      overview:
        "An informed voter is a powerful voter. Research candidates, their background, and promises before the election.",
      requirements: [
        "Visit myneta.info for candidate affidavit information",
        "Review candidate background: education, assets, criminal cases",
        "Attend public meetings and debates",
        "Read party manifestos",
        "Use BallotBuddy AI Candidate Comparison tool",
      ],
      documents: ["Candidate affidavits (filed with ECI) are public documents"],
      tip: "All candidates must file an affidavit with the Election Commission declaring their assets, liabilities, education, and criminal cases (if any). These are public records.",
    },
  },
  {
    id: 5,
    icon: "🗳️",
    title: "Voting Process",
    color: "#d97706",
    summary: "Cast your vote at your designated polling booth on election day.",
    content: {
      overview:
        "On polling day, visit your designated polling booth with your Voter ID card and cast your vote on the EVM.",
      requirements: [
        "Locate your polling booth (from Electoral Roll)",
        "Carry your Voter ID (EPIC) or approved alternative ID",
        "Arrive during polling hours (7 AM – 6 PM typically)",
        "Wait in queue and show ID to polling officer",
        "Press the button next to your chosen candidate on the EVM",
        "Observe the VVPAT slip to confirm your vote",
      ],
      documents: [
        "Primary: EPIC (Voter ID Card)",
        "Alternatives: Aadhaar, Passport, Driving Licence, PAN Card, Employee ID, Bank Passbook with photo",
      ],
      tip: "Polling booths have separate queues for women, senior citizens, and persons with disabilities. Exercise your right – voting takes only 5-10 minutes!",
    },
  },
  {
    id: 6,
    icon: "🔢",
    title: "Vote Counting",
    color: "#7c3aed",
    summary: "EVMs are opened and votes counted at counting centers.",
    content: {
      overview:
        "After polling day, EVMs are sealed and stored securely. On counting day, votes are tallied at counting centers under strict supervision.",
      requirements: [
        "Counting begins at a fixed time on counting day",
        "Representatives of all candidates (counting agents) are present",
        "EVMs are opened round by round",
        "VVPAT slips from randomly selected EVMs are verified",
        "Results are announced after all rounds are counted and verified",
      ],
      documents: [
        "The counting process is public – results are announced officially",
      ],
      tip: "Results are transmitted to the Election Commission in real-time and published on the official ECI website and Voter Helpline App.",
    },
  },
  {
    id: 7,
    icon: "🏆",
    title: "Result Declaration",
    color: "#dc2626",
    summary: "The winning candidate is declared and takes oath of office.",
    content: {
      overview:
        "After counting, the Returning Officer declares the result. The winning candidate takes the oath and represents the constituency.",
      requirements: [
        "Returning Officer announces the winner",
        "Candidates can request recount within 30 days",
        "Winner files oath of office",
        "New parliament/assembly convenes",
        "Democratic process begins again!",
      ],
      documents: [
        "Result certificates are public documents available on ECI website",
      ],
      tip: "If you believe there has been an election irregularity, you can file an election petition in the High Court within 45 days of the result declaration.",
    },
  },
];

export default function JourneyPage() {
  const { t } = useTranslation();
  const [expandedStep, setExpandedStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const toggleStep = (stepId) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  const toggleComplete = (stepId, e) => {
    e.stopPropagation();
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.has(stepId) ? next.delete(stepId) : next.add(stepId);
      return next;
    });
  };

  const progress = Math.round(
    (completedSteps.size / JOURNEY_STEPS.length) * 100,
  );

  return (
    <div className="journey-page">
      <div className="container">
        {/* Header */}
        <div className="journey-header">
          <h1 className="journey-title">🗺️ {t("journey.title")}</h1>
          <p className="journey-subtitle">{t("journey.subtitle")}</p>

          {/* Progress */}
          <div
            className="journey-progress"
            aria-label={`Progress: ${progress}% completed`}
          >
            <div className="progress-info">
              <span>
                {t("journey.progress")}: {completedSteps.size}/
                {JOURNEY_STEPS.length} steps
              </span>
              <span className="progress-pct">{progress}%</span>
            </div>
            <div
              className="progress-bar"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="progress-bar-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Steps */}
        <ol className="journey-steps">
          {JOURNEY_STEPS.map((step, index) => {
            const isExpanded = expandedStep === step.id;
            const isCompleted = completedSteps.has(step.id);
            const isCurrent =
              !isCompleted && (index === 0 || completedSteps.has(step.id - 1));

            return (
              <li
                key={step.id}
                className={`step-card ${isExpanded ? "expanded" : ""} ${isCompleted ? "completed" : ""} ${isCurrent ? "current" : ""}`}
                style={{ "--step-color": step.color }}
              >
                <button
                  className="step-header"
                  onClick={() => toggleStep(step.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`step-content-${step.id}`}
                  id={`step-btn-${step.id}`}
                >
                  <div className="step-number-wrapper">
                    <div
                      className={`step-number ${isCompleted ? "done" : ""}`}
                      aria-hidden="true"
                    >
                      {isCompleted ? "✓" : step.id}
                    </div>
                    {index < JOURNEY_STEPS.length - 1 && (
                      <div className="step-connector" aria-hidden="true" />
                    )}
                  </div>

                  <div className="step-info">
                    <div className="step-icon-title">
                      <span className="step-icon" aria-hidden="true">
                        {step.icon}
                      </span>
                      <span className="step-title">{step.title}</span>
                      {isCurrent && (
                        <span className="badge badge-primary">Current</span>
                      )}
                      {isCompleted && (
                        <span className="badge badge-success">Done</span>
                      )}
                    </div>
                    <p className="step-summary">{step.summary}</p>
                  </div>

                  <span className="step-chevron" aria-hidden="true">
                    {isExpanded ? "▲" : "▼"}
                  </span>
                </button>

                {isExpanded && (
                  <div
                    id={`step-content-${step.id}`}
                    className="step-content"
                    role="region"
                    aria-labelledby={`step-btn-${step.id}`}
                  >
                    <p className="step-overview">{step.content.overview}</p>

                    <div className="step-sections">
                      <div className="step-section">
                        <h3 className="step-section-title">
                          📋 Steps & Requirements
                        </h3>
                        <ol
                          className="step-list"
                          aria-label="Step requirements"
                        >
                          {step.content.requirements.map((req, i) => (
                            <li key={i} className="step-list-item">
                              {req}
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div className="step-section">
                        <h3 className="step-section-title">
                          📄 Documents Needed
                        </h3>
                        <ul
                          className="doc-list"
                          aria-label="Required documents"
                        >
                          {step.content.documents.map((doc, i) => (
                            <li key={i} className="doc-item">
                              <span aria-hidden="true">📌</span> {doc}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="step-tip" role="note" aria-label="Pro tip">
                      <span aria-hidden="true">💡</span>
                      <p>
                        <strong>Pro Tip:</strong> {step.content.tip}
                      </p>
                    </div>

                    <button
                      className={`btn ${isCompleted ? "btn-secondary" : "btn-primary"} mark-complete-btn`}
                      onClick={(e) => toggleComplete(step.id, e)}
                      aria-pressed={isCompleted}
                      aria-label={
                        isCompleted
                          ? `Mark step ${step.id} as incomplete`
                          : `Mark step ${step.id} as complete`
                      }
                    >
                      {isCompleted
                        ? "↩ " + t("journey.step_completed")
                        : "✓ " + t("journey.step_complete")}
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
