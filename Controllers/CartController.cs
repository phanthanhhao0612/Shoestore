using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shoestore.Data;
using Shoestore.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Shoestore.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CartController : ControllerBase
    {
        private readonly ShoeStoreDbContext _context;

        public CartController(ShoeStoreDbContext context)
        {
            _context = context;
        }

        [HttpGet("{customerId}")]
        public async Task<ActionResult> GetCartItems(string customerId)
        {
            var cartItems = await _context.Carts
                .Where(c => c.CustomerId == customerId)
                .Include(c => c.Product)
                .Select(c => new
                {
                    c.Id,
                    c.ProductId,
                    ProductName = c.Product.Name,
                    c.Quantity,
                    c.Price,
                    c.Image
                })
                .ToListAsync();

            if (!cartItems.Any())
            {
                return Ok(new { message = "Giỏ hàng trống.", items = cartItems });
            }

            return Ok(cartItems);
        }

        [HttpPost]
        public async Task<ActionResult<Cart>> AddToCart([FromBody] CartDto cartDto)
        {
            if (string.IsNullOrEmpty(cartDto.CustomerId) || string.IsNullOrEmpty(cartDto.ProductId))
            {
                return BadRequest("CustomerId và ProductId là bắt buộc.");
            }

            if (cartDto.Quantity <= 0)
            {
                return BadRequest("Số lượng phải lớn hơn 0.");
            }

            var product = await _context.Products.FindAsync(cartDto.ProductId);
            if (product == null)
            {
                return NotFound("Sản phẩm không tồn tại.");
            }

            var existingItem = await _context.Carts
                .FirstOrDefaultAsync(c => c.CustomerId == cartDto.CustomerId && c.ProductId == cartDto.ProductId);

            Cart cartItem;
            string cartOrderMappingId = null;

            if (existingItem != null)
            {
                existingItem.Quantity += cartDto.Quantity;
                existingItem.Price = product.Price;
                cartItem = existingItem;

                // Tìm bản ghi trung gian hiện có
                var existingMapping = await _context.CartOrderMappings
                    .FirstOrDefaultAsync(com => com.CartId == cartItem.Id);
                if (existingMapping != null)
                {
                    cartOrderMappingId = existingMapping.Id;
                }
            }
            else
            {
                cartItem = new Cart
                {
                    Id = $"CRT-{Guid.NewGuid().ToString().Substring(0, 8)}",
                    CustomerId = cartDto.CustomerId,
                    ProductId = cartDto.ProductId,
                    Quantity = cartDto.Quantity,
                    Price = product.Price,
                    Image = product.Image // Giữ nguyên lấy từ Product
                };
                _context.Carts.Add(cartItem);

                // Tự sinh ID trung gian và thêm bản ghi CartOrderMapping
                cartOrderMappingId = $"COM-{Guid.NewGuid().ToString().Substring(0, 8)}";
                var cartOrderMapping = new CartOrderMapping
                {
                    Id = cartOrderMappingId,
                    CartId = cartItem.Id,
                    OrderId = null // Chưa có đơn hàng
                };
                _context.CartOrderMappings.Add(cartOrderMapping);
            }

            await _context.SaveChangesAsync();

            // Trả về thông tin cartItem kèm theo ID trung gian
            return CreatedAtAction(nameof(GetCartItems), new { customerId = cartItem.CustomerId }, new
            {
                cartItem.Id,
                cartItem.CustomerId,
                cartItem.ProductId,
                cartItem.Quantity,
                cartItem.Price,
                cartItem.Image,
                CartOrderMappingId = cartOrderMappingId
            });
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateCartItem(string id, [FromBody] int quantity)
        {
            var cartItem = await _context.Carts.FindAsync(id);
            if (cartItem == null)
            {
                return NotFound("Không tìm thấy mục trong giỏ hàng.");
            }

            if (quantity <= 0)
            {
                return BadRequest("Số lượng phải lớn hơn 0.");
            }

            cartItem.Quantity = quantity;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> RemoveFromCart(string id)
        {
            var cartItem = await _context.Carts.FindAsync(id);
            if (cartItem == null)
            {
                return NotFound("Không tìm thấy mục trong giỏ hàng.");
            }

            // Xóa bản ghi trung gian liên quan
            var mapping = await _context.CartOrderMappings
                .FirstOrDefaultAsync(com => com.CartId == id);
            if (mapping != null)
            {
                _context.CartOrderMappings.Remove(mapping);
            }

            _context.Carts.Remove(cartItem);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("clear/{customerId}")]
        public async Task<ActionResult> ClearCart(string customerId)
        {
            var cartItems = await _context.Carts
                .Where(c => c.CustomerId == customerId)
                .ToListAsync();

            if (!cartItems.Any())
            {
                return Ok(new { message = "Giỏ hàng đã trống.", count = 0 });
            }

            // Xóa tất cả bản ghi trung gian liên quan
            var mappings = await _context.CartOrderMappings
                .Where(com => cartItems.Select(c => c.Id).Contains(com.CartId))
                .ToListAsync();
            _context.CartOrderMappings.RemoveRange(mappings);

            _context.Carts.RemoveRange(cartItems);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã xóa toàn bộ giỏ hàng.", count = cartItems.Count });
        }
    }

    public class CartDto
    {
        public string CustomerId { get; set; }
        public string ProductId { get; set; }
        public int Quantity { get; set; }
    }
}