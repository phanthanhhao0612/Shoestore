using Microsoft.AspNetCore.Mvc;
using Shoestore.Models;
using Shoestore.Data;
using Shoestore.Services;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System;

namespace Shoestore.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ShoeStoreDbContext _context;
        private readonly JwtService _jwtService;

        public AuthController(ShoeStoreDbContext context, JwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<Customer>> Register([FromBody] RegisterDto registerDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors)
                                          .Select(e => e.ErrorMessage);
                    return BadRequest(new { message = "Dữ liệu không hợp lệ.", errors });
                }

                if (await _context.Customers.AnyAsync(c => c.Email == registerDto.Email))
                {
                    return BadRequest(new { message = "Email đã được sử dụng.", field = "Email" });
                }

                var customer = new Customer
                {
                    Id = $"CUS-{Guid.NewGuid().ToString("N").Substring(0, 8)}", // Sinh Id tự động
                    Name = registerDto.Name,
                    Email = registerDto.Email,
                    Password = registerDto.Password, // Nên mã hóa trong thực tế
                    Phone = registerDto.Phone,
                    Role = false // Mặc định là customer (false)
                };

                _context.Customers.Add(customer);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(Login), new { email = customer.Email }, customer);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server khi đăng ký.", detail = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                if (loginDto == null)
                {
                    return BadRequest(new { message = "Dữ liệu đầu vào không hợp lệ." });
                }

                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors)
                                          .Select(e => e.ErrorMessage);
                    return BadRequest(new { message = "Dữ liệu không hợp lệ.", errors });
                }

                Console.WriteLine($"Đăng nhập với Email: {loginDto.Email}");
                var customer = await _context.Customers
                    .FirstOrDefaultAsync(c => c.Email == loginDto.Email && c.Password == loginDto.Password);

                if (customer == null)
                {
                    return Unauthorized(new { message = "Email hoặc mật khẩu không đúng." });
                }

                var token = _jwtService.GenerateToken(customer);
                return Ok(new
                {
                    token,
                    role = customer.Role ? "admin" : "customer",
                    customerId = customer.Id // Thêm customerId vào phản hồi
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi khi đăng nhập: {ex.Message}\nStackTrace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Lỗi server khi đăng nhập.", detail = ex.Message });
            }
        }
    }
}