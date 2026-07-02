using TenderAgent.Api.Models;

namespace TenderAgent.Api.Services;

public class TenderAnalysisService
{
    public TenderAnalysisResponse Analyze(TenderAnalysisRequest request)
    {
        var vendor = request.VendorProfile;
        var history = request.TenderHistory ?? new List<TenderHistoryItem>();
        var tender = request.NewTender;

        var vendorCapabilities = vendor.TechStack
            .Concat(vendor.Specialties)
            .Select(Normalize)
            .ToHashSet();

        var requiredCapabilities = tender.RequiredCapabilities.Select(Normalize).ToList();
        var matchedCapabilities = requiredCapabilities.Where(vendorCapabilities.Contains).ToList();
        var missingCapabilities = requiredCapabilities.Except(matchedCapabilities).ToList();

        double capabilityScore = requiredCapabilities.Count == 0
            ? 100
            : 100.0 * matchedCapabilities.Count / requiredCapabilities.Count;

        double technicalScore = vendor.AverageTechnicalScore <= 0 || tender.MinimumThresholdScore <= 0
            ? 70
            : Math.Clamp(100.0 * vendor.AverageTechnicalScore / tender.MinimumThresholdScore, 0, 130);
        technicalScore = Math.Min(technicalScore, 100);

        var pricedLosses = history.Where(h => h.Outcome == "Lost" && h.PriceGapPercent.HasValue).ToList();
        double avgPriceGap = pricedLosses.Count > 0 ? pricedLosses.Average(h => h.PriceGapPercent!.Value) : 0;
        double priceScore = Math.Clamp(100 - avgPriceGap * 4, 0, 100);

        bool mobilePenalty = tender.RequiresMobileExperience && !vendor.HasMobileExperience;
        var disqualifications = history.Where(h => h.WasDisqualified).ToList();
        double disqualificationPenalty = disqualifications.Count > 0 ? Math.Min(disqualifications.Count * 10, 30) : 0;
        double mobilePenaltyValue = mobilePenalty ? 25 : 0;
        double reliabilityScore = Math.Clamp(100 - disqualificationPenalty - mobilePenaltyValue, 0, 100);

        double weightedScore =
            capabilityScore * 0.40 +
            technicalScore * 0.25 +
            priceScore * 0.20 +
            reliabilityScore * 0.15;

        int successProbability = (int)Math.Round(Math.Clamp(weightedScore, 3, 97));

        var explanation =
            $"התאמת יכולות נדרשות: {Math.Round(capabilityScore)}% (משקל 40%) | " +
            $"עמידה בסף הטכני: {Math.Round(technicalScore)}% (משקל 25%) | " +
            $"היסטוריית תמחור מול הצעות שהפסדתי: {Math.Round(priceScore)}% (משקל 20%) | " +
            $"אמינות והיעדר פסילות: {Math.Round(reliabilityScore)}% (משקל 15%).";

        var pastReasonsAnalysis = BuildPastReasonsAnalysis(history, missingCapabilities, mobilePenalty, avgPriceGap, pricedLosses.Count);

        var recommendations = BuildRecommendations(missingCapabilities, mobilePenalty, avgPriceGap, pricedLosses.Count, disqualifications, capabilityScore, technicalScore);

        return new TenderAnalysisResponse
        {
            SuccessProbability = successProbability,
            SuccessProbabilityExplanation = explanation,
            PastReasonsAnalysis = pastReasonsAnalysis,
            Recommendations = recommendations
        };
    }

    private static string Normalize(string s) => s.Trim().ToLowerInvariant();

