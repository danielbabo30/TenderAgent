import { useState } from 'react'
import AiIcon from './AiIcon'
import StarIcon from './StarIcon'
import ClockIcon from './ClockIcon'
import { analyzeTender } from '../api'
import { formatHebrewDate, addDays } from '../utils/dateFormat'

function TenderCard({ tender, vendorProfile, tenderHistory, onReadMore }) {
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const [result, setResult] = useState(null)
  const [expanded, setExpanded] = useState(false)
  const [favorite, setFavorite] = useState(false)

  const handleAnalyzeClick = async () => {
    if (status === 'done') {
      setExpanded((prev) => !prev)
      return
    }
    setStatus('loading')
    try {
      const data = await analyzeTender(vendorProfile, tenderHistory, tender)
      setResult(data)
      setStatus('done')
      setExpanded(true)
    } catch {
      setStatus('error')
    }
  }

  const updatedDate = addDays(tender.submissionDeadline, -14)

  return (
    <article className="tender-row-card">
      <button
        type="button"
        className={`ai-analyze-btn ${status}`}
        onClick={handleAnalyzeClick}
        title="ניתוח AI"
      >
        {status === 'loading' ? (
          <span className="ai-spinner" />
        ) : (
          <AiIcon size={18} />
        )}
        <span className="ai-analyze-label">ניתוח</span>
      </button>

      <div className="tender-row-top">
        <div className="tender-row-main">
          <div className="tender-row-tag">
            <span className="tag-bar">|</span>
            {tender.tenderType}
          </div>
          <h3 className="tender-row-title">{tender.tenderName}</h3>
          <div className="tender-row-id">{tender.referenceNumber}</div>
          <div className="tender-row-meta">
            פורסם ב-{formatHebrewDate(tender.publishedDate)} | עודכן לאחרונה ב-{formatHebrewDate(updatedDate)}
          </div>
        </div>

        <div className="tender-row-divider" />

        <div className="tender-row-side">
          <button
            type="button"
            className={`favorite-btn ${favorite ? 'active' : ''}`}
            onClick={() => setFavorite((prev) => !prev)}
          >
            <StarIcon size={14} />
            הוספה למועדפים
          </button>

          <div className="deadline-block">
            <span className="deadline-label">
              <ClockIcon size={14} />
              מועד אחרון להגשה
            </span>
            <div className="deadline-date">{formatHebrewDate(tender.submissionDeadline)}</div>
            <div className="deadline-time">בשעה 16:00</div>
          </div>
        </div>
      </div>

      <div className="tender-row-details">
        <p className="tender-description">{tender.description}</p>
        <div className="tender-meta">
          <span className="meta-chip">{tender.publishingBody}</span>
          <span className="meta-chip">סף טכני: {tender.minimumThresholdScore}</span>
          <span className="meta-chip">{tender.estimatedBudget?.toLocaleString('he-IL')} ₪</span>
          {tender.requiresMobileExperience && (
            <span className="meta-chip mobile-chip">דורש מובייל</span>
          )}
        </div>
        <div className="tender-capabilities">
          {tender.requiredCapabilities.map((cap) => (
            <span key={cap} className="capability-tag">{cap}</span>
          ))}
        </div>
      </div>

      {status === 'error' && (
        <div className="error-box small">אירעה שגיאה בניתוח. נסו שוב.</div>
      )}

      {expanded && result && (
        <div className="analysis-dropdown">
          <div className="score-row">
            <div className="score-circle small">{result.successProbability}%</div>
            <p className="score-explanation">{result.successProbabilityExplanation}</p>
          </div>
          <button
            type="button"
            className="read-more-btn"
            onClick={() => onReadMore(tender, result)}
          >
            קרא עוד
          </button>
        </div>
      )}
    </article>
  )
}

export default TenderCard
