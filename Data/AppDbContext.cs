using Microsoft.EntityFrameworkCore;
using WorkspaceBooking.Models;

namespace WorkspaceBooking.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Workplace> Workplaces => Set<Workplace>();
    public DbSet<Booking> Bookings => Set<Booking>();
}
