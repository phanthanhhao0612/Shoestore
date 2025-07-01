using Microsoft.AspNetCore.Mvc;
using Shoestore.Models;
using Shoestore.Data;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace Shoestore.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductDetailsController : ControllerBase
    {
        private readonly ShoeStoreDbContext _context;

        public ProductDetailsController(ShoeStoreDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProductDetails()
        {
            return Ok(await _context.Products
                .Include(p => p.Inventory)
                .ToListAsync());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProductDetail(string id)
        {
            var product = await _context.Products
                .Include(p => p.Inventory)
                .FirstOrDefaultAsync(p => p.Id == id);
            if (product == null) return NotFound();
            return Ok(product);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateProductDetail(string id, [FromBody] Product productDetail)
        {
            var existingProduct = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
            if (existingProduct == null) return NotFound();

            // Cập nhật các thuộc tính chi tiết
            existingProduct.Description = productDetail.Description;
            existingProduct.Specs = productDetail.Specs;
            existingProduct.Rating = productDetail.Rating;
            existingProduct.Sold = productDetail.Sold;
            existingProduct.DetailImages = productDetail.DetailImages;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPut("{id}/stock")]
        public async Task<ActionResult> UpdateStock(string id, [FromBody] int stock)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
            if (product == null) return NotFound();

            var inventoryItem = await _context.Inventories.FirstOrDefaultAsync(i => i.Id == id);
            if (inventoryItem != null)
            {
                inventoryItem.Stock = stock;
                inventoryItem.LastUpdated = DateTime.UtcNow;
            }
            else
            {
                var newInventory = new Inventory
                {
                    Id = id, // Quan hệ 1-1 với Product.Id
                    Name = product.Name,
                    Stock = stock,
                    LastUpdated = DateTime.UtcNow
                };
                _context.Inventories.Add(newInventory);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}