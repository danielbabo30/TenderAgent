import { useState, useRef, useEffect } from 'react'

const CHAT_QUESTIONS = [
  'ספרו לי בקצרה על העסק – במה אתם עוסקים?',
  'כמה עובדים יש כיום בעסק?',
  'במה אתם מתמחים? (טכנולוגיות עיקריות ותחומי עשייה)',
  'האם יש לכם ניסיון בפיתוח אפליקציות מובייל?',
]

function buildProfileFromChat(vendorProfile, answers) {
  const updated = { ...vendorProfile }
  if (answers[0]) updated.businessSummary = answers[0]
  if (answers[1]) updated.companySize = answers[1]
  if (answers[2]) {
    updated.specialties = answers[2]
      .split(/[,،]/)
      .map((s) => s.trim())
      .filter(Boolean)
  }
  if (answers[3] !== undefined) {
    updated.hasMobileExperience = /כן|yes/i.test(answers[3])
  }
  return updated
}

function ChoiceScreen({ onSelect }) {
  return (
    <div className="profile-choice-screen">
      <p className="profile-choice-intro">בחרו כיצד תרצו לעדכן את פרופיל הספק שלכם:</p>
      <div className="profile-choice-cards">
        <button type="button" className="profile-choice-card" onClick={() => onSelect('upload')}>
          <span className="choice-card-icon">📄</span>
          <h3>העלאת סיכום פרופיל עסק</h3>
          <p>העלו קובץ Word קיים או כתבו תקציר טקסטואלי חופשי על העסק</p>
        </button>
        <button type="button" className="profile-choice-card recommended" onClick={() => onSelect('chat')}>
          <span className="recommended-badge">מומלץ</span>
          <span className="choice-card-icon">💬</span>
          <h3>שיחה עם נציג ליצירת פרופיל מדויק</h3>
          <p>שיחה קצרה של עד 4 שאלות שתעזור לנו להבין את העסק שלכם לעומק</p>
        </button>
      </div>
    </div>
  )
}

function UploadScreen({ onBack, onContinue }) {
  const [fileName, setFileName] = useState('')
  const [text, setText] = useState('')

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    setFileName(file ? file.name : '')
  }

  const handleContinue = () => {
    const businessSummary = text.trim()
      ? text.trim()
      : `פרופיל חולץ מתוך הקובץ שהועלה: ${fileName} (הדגמה בלבד — בהמשך תתבצע חילוץ נתונים אוטומטי מלא מתוך הקובץ).`
    onContinue(businessSummary)
  }

  return (
    <div className="profile-upload-screen">
      <div className="upload-block">
        <h3>1. העלאת קובץ Word</h3>
        <label className="file-upload-label">
          <input type="file" accept=".doc,.docx" onChange={handleFile} />
          {fileName ? `נבחר: ${fileName}` : 'בחרו קובץ Word מהמחשב'}
        </label>
      </div>

      <div className="upload-divider-text">או</div>

      <div className="upload-block">
        <h3>2. כתיבת תקציר חופשי</h3>
        <textarea
          className="profile-textarea"
          rows={8}
          placeholder="ספרו לנו על העסק, גודלו, תחומי ההתמחות והניסיון הרלוונטי..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <div className="profile-actions">
        <button type="button" className="secondary-btn" onClick={onBack}>חזרה</button>
        <button
          type="button"
          className="primary-btn"
          onClick={handleContinue}
          disabled={!text.trim() && !fileName}
        >
          המשך ליצירת הפרופיל
        </button>
      </div>
    </div>
  )
}

