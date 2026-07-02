function AnalysisModal({ tender, result, onClose }) {
  if (!tender || !result) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="סגור">
          ✕
        </button>

        <h2 className="modal-title">{tender.tenderName}</h2>
        <p className="modal-subtitle">{tender.publishingBody}</p>

        <section className="modal-section">
          <h3 className="modal-section-title">📊 מדד התאמה וסיכויי הצלחה</h3>
          <div className="score-row">
            <div className="score-circle">{result.successProbability}%</div>
            <p className="score-explanation">{result.successProbabilityExplanation}</p>
          </div>
        </section>

        <section className="modal-section">
          <h3 className="modal-section-title">🔍 ניתוח סיבות מהעבר (למידת מכונה)</h3>
          <p>{result.pastReasonsAnalysis}</p>
        </section>

        <section className="modal-section">
          <h3 className="modal-section-title">💡 המלצות אופרטיביות לשיפור העסק וההגשה</h3>
          <ul className="recommendations">
            {result.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

export default AnalysisModal
