namespace TenderAgent.Api.Models;

public class VendorProfile
{
    public string CompanyName { get; set; } = string.Empty;
    public string CompanySize { get; set; } = string.Empty;
    public List<string> TechStack { get; set; } = new();
    public List<string> Specialties { get; set; } = new();
    public int YearsOfExperience { get; set; }
    public bool HasMobileExperience { get; set; }
    public double AverageTechnicalScore { get; set; }
}

public class TenderHistoryItem
{
    public string TenderName { get; set; } = string.Empty;
    public string Outcome { get; set; } = string.Empty; // "Won" or "Lost"
    public string CommitteeFeedback { get; set; } = string.Empty;
    public double? PriceGapPercent { get; set; }
    public double? TechnicalScore { get; set; }
    public bool WasDisqualified { get; set; }
    public List<string> RequiredCapabilities { get; set; } = new();
}

public class NewTender
{
    public string TenderName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public double MinimumThresholdScore { get; set; }
    public List<string> RequiredCapabilities { get; set; } = new();
    public bool RequiresMobileExperience { get; set; }
    public double? EstimatedBudget { get; set; }
}

public class TenderAnalysisRequest
{
    public VendorProfile VendorProfile { get; set; } = new();
    public List<TenderHistoryItem> TenderHistory { get; set; } = new();
    public NewTender NewTender { get; set; } = new();
}

public class TenderAnalysisResponse
{
    public int SuccessProbability { get; set; }
    public string SuccessProbabilityExplanation { get; set; } = string.Empty;
    public string PastReasonsAnalysis { get; set; } = string.Empty;
    public List<string> Recommendations { get; set; } = new();
}
