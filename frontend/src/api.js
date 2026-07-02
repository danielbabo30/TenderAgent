const API_URL = 'http://localhost:5018/api/tenderanalysis'

export async function analyzeTender(vendorProfile, tenderHistory, tender) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vendorProfile: {
        companyName: vendorProfile.companyName,
        companySize: vendorProfile.companySize,
        techStack: vendorProfile.techStack,
        specialties: vendorProfile.specialties,
        yearsOfExperience: vendorProfile.yearsOfExperience,
        hasMobileExperience: vendorProfile.hasMobileExperience,
        averageTechnicalScore: vendorProfile.averageTechnicalScore,
      },
      tenderHistory: tenderHistory.map((h) => ({
        tenderName: h.tenderName,
        outcome: h.outcome,
        committeeFeedback: h.committeeFeedback,
        priceGapPercent: h.priceGapPercent,
        technicalScore: h.technicalScore,
        wasDisqualified: h.wasDisqualified,
        requiredCapabilities: h.requiredCapabilities,
      })),
      newTender: {
        tenderName: tender.tenderName,
        description: tender.description,
        minimumThresholdScore: tender.minimumThresholdScore,
        requiredCapabilities: tender.requiredCapabilities,
        requiresMobileExperience: tender.requiresMobileExperience,
        estimatedBudget: tender.estimatedBudget,
      },
    }),
  })
  if (!response.ok) throw new Error(`שגיאת שרת: ${response.status}`)
  return response.json()
}
