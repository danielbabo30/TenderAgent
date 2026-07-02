function VendorProfileModal({ vendorProfile, onClose, onEdit }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="סגור">
          ✕
        </button>

        <div className="vendor-modal-header">
          <h2 className="modal-title">פרופיל הספק</h2>
          <button type="button" className="update-profile-btn" onClick={onEdit}>
            עדכון פרופיל ספק
          </button>
        </div>

        <div className="grid">
          <div><strong>שם העסק:</strong> {vendorProfile.companyName}</div>
          <div><strong>גודל:</strong> {vendorProfile.companySize}</div>
          <div><strong>ותק:</strong> {vendorProfile.yearsOfExperience} שנים</div>
          <div><strong>ציון טכני ממוצע:</strong> {vendorProfile.averageTechnicalScore}</div>
          <div><strong>מחסנית טכנולוגית:</strong> {vendorProfile.techStack.join(', ')}</div>
          <div><strong>תחומי התמחות:</strong> {vendorProfile.specialties.join(', ')}</div>
          <div><strong>ניסיון במובייל:</strong> {vendorProfile.hasMobileExperience ? 'כן' : 'לא'}</div>
        </div>

        {vendorProfile.businessSummary && (
          <div className="summary-business-text">
            <strong>תקציר העסק:</strong>
            <p>{vendorProfile.businessSummary}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default VendorProfileModal