function ChatScreen({ onFinish }) {
  const [messages, setMessages] = useState([
    {
      sender: 'rep',
      text: 'שלום! אני כאן כדי לעזור לכם ליצור פרופיל עסקי מדויק. אשאל כמה שאלות קצרות (עד 4) ובסיומן ניצור עבורכם פרופיל מעודכן.',
    },
    { sender: 'rep', text: CHAT_QUESTIONS[0] },
  ])
  const [answers, setAnswers] = useState([])
  const [input, setInput] = useState('')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [waiting, setWaiting] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const finalize = (finalAnswers) => {
    setWaiting(true)
    setMessages((prev) => [
      ...prev,
      { sender: 'rep', text: 'תודה רבה! אני מכין עבורכם את הפרופיל המעודכן...' },
    ])
    setTimeout(() => onFinish(finalAnswers), 700)
  }

  const handleSend = () => {
    const value = input.trim()
    if (!value || waiting) return

    const newAnswers = [...answers, value]
    setAnswers(newAnswers)
    setMessages((prev) => [...prev, { sender: 'user', text: value }])
    setInput('')

    const nextIndex = questionIndex + 1
    if (nextIndex >= CHAT_QUESTIONS.length) {
      finalize(newAnswers)
      return
    }

    setWaiting(true)
    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: 'rep', text: CHAT_QUESTIONS[nextIndex] }])
      setQuestionIndex(nextIndex)
      setWaiting(false)
    }, 500)
  }

  return (
    <div className="chat-screen">
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.sender}`}>{m.text}</div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="chat-input-row">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="הקלידו את תשובתכם..."
          disabled={waiting}
        />
        <button type="button" className="primary-btn" onClick={handleSend} disabled={waiting || !input.trim()}>
          שליחה
        </button>
      </div>
      <button type="button" className="end-chat-btn" onClick={() => finalize(answers)}>
        סיום שיחה
      </button>
    </div>
  )
}

function SummaryScreen({ profile, onSave, onRestart }) {
  return (
    <div className="profile-summary-screen">
      <p className="poc-note">
        לתשומת לבכם: זוהי הדגמה (POC) בלבד. בהמשך תתבצע התממשקות מלאה למנוע AI שינתח את התשובות ויצור את הפרופיל אוטומטית מקצה לקצה.
      </p>
      <div className="card summary-card">
        <h3 className="card-title">הפרופיל שנוצר</h3>
        <div className="grid">
          <div><strong>שם העסק:</strong> {profile.companyName}</div>
          <div><strong>גודל:</strong> {profile.companySize}</div>
          <div><strong>ותק:</strong> {profile.yearsOfExperience} שנים</div>
          <div><strong>ציון טכני ממוצע:</strong> {profile.averageTechnicalScore}</div>
          <div><strong>מחסנית טכנולוגית:</strong> {profile.techStack.join(', ')}</div>
          <div><strong>תחומי התמחות:</strong> {profile.specialties.join(', ')}</div>
          <div><strong>ניסיון במובייל:</strong> {profile.hasMobileExperience ? 'כן' : 'לא'}</div>
        </div>
        {profile.businessSummary && (
          <div className="summary-business-text">
            <strong>תקציר העסק:</strong>
            <p>{profile.businessSummary}</p>
          </div>
        )}
      </div>
      <div className="profile-actions">
        <button type="button" className="secondary-btn" onClick={onRestart}>התחלה מחדש</button>
        <button type="button" className="primary-btn" onClick={onSave}>שמירת הפרופיל</button>
      </div>
    </div>
  )
}

function ProfileUpdateModal({ vendorProfile, onClose, onSave }) {
  const [step, setStep] = useState('choice')
  const [pendingProfile, setPendingProfile] = useState(null)

  const handleUploadContinue = (businessSummary) => {
    setPendingProfile({ ...vendorProfile, businessSummary })
    setStep('summary')
  }

  const handleChatFinish = (answers) => {
    setPendingProfile(buildProfileFromChat(vendorProfile, answers))
    setStep('summary')
  }

  return (
    <div className="fullscreen-modal">
      <header className="fullscreen-header">
        <h2>עדכון פרופיל ספק</h2>
        <button type="button" className="fullscreen-close" onClick={onClose} aria-label="סגור">✕</button>
      </header>
      <div className="fullscreen-body">
        {step === 'choice' && <ChoiceScreen onSelect={setStep} />}
        {step === 'upload' && (
          <UploadScreen onBack={() => setStep('choice')} onContinue={handleUploadContinue} />
        )}
        {step === 'chat' && <ChatScreen onFinish={handleChatFinish} />}
        {step === 'summary' && pendingProfile && (
          <SummaryScreen
            profile={pendingProfile}
            onSave={() => onSave(pendingProfile)}
            onRestart={() => setStep('choice')}
          />
        )}
      </div>
    </div>
  )
}

export default ProfileUpdateModal
