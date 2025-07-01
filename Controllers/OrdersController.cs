using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shoestore.Data;
using Shoestore.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shoestore.Controllers
{
    [Route("api/orders")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly ShoeStoreDbContext _context; // Thay ApplicationDbContext bằng DbContext của bạn

        public OrdersController(ShoeStoreDbContext context)
        {
            _context = context;
        }

        // GET: api/orders
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.Customer) // Bao gồm thông tin khách hàng nếu cần
                .ToListAsync();
            return Ok(orders);
        }

        // PUT: api/orders/{orderId}/status
        [HttpPut("{orderId}/status")]
        public async Task<IActionResult> UpdateOrderStatus(string orderId, [FromBody] string status)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
            {
                return NotFound(new { message = "Không tìm thấy đơn hàng." });
            }

            // Kiểm tra giá trị trạng thái hợp lệ
            var validStatuses = new[] { "Đang xử lý", "Đã giao", "Đã hủy" };
            if (!validStatuses.Contains(status))
            {
                return BadRequest(new { message = "Trạng thái không hợp lệ." });
            }

            order.Status = status;
            _context.Entry(order).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { message = "Cập nhật trạng thái thành công." });
            }
            catch (DbUpdateException)
            {
                return StatusCode(500, new { message = "Lỗi khi cập nhật trạng thái." });
            }
        }

        // DELETE: api/orders/{orderId}
        [HttpDelete("{orderId}")]
        public async Task<IActionResult> DeleteOrder(string orderId)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
            {
                return NotFound(new { message = "Không tìm thấy đơn hàng." });
            }

            _context.Orders.Remove(order);
            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { message = "Xóa đơn hàng thành công." });
            }
            catch (DbUpdateException)
            {
                return StatusCode(500, new { message = "Lỗi khi xóa đơn hàng." });
            }
        }
    }
}