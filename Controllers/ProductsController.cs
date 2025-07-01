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
    public class ProductsController : ControllerBase
    {
        private readonly ShoeStoreDbContext _context;

        public ProductsController(ShoeStoreDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult> GetProducts(int page = 1, int pageSize = 9)
        {
            var total = await _context.Products.CountAsync();
            var paginatedProducts = await _context.Products
                .AsNoTracking() // Ngăn lỗi với thực thể owned
                .Include(p => p.Category)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Price,
                    p.OriginalPrice,
                    p.Size,
                    p.Image,
                    p.Stock,
                    p.IsFlashSale,
                    Category = p.Category != null ? new { p.Category.Id, p.Category.Name } : null
                })
                .ToListAsync();

            return Ok(new { products = paginatedProducts, total });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetProduct(string id)
        {
            var product = await _context.Products
                .AsNoTracking()
                .Include(p => p.Category)
                .Where(p => p.Id == id)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Price,
                    p.OriginalPrice,
                    p.Size,
                    p.Image,
                    p.Stock,
                    p.IsFlashSale,
                    Category = p.Category != null ? new { p.Category.Id, p.Category.Name } : null
                })
                .FirstOrDefaultAsync();

            if (product == null) return NotFound();
            return Ok(product);
        }

        [HttpPost]
        public async Task<ActionResult<Product>> AddProduct([FromBody] Product product)
        {
            if (string.IsNullOrEmpty(product.Name) || product.Price <= 0 || string.IsNullOrEmpty(product.CategoryId))
            {
                return BadRequest("Name, Price, và CategoryId là bắt buộc.");
            }

            if (string.IsNullOrEmpty(product.Id))
            {
                product.Id = $"PRD-{Guid.NewGuid().ToString().Substring(0, 8)}";
            }

            product.Description = product.Description ?? null;
            product.Specs = product.Specs ?? null;
            product.Rating = product.Rating ?? null;
            product.Sold = product.Sold > 0 ? product.Sold : 0;
            product.DetailImages = product.DetailImages ?? null;
            product.Size = product.Size ?? null;
            product.Image = product.Image ?? null;
            product.Stock = product.Stock > 0 ? product.Stock : 5;
            product.IsFlashSale = product.IsFlashSale; // Giữ giá trị từ FE

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateProduct(string id, [FromBody] Product product)
        {
            var existingProduct = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
            if (existingProduct == null) return NotFound();

            if (string.IsNullOrEmpty(product.Name) || product.Price <= 0 || string.IsNullOrEmpty(product.CategoryId))
            {
                return BadRequest("Name, Price, và CategoryId là bắt buộc.");
            }

            existingProduct.Name = product.Name;
            existingProduct.Price = product.Price;
            existingProduct.OriginalPrice = product.OriginalPrice;
            existingProduct.CategoryId = product.CategoryId;
            existingProduct.Size = product.Size ?? existingProduct.Size;
            existingProduct.Image = product.Image ?? existingProduct.Image;
            existingProduct.Stock = product.Stock > 0 ? product.Stock : existingProduct.Stock;
            existingProduct.IsFlashSale = product.IsFlashSale;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteProduct(string id)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
            if (product == null) return NotFound();

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("reset")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult> ResetProducts()
        {
            try
            {
                var cartItems = await _context.Carts.ToListAsync();
                if (cartItems.Any()) _context.Carts.RemoveRange(cartItems);

                var orderDetails = await _context.OrderDetails.ToListAsync();
                if (orderDetails.Any()) _context.OrderDetails.RemoveRange(orderDetails);

                var products = await _context.Products.ToListAsync();
                if (products.Any())
                {
                    _context.Products.RemoveRange(products);
                    await _context.SaveChangesAsync();
                    return Ok(new { message = "Đã xóa toàn bộ sản phẩm.", count = products.Count });
                }

                return Ok(new { message = "Không có sản phẩm nào để xóa.", count = 0 });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi đặt lại dữ liệu.", detail = ex.Message });
            }
        }
    }
}