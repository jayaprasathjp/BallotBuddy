// src/pages/VotePage.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { v4 as uuidv4 } from "uuid";
import { votingApi } from "../services/api";
import "./VotePage.css";

const MOCK_CANDIDATES = [
  {
    id: "cand-001",
    name: "Priya Sharma",
    party: "Progressive Alliance",
    partyColor: "#1976d2",
    symbol: "🌟",
  },
  {
    id: "cand-002",
    name: "Rajesh Kumar",
    party: "National Unity Party",
    partyColor: "#f57c00",
    symbol: "🌅",
  },
  {
    id: "cand-003",
    name: "Meera Patel",
    party: "Green Future Party",
    partyColor: "#388e3c",
    symbol: "🌿",
  },
  {
    id: "cand-004",
    name: "Arjun Singh",
    party: "Peoples Voice Party",
    partyColor: "#7b1fa2",
    symbol: "🕊️",
  },
  {
    id: "nota",
    name: "NOTA",
    party: "None of the Above",
    partyColor: "#94a3b8",
    symbol: "✖️",
  },
];

const SESSION_ID = uuidv4(); // Session-scoped, not stored

export default function VotePage() {
  const { t } = useTranslation();
  const [step, setStep] = useState("select"); // select | confirm | vvpat | receipt
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSelect = (candidate) => {
    setSelectedCandidate(candidate);
    setError("");
  };

  const handleConfirm = () => {
    if (!selectedCandidate) return;
    setStep("confirm");
  };

  const handleCastVote = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await votingApi.simulate(selectedCandidate.id, SESSION_ID);
      setReceipt(res.data.receipt);
      setStep("vvpat");
      // Auto-advance to receipt
      setTimeout(() => setStep("receipt"), 2500);
    } catch (err) {
      const msg = err.response?.data?.error || t("common.error");
      if (err.response?.data?.code === "DUPLICATE_VOTE") {
        setError("You have already voted in this session.");
        setStep("select");
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetVote = () => {
    setStep("select");
    setSelectedCandidate(null);
    setReceipt(null);
    setError("");
  };

  return (
    <div className="vote-page">
      <div className="container">
        <div className="vote-header">
          <h1 className="vote-title">🗳️ {t("vote.title")}</h1>
          <p className="vote-subtitle">{t("vote.subtitle")}</p>
          <div className="vote-disclaimer" role="note" aria-label="Disclaimer">
            ⚠️ {t("vote.disclaimer")}
          </div>
        </div>

        {/* Step Indicator */}
        <div className="vote-steps" role="list" aria-label="Voting steps">
          {["Select", "Confirm", "VVPAT", "Receipt"].map((s, i) => {
            const stepMap = {
              Select: "select",
              Confirm: "confirm",
              VVPAT: "vvpat",
              Receipt: "receipt",
            };
            const steps = ["select", "confirm", "vvpat", "receipt"];
            const currentIdx = steps.indexOf(step);
            const thisIdx = i;
            const isDone = thisIdx < currentIdx;
            const isCurrent = thisIdx === currentIdx;
            return (
              <div
                key={s}
                className={`vstep ${isDone ? "done" : ""} ${isCurrent ? "current" : ""}`}
                role="listitem"
                aria-current={isCurrent ? "step" : undefined}
              >
                <div className="vstep-num">{isDone ? "✓" : i + 1}</div>
                <span>{s}</span>
                {i < 3 && <div className="vstep-line" aria-hidden="true" />}
              </div>
            );
          })}
        </div>

        {/* Select Candidate */}
        {step === "select" && (
          <div className="ballot-paper" role="main" aria-label="Ballot paper">
            <div className="ballot-header">
              <h2>🗳️ BALLOT PAPER</h2>
              <p>Delhi East Constituency — General Election 2024</p>
            </div>
            <div className="ballot-instruction" role="note">
              Press the button next to your chosen candidate
            </div>

            {error && (
              <div className="vote-error" role="alert">
                {error}
              </div>
            )}

            <div
              className="ballot-candidates"
              role="radiogroup"
              aria-label="Candidate selection"
            >
              {MOCK_CANDIDATES.map((c) => (
                <div
                  key={c.id}
                  className={`ballot-row ${selectedCandidate?.id === c.id ? "selected" : ""} ${c.id === "nota" ? "nota-row" : ""}`}
                  onClick={() => handleSelect(c)}
                  role="radio"
                  aria-checked={selectedCandidate?.id === c.id}
                  tabIndex={0}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") && handleSelect(c)
                  }
                  aria-label={`${c.name} from ${c.party}`}
                >
                  <div
                    className="ballot-symbol"
                    style={{
                      background: `${c.partyColor}20`,
                      color: c.partyColor,
                    }}
                    aria-hidden="true"
                  >
                    {c.symbol}
                  </div>
                  <div className="ballot-name">
                    <div className="ballot-cand-name">{c.name}</div>
                    <div
                      className="ballot-party"
                      style={{ color: c.partyColor }}
                    >
                      {c.party}
                    </div>
                  </div>
                  <button
                    className={`ballot-btn ${selectedCandidate?.id === c.id ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(c);
                    }}
                    aria-label={`Select ${c.name}`}
                    tabIndex={-1}
                  >
                    {selectedCandidate?.id === c.id ? "●" : "○"}
                  </button>
                </div>
              ))}
            </div>

            <button
              className="btn btn-primary btn-lg vote-submit"
              onClick={handleConfirm}
              disabled={!selectedCandidate}
              aria-label={
                selectedCandidate
                  ? `Proceed to confirm vote for ${selectedCandidate.name}`
                  : "Select a candidate first"
              }
            >
              {t("vote.cast_vote")} →
            </button>
          </div>
        )}

        {/* Confirm */}
        {step === "confirm" && selectedCandidate && (
          <div
            className="confirm-panel"
            role="dialog"
            aria-labelledby="confirm-heading"
            aria-modal="true"
          >
            <h2 id="confirm-heading" className="confirm-title">
              ⚠️ {t("vote.confirm_vote")}
            </h2>
            <div
              className="confirm-card"
              style={{ borderColor: selectedCandidate.partyColor }}
            >
              <div
                className="confirm-symbol"
                style={{
                  background: `${selectedCandidate.partyColor}20`,
                  color: selectedCandidate.partyColor,
                }}
              >
                {selectedCandidate.symbol}
              </div>
              <div className="confirm-info">
                <div className="confirm-name">{selectedCandidate.name}</div>
                <div
                  className="confirm-party"
                  style={{ color: selectedCandidate.partyColor }}
                >
                  {selectedCandidate.party}
                </div>
              </div>
            </div>
            <p className="confirm-warning">
              Once submitted, your vote cannot be changed. Are you sure?
            </p>
            <div className="confirm-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setStep("select")}
                aria-label="Go back and change selection"
              >
                ← Change
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCastVote}
                disabled={isLoading}
                aria-label={`Confirm vote for ${selectedCandidate.name}`}
              >
                {isLoading ? "⏳ Processing..." : "✓ Confirm Vote"}
              </button>
            </div>
          </div>
        )}

        {/* VVPAT Animation */}
        {step === "vvpat" && (
          <div
            className="vvpat-panel"
            role="status"
            aria-live="polite"
            aria-label="VVPAT paper slip being printed"
          >
            <div className="vvpat-machine" aria-hidden="true">
              <div className="vvpat-screen">VVPAT</div>
              <div className="vvpat-slot">
                <div className="vvpat-slip">
                  <div className="slip-icon">{selectedCandidate?.symbol}</div>
                  <div className="slip-name">{selectedCandidate?.name}</div>
                  <div className="slip-party">{selectedCandidate?.party}</div>
                </div>
              </div>
            </div>
            <p>🖨️ Printing VVPAT slip...</p>
            <p className="vvpat-note">
              Your vote has been recorded. Verify the printed slip.
            </p>
          </div>
        )}

        {/* Receipt */}
        {step === "receipt" && receipt && (
          <div className="receipt-panel" role="main" aria-label="Vote receipt">
            <div className="receipt-success">
              <div className="success-icon" aria-hidden="true">
                ✅
              </div>
              <h2>{t("vote.vote_cast")}</h2>
              <p>Thank you for participating in Indian Democracy!</p>
            </div>

            <article
              className="receipt-card"
              aria-label="VVPAT receipt details"
            >
              <div className="receipt-header">
                <h3>🗳️ {t("vote.vvpat_preview")}</h3>
                <span className="badge badge-success">SIMULATION</span>
              </div>
              <div className="receipt-row">
                <span>{t("vote.vote_id")}:</span>
                <code>{receipt.voteId?.slice(0, 8).toUpperCase()}...</code>
              </div>
              <div className="receipt-row">
                <span>{t("vote.serial")}:</span>
                <code>{receipt.serialNumber}</code>
              </div>
              <div className="receipt-row">
                <span>{t("vote.timestamp")}:</span>
                <code>
                  {new Date(receipt.timestamp).toLocaleString("en-IN")}
                </code>
              </div>
              <div className="receipt-disclaimer" role="note">
                {receipt.disclaimer}
              </div>
            </article>

            <button
              className="btn btn-secondary"
              onClick={resetVote}
              aria-label="Start over and vote again"
            >
              🔄 {t("vote.back")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
