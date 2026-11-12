using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using WorkspaceBooking.Data;
using WorkspaceBooking.Models;

namespace WorkspaceBooking.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _context.Users.ToListAsync();
        return Ok(users);
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return Ok(user);
    }

    [HttpPost("register")]
public async Task<IActionResult> Register([FromBody] AuthRequestDto dto)
{
    if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
    {
        return BadRequest("User with this email already exists.");
    }

    var isAdmin = dto.Email.Trim().ToLower().StartsWith("admin@");

    var user = new User
    {
        Username = string.IsNullOrWhiteSpace(dto.Username) ? dto.Email.Split('@')[0] : dto.Username,
        Email = dto.Email,
        PasswordHash = HashPassword(dto.Password),
        Role = isAdmin ? "Admin" : "User"
    };

    _context.Users.Add(user);
    await _context.SaveChangesAsync();

    return Ok(new { user.Id, user.Username, user.Email, user.Role });
}


    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] AuthRequestDto dto)
    {
        var hash = HashPassword(dto.Password);
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == dto.Email && u.PasswordHash == hash);

        if (user == null)
        {
            return Unauthorized("Invalid email or password.");
        }

        return Ok(new { user.Id, user.Username, user.Email, user.Role });
    }

    private static string HashPassword(string password)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }
}

public class AuthRequestDto
{
    public string? Username { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