    private static string BuildPastReasonsAnalysis(
        List<TenderHistoryItem> history,
        List<string> missingCapabilities,
        bool mobilePenalty,
        double avgPriceGap,
        int pricedLossesCount)
    {
        var lostTenders = history.Where(h => h.Outcome == "Lost").ToList();

        if (lostTenders.Count == 0)
        {
            return "לא נמצאה היסטוריה של הפסדים בפלטפורמה — הניתוח מבוסס בעיקר על התאמת הפרופיל למכרז הנוכחי, ללא דפוסי כשל קודמים לניכוי.";
        }

        var points = new List<string>();

        if (pricedLossesCount > 0 && avgPriceGap > 0)
        {
            points.Add(
                $"ב-{pricedLossesCount} מכרזים קודמים הפסדת בעיקר על רקע תמחור, בפער ממוצע של כ-{Math.Round(avgPriceGap)}% מעל ההצעה הזוכה. " +
                "אם מבנה העלויות במכרז הנוכחי דומה, קיים סיכון ממשי שהתמחור יהיה שוב גורם מכריע.");
        }

        var disqualified = lostTenders.Where(h => h.WasDisqualified).ToList();
        if (disqualified.Count > 0)
        {
            var names = string.Join(", ", disqualified.Select(h => h.TenderName));
            points.Add($"נפסלת בעבר במכרזים הבאים: {names}. חשוב לוודא שכל דרישות הסף המנהליות במכרז הנוכחי מולאות במלואן לפני ההגשה.");
        }

        if (mobilePenalty)
        {
            var mobileRelated = lostTenders.Where(h =>
                h.CommitteeFeedback.Contains("מובייל", StringComparison.OrdinalIgnoreCase) ||
                h.CommitteeFeedback.Contains("mobile", StringComparison.OrdinalIgnoreCase)).ToList();
            if (mobileRelated.Count > 0)
            {
                points.Add(
                    $"בעבר נפסלת/הופחת ניקוד במכרז \"{mobileRelated.First().TenderName}\" עקב היעדר ניסיון מוכח בפיתוח מובייל. " +
                    "המכרז הנוכחי דורש ניסיון מובייל, ומדובר באותה נקודת תורפה בדיוק.");
            }
            else
            {
                points.Add("המכרז הנוכחי דורש ניסיון בפיתוח מובייל שאינו מופיע כיום בפרופיל העסקי שלך — פער יכולות שטרם בא לידי ביטוי בעבר אך עלול לפגוע בציון הטכני כעת.");
            }
        }

        if (missingCapabilities.Count > 0)
        {
            points.Add($"קיים פער יכולות בין הדרישות הטכניות של המכרז לבין הפרופיל הנוכחי בתחומים הבאים: {string.Join(", ", missingCapabilities)}.");
        }

        var lowScoreLosses = lostTenders.Where(h => h.TechnicalScore.HasValue && h.TechnicalScore < 70).ToList();
        if (lowScoreLosses.Count > 0)
        {
            points.Add(
                $"ב-{lowScoreLosses.Count} מכרזים קודמים הציון הטכני שהתקבל היה נמוך מ-70, מה שמעיד על צורך לחזק את איכות המענה הטכני במסמכי ההגשה עצמם, לא רק את ההתאמה המהותית.");
        }

        if (points.Count == 0)
        {
            points.Add("לא זוהו דפוסי כשל חוזרים ומובהקים בהיסטוריה שרלוונטיים ישירות למכרז הנוכחי, אך מומלץ לבחון את המשוב המלא מכל מכרז שהופסד.");
        }

        return string.Join(" ", points);
    }

    private static List<string> BuildRecommendations(
        List<string> missingCapabilities,
        bool mobilePenalty,
        double avgPriceGap,
        int pricedLossesCount,
        List<TenderHistoryItem> disqualifications,
        double capabilityScore,
        double technicalScore)
    {
        var recommendations = new List<string>();

        if (pricedLossesCount > 0 && avgPriceGap > 5)
        {
            recommendations.Add(
                $"בחנו הפחתה מבוקרת של כ-{Math.Round(Math.Min(avgPriceGap, 15))}% בהצעת המחיר ביחס לתמחור הרגיל שלכם, בהתבסס על דפוס ההפסדים התדיר על רקע מחיר — תוך שמירה על רווחיות מינימלית.");
        }

        if (mobilePenalty)
        {
            recommendations.Add("סגרו את פער היכולות בפיתוח מובייל לפני ההגשה — בין אם באמצעות שיתוף פעולה עם קבלן משנה מוסמך, גיוס מפתח רלוונטי, או הצגת פרויקט רפרנס קודם שממחיש יכולת זו.");
        }

        if (missingCapabilities.Count > 0)
        {
            recommendations.Add($"השלימו תיעוד והוכחות יכולת עבור הדרישות הבאות שאינן מכוסות כיום בפרופיל: {string.Join(", ", missingCapabilities)} — כולל אסמכתאות פרויקטים רלוונטיים אם קיימות.");
        }

        if (disqualifications.Count > 0)
        {
            recommendations.Add("הריצו בדיקת תאימות מלאה מול תנאי הסף המנהליים של המכרז (ערבויות, אישורים, ותק) לפני ההגשה, לאור פסילות מנהליות שחזרו על עצמן בעבר.");
        }

        if (technicalScore < 70)
        {
            recommendations.Add("חזקו את איכות המענה הטכני במסמכי ההצעה עצמם — דוגמאות קונקרטיות, מתודולוגיית עבודה מפורטת ותיאור תהליכי בקרת איכות — כדי לשפר את הציון הטכני הצפוי.");
        }

        if (recommendations.Count == 0)
        {
            recommendations.Add("הפרופיל העסקי שלכם מתאים היטב לדרישות המכרז. מומלץ להתמקד בליטוש ההצעה הכתובה ובהדגשת יתרונות תחרותיים ייחודיים.");
        }

        recommendations.Add("עקבו אחרי מדד ההתאמה בכל מכרז חדש בפלטפורמה כדי לזהות מוקדם פערים חוזרים ולתעדף את פיתוח העסק בהתאם.");

        return recommendations.Take(4).ToList();
    }
}
