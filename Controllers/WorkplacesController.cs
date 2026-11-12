using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WorkspaceBooking.Data;
using WorkspaceBooking.Models;

namespace WorkspaceBooking.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WorkplacesController : ControllerBase
{
    private readonly AppDbContext _context;

    public WorkplacesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetWorkplaces()
    {
        var workplaces = await _context.Workplaces.ToListAsync();
        return Ok(workplaces);
    }

    [HttpPost]
    public async Task<IActionResult> CreateWorkplace([FromBody] Workplace workplace)
    {
        _context.Workplaces.Add(workplace);
        await _context.SaveChangesAsync();
        return Ok(workplace);
    }
    [HttpDelete("{id}")]
public async Task<IActionResult> DeleteWorkplace(int id)
{
    var workplace = await _context.Workplaces.FindAsync(id);
    if (workplace == null)
    {
        return NotFound("Workspace not found.");
    }

    _context.Workplaces.Remove(workplace);
    await _context.SaveChangesAsync();

    return NoContent();
}

}
