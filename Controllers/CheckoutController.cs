using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shoestore.Data;
using Shoestore.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Shoestore.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CheckoutController : ControllerBase
    {
        private readonly ShoeStoreDbContext _context;

        public CheckoutController(ShoeStoreDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        [HttpPost]
        public async Task<ActionResult<Order>> CreateOrderFromCart([FromBody] CheckoutDto checkoutDto)
        {
            if (checkoutDto == null || string.IsNullOrEmpty(checkoutDto.CustomerId) ||
                string.IsNullOrEmpty(checkoutDto.Name) || string.IsNullOrEmpty(checkoutDto.Address) ||
                string.IsNullOrEmpty(checkoutDto.Phone))
            {
                return BadRequest("Thông tin khách hàng (CustomerId, Name, Address, Phone) là bắt buộc.");
            }

            var customer = await _context.Customers.FindAsync(checkoutDto.CustomerId);
            if (customer == null)
            {
                return BadRequest("Khách hàng không tồn tại.");
            }

            // Lấy các bản ghi CartOrderMapping chưa được xử lý (OrderId = null)
            var mappings = await _context.CartOrderMappings
                .Where(com => com.OrderId == null &&
                             _context.Carts.Any(c => c.Id == com.CartId && c.CustomerId == checkoutDto.CustomerId && !c.IsProcessed))
                .Include(com => com.Cart)
                .ThenInclude(c => c.Product)
                .ToListAsync();

            if (!mappings.Any())
            {
                return BadRequest("Giỏ hàng trống hoặc đã được xử lý hết.");
            }

            var cartItems = mappings.Select(m => m.Cart).ToList();

            if (cartItems.Any(c => c.Product == null))
            {
                return BadRequest("Một hoặc nhiều sản phẩm trong giỏ hàng không tồn tại.");
            }

            foreach (var item in cartItems)
            {
                if (item.Product.Inventory?.Stock < item.Quantity)
                {
                    return BadRequest($"Sản phẩm {item.ProductId} không đủ tồn kho. Chỉ còn {item.Product.Inventory.Stock} sản phẩm.");
                }
            }

            var order = new Order
            {
                OrderId = $"OD-{Guid.NewGuid().ToString().Substring(0, 8)}",
                CustomerId = checkoutDto.CustomerId,
                Name = checkoutDto.Name,
                Address = checkoutDto.Address,
                Phone = checkoutDto.Phone,
                PaymentMethod = Enum.Parse<PaymentMethod>(checkoutDto.PaymentMethod),
                Total = cartItems.Sum(item => item.Price * item.Quantity),
                Date = DateTime.UtcNow,
                Status = "Đang xử lý"
            };

            _context.Orders.Add(order);

            // Cập nhật OrderId cho các bản ghi CartOrderMapping hiện có
            foreach (var mapping in mappings)
            {
                mapping.OrderId = order.OrderId;
            }

            // Đánh dấu các mục trong giỏ hàng là đã xử lý
            foreach (var item in cartItems)
            {
                item.IsProcessed = true;
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"Lỗi khi lưu đơn hàng: {ex.InnerException?.Message ?? ex.Message}");
            }

            var responseItems = cartItems.Select(c => new CartItemDto
            {
                Id = c.Id,
                CustomerId = c.CustomerId,
                ProductId = c.ProductId,
                ProductName = c.Product.Name,
                Quantity = c.Quantity,
                Price = c.Price,
                Image = c.Image,
                IsProcessed = c.IsProcessed
            }).ToList();

            return CreatedAtAction(nameof(GetOrder), new { orderId = order.OrderId }, new
            {
                order.OrderId,
                order.CustomerId,
                order.Name,
                order.Address,
                order.Phone,
                order.PaymentMethod,
                order.Total,
                order.Date,
                order.Status,
                Items = responseItems
            });
        }

        [HttpGet("{orderId}")]
        public async Task<ActionResult> GetOrder(string orderId)
        {
            var order = await _context.Orders
                .Include(o => o.Customer)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (order == null)
            {
                return NotFound("Không tìm thấy đơn hàng.");
            }

            var cartItems = await _context.CartOrderMappings
                .Where(com => com.OrderId == orderId)
                .Include(com => com.Cart)
                .ThenInclude(c => c.Product)
                .Select(com => new CartItemDto
                {
                    Id = com.Cart.Id,
                    CustomerId = com.Cart.CustomerId,
                    ProductId = com.Cart.ProductId,
                    ProductName = com.Cart.Product != null ? com.Cart.Product.Name : "Sản phẩm không tồn tại",
                    Quantity = com.Cart.Quantity,
                    Price = com.Cart.Price,
                    Image = com.Cart.Image,
                    IsProcessed = com.Cart.IsProcessed
                })
                .ToListAsync();

            if (!cartItems.Any())
            {
                return BadRequest("Không tìm thấy chi tiết đơn hàng trong CartOrderMapping.");
            }

            return Ok(new
            {
                order.OrderId,
                order.CustomerId,
                order.Name,
                order.Address,
                order.Phone,
                order.PaymentMethod,
                order.Total,
                order.Date,
                order.Status,
                Items = cartItems
            });
        }
    }

    public class CheckoutDto
    {
        public string CustomerId { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
        public string Phone { get; set; }
        public string PaymentMethod { get; set; }
    }
}