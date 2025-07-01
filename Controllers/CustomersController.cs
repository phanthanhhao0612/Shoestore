using Microsoft.AspNetCore.Mvc;
using Shoestore.Models;
using Shoestore.Data;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Text.RegularExpressions;
using System;

namespace Shoestore.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomersController : ControllerBase
    {
        private readonly ShoeStoreDbContext _context;

        public CustomersController(ShoeStoreDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Customer>>> GetCustomers()
        {
            return Ok(await _context.Customers.ToListAsync());
        }

        [HttpPost]
        public async Task<ActionResult<Customer>> AddCustomer([FromBody] CustomerDto customerDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors)
                                          .Select(e => e.ErrorMessage);
                    return BadRequest(new { message = "Dữ liệu không hợp lệ.", errors });
                }

                if (string.IsNullOrEmpty(customerDto.Id))
                {
                    return BadRequest(new { message = "ID không được để trống.", field = "Id" });
                }

                if (await _context.Customers.AnyAsync(c => c.Email == customerDto.Email))
                {
                    return BadRequest(new { message = "Email đã được sử dụng.", field = "Email" });
                }

                if (!string.IsNullOrEmpty(customerDto.Phone) && !Regex.IsMatch(customerDto.Phone, @"^\d{10}$"))
                {
                    return BadRequest(new { message = "Số điện thoại phải là 10 chữ số.", field = "Phone" });
                }

                // Chuyển đổi role từ chuỗi thành bool
                bool role;
                if (customerDto.Role == "admin")
                {
                    role = true;
                }
                else if (customerDto.Role == "customer")
                {
                    role = false;
                }
                else
                {
                    return BadRequest(new { message = "Vai trò không hợp lệ. Phải là 'admin' hoặc 'customer'.", field = "Role" });
                }

                // Tạo đối tượng Customer từ DTO
                var customer = new Customer
                {
                    Id = customerDto.Id,
                    Name = customerDto.Name,
                    Email = customerDto.Email,
                    Password = customerDto.Password,
                    Phone = customerDto.Phone,
                    Role = role
                };

                _context.Customers.Add(customer);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, customer);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server khi thêm khách hàng.", detail = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Customer>> GetCustomer(string id)
        {
            var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Id == id);
            if (customer == null) return NotFound();
            return Ok(customer);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateCustomer(string id, [FromBody] CustomerDto customerDto)
        {
            try
            {
                var existingCustomer = await _context.Customers.FirstOrDefaultAsync(c => c.Id == id);
                if (existingCustomer == null) return NotFound();

                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors)
                                          .Select(e => e.ErrorMessage);
                    return BadRequest(new { message = "Dữ liệu không hợp lệ.", errors });
                }

                if (customerDto.Email != existingCustomer.Email && await _context.Customers.AnyAsync(c => c.Email == customerDto.Email))
                {
                    return BadRequest(new { message = "Email đã được sử dụng bởi khách hàng khác.", field = "Email" });
                }

                if (!string.IsNullOrEmpty(customerDto.Phone) && !Regex.IsMatch(customerDto.Phone, @"^\d{10}$"))
                {
                    return BadRequest(new { message = "Số điện thoại phải là 10 chữ số.", field = "Phone" });
                }

                // Chuyển đổi role từ chuỗi thành bool
                bool role;
                if (customerDto.Role == "admin")
                {
                    role = true;
                }
                else if (customerDto.Role == "customer")
                {
                    role = false;
                }
                else
                {
                    return BadRequest(new { message = "Vai trò không hợp lệ. Phải là 'admin' hoặc 'customer'.", field = "Role" });
                }

                // Cập nhật thông tin khách hàng
                existingCustomer.Name = customerDto.Name;
                existingCustomer.Email = customerDto.Email;
                existingCustomer.Password = customerDto.Password;
                existingCustomer.Phone = customerDto.Phone;
                existingCustomer.Role = role;

                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server khi cập nhật khách hàng.", detail = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteCustomer(string id)
        {
            try
            {
                var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Id == id);
                if (customer == null) return NotFound();

                _context.Customers.Remove(customer);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server khi xóa khách hàng.", detail = ex.Message });
            }
        }
    }
}