import { useState } from 'react'
import { vendorProfile as initialVendorProfile, tenderHistory, tenders } from './demoData'
import TenderCard from './components/TenderCard'
import AnalysisModal from './components/AnalysisModal'
import ProfileUpdateModal from './components/ProfileUpdateModal'
import './App.css'

function App() {
  const [modalData, setModalData] = useState(null)
  const [vendorProfile, setVendorProfile] = useState(initialVendorProfile)
  const [profileModalOpen, setProfileModalOpen] = useState(false)

  return (
    <div className="page">
      <header className="header">
        <h1>סוכן המכרזים החכם</h1>
        <p className="subtitle">מערכת דמה — ניתוח אסטרטגי אוטומטי להתאמת מכרזים</p>
      </header>

      <div className="profile-quickbar">
        <span className="profile-quickbar-name">פרופיל ספק: {vendorProfile.companyName}</span>
        <button
          type="button"
          className="update-profile-btn"
          onClick={() => setProfileModalOpen(true)}
        >
          עדכון פרופיל ספק
        </button>
      </div>

      <section className="tenders-section">
        <h2 className="section-title">מכרזים פתוחים ({tenders.length})</h2>
        <div className="tenders-list">
          {tenders.map((tender) => (
            <TenderCard
              key={tender.id}
              tender={tender}
              vendorProfile={vendorProfile}
              tenderHistory={tenderHistory}
              onReadMore={(t, result) => setModalData({ tender: t, result })}
            />
          ))}
        </div>
      </section>

      <section className="card vendor-card">
        <div className="vendor-card-header">
          <h2 className="card-title">פרופיל הספק</h2>
          <button
            type="button"
            className="update-profile-btn"
            onClick={() => setProfileModalOpen(true)}
          >
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
      </section>

      <AnalysisModal
        tender={modalData?.tender}
        result={modalData?.result}
        onClose={() => setModalData(null)}
      />

      {profileModalOpen && (
        <ProfileUpdateModal
          vendorProfile={vendorProfile}
          onClose={() => setProfileModalOpen(false)}
          onSave={(updatedProfile) => {
            setVendorProfile(updatedProfile)
            setProfileModalOpen(false)
          }}
        />
      )}
    </div>
  )
}

export default App
