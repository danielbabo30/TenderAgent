using Microsoft.AspNetCore.Mvc;
using TenderAgent.Api.Models;
using TenderAgent.Api.Services;

namespace TenderAgent.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TenderAnalysisController : ControllerBase
{
    private readonly TenderAnalysisService _service;

    public TenderAnalysisController(TenderAnalysisService service)
    {
        _service = service;
    }

    [HttpPost]
    public ActionResult<TenderAnalysisResponse> Analyze([FromBody] TenderAnalysisRequest request)
    {
        var result = _service.Analyze(request);
        return Ok(result);
    }
}
