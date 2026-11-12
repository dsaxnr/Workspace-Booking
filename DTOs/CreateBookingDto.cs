namespace WorkspaceBooking.DTOs;

public class CreateBookingDto
{
    public int UserId { get; set; }
    public int WorkplaceId { get; set; }
    public DateOnly Date { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
}
