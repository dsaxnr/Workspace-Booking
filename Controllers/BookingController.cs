using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WorkspaceBooking.Data;
using WorkspaceBooking.DTOs;
using WorkspaceBooking.Models;

namespace WorkspaceBooking.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly AppDbContext _context;

    public BookingsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
public async Task<ActionResult<IEnumerable<Booking>>> GetBookings()
{
    return await _context.Bookings
        .Include(b => b.User)
        .Include(b => b.Workplace)
        .OrderBy(b => b.Date)
        .ThenBy(b => b.StartTime)
        .ToListAsync();
}


        [HttpPost]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto dto)
    {
        // Проверяем, существует ли указанное рабочее место
        var workplace = await _context.Workplaces.FindAsync(dto.WorkplaceId);
        if (workplace == null)
        {
            return BadRequest("Workplace not found.");
        }

        // Проверяем, не занято ли рабочее место на это время в этот же день
        var existingBooking = await _context.Bookings
            .FirstOrDefaultAsync(b => b.WorkplaceId == dto.WorkplaceId &&
                                      b.Date == dto.Date &&
                                      b.StartTime < dto.EndTime &&
                                      dto.StartTime < b.EndTime);

        if (existingBooking != null)
        {
            return BadRequest("This workplace is already booked for the selected time.");
        }

        var booking = new Booking
        {
            UserId = dto.UserId,
            WorkplaceId = dto.WorkplaceId,
            Date = dto.Date,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            Status = "Confirmed"
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        return Ok(booking);
    }
    [HttpDelete("{id}")]
public async Task<IActionResult> DeleteBooking(int id)
{
    var booking = await _context.Bookings.FindAsync(id);
    if (booking == null)
    {
        return NotFound("Booking not found.");
    }

    _context.Bookings.Remove(booking);
    await _context.SaveChangesAsync();

    return NoContent();
}


}
