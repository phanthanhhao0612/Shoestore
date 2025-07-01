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
    public class InventoryController : ControllerBase
    {
        private readonly ShoeStoreDbContext _context;

        public InventoryController(ShoeStoreDbContext context)
        {
            _context = context;
        }

        // GET: api/inventory?page=1&pageSize=1000
        [HttpGet]
        public async Task<ActionResult> GetInventories(int page = 1, int pageSize = 1000)
        {
            if (page < 1 || pageSize < 1)
                return BadRequest("Page và pageSize phải lớn hơn 0.");

            var total = await _context.Inventories.CountAsync();
            var inventories = await _context.Inventories
                .AsNoTracking()
                .Include(i => i.Product)
                .OrderBy(i => i.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(i => new
                {
                    i.Id,
                    i.Name,
                    i.Stock,
                    i.LastUpdated,
                    Product = i.Product != null ? new
                    {
                        i.Product.Id,
                        i.Product.Name,
                        i.Product.Price,
                        i.Product.Stock
                    } : null
                })
                .ToListAsync();

            return Ok(new { inventories, total, page, pageSize });
        }

        // GET: api/inventory/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult> GetInventory(string id)
        {
            if (string.IsNullOrEmpty(id))
                return BadRequest("Id là bắt buộc.");

            var inventory = await _context.Inventories
                .AsNoTracking()
                .Include(i => i.Product)
                .Where(i => i.Id == id)
                .Select(i => new
                {
                    i.Id,
                    i.Name,
                    i.Stock,
                    i.LastUpdated,
                    Product = i.Product != null ? new
                    {
                        i.Product.Id,
                        i.Product.Name,
                        i.Product.Price,
                        i.Product.Stock
                    } : null
                })
                .FirstOrDefaultAsync();

            if (inventory == null)
                return NotFound($"Không tìm thấy inventory với Id: {id}");

            return Ok(inventory);
        }

        // GET: api/inventory/low-stock?threshold=5
        [HttpGet("low-stock")]
        public async Task<ActionResult> GetLowStockInventory(int threshold = 5)
        {
            if (threshold < 0)
                return BadRequest("Ngưỡng tồn kho không thể âm.");

            var lowStockItems = await _context.Inventories
                .AsNoTracking()
                .Include(i => i.Product)
                .Where(i => i.Stock <= threshold)
                .OrderBy(i => i.Stock)
                .Select(i => new
                {
                    i.Id,
                    i.Name,
                    i.Stock,
                    i.LastUpdated,
                    ProductName = i.Product != null ? i.Product.Name : null
                })
                .ToListAsync();

            return Ok(new { items = lowStockItems, threshold });
        }

        // POST: api/inventory
        [HttpPost]
        public async Task<ActionResult> CreateInventory([FromBody] Inventory inventory)
        {
            if (inventory == null || string.IsNullOrEmpty(inventory.Id) || string.IsNullOrEmpty(inventory.Name))
                return BadRequest("Id và Name là bắt buộc.");

            if (inventory.Stock < 0)
                return BadRequest("Số lượng tồn kho không thể âm.");

            var existingInventory = await _context.Inventories.AnyAsync(i => i.Id == inventory.Id);
            if (existingInventory)
                return Conflict($"Inventory với Id {inventory.Id} đã tồn tại.");

            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == inventory.Id);
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (product != null)
                {
                    // Đồng bộ với Product nếu đã tồn tại
                    if (product.Name != inventory.Name)
                        return BadRequest("Tên inventory phải khớp với tên sản phẩm hiện có.");
                    product.Stock = inventory.Stock;
                }
                else
                {
                    // Tạo mới Product nếu chưa có
                    product = new Product
                    {
                        Id = inventory.Id,
                        Name = inventory.Name,
                        Price = 0, // Giá mặc định
                        CategoryId = "DEFAULT", // Cần thay đổi theo logic thực tế
                        Stock = inventory.Stock
                    };
                    _context.Products.Add(product);
                }

                inventory.LastUpdated = DateTime.UtcNow;
                _context.Inventories.Add(inventory);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return CreatedAtAction(nameof(GetInventory), new { id = inventory.Id }, inventory);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Lỗi khi tạo inventory: {ex.Message}");
            }
        }

        // PUT: api/inventory/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateInventory(string id, [FromBody] Inventory inventoryUpdate)
        {
            if (string.IsNullOrEmpty(id) || inventoryUpdate == null)
                return BadRequest("Id và dữ liệu cập nhật là bắt buộc.");

            if (id != inventoryUpdate.Id)
                return BadRequest("Id trong URL không khớp với Id trong body.");

            if (inventoryUpdate.Stock < 0)
                return BadRequest("Số lượng tồn kho không thể âm.");

            var inventory = await _context.Inventories
                .Include(i => i.Product)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (inventory == null)
                return NotFound($"Không tìm thấy inventory với Id: {id}");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Cập nhật Inventory
                inventory.Name = inventoryUpdate.Name ?? inventory.Name;
                inventory.Stock = inventoryUpdate.Stock;
                inventory.LastUpdated = DateTime.UtcNow;

                // Đồng bộ với Product
                if (inventory.Product != null)
                {
                    if (inventory.Product.Name != inventory.Name)
                        inventory.Product.Name = inventory.Name;
                    inventory.Product.Stock = inventory.Stock;
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Lỗi khi cập nhật inventory: {ex.Message}");
            }
        }

        // DELETE: api/inventory/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteInventory(string id)
        {
            if (string.IsNullOrEmpty(id))
                return BadRequest("Id là bắt buộc.");

            var inventory = await _context.Inventories.FirstOrDefaultAsync(i => i.Id == id);
            if (inventory == null)
                return NotFound($"Không tìm thấy inventory với Id: {id}");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _context.Inventories.Remove(inventory);
                // Không xóa Product để tránh mất dữ liệu liên quan (có thể điều chỉnh logic tùy yêu cầu)
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Lỗi khi xóa inventory: {ex.Message}");
            }
        }

        // PATCH: api/inventory/{id}/stock
        [HttpPatch("{id}/stock")]
        public async Task<ActionResult> UpdateStock(string id, [FromBody] int stock)
        {
            if (string.IsNullOrEmpty(id))
                return BadRequest("Id là bắt buộc.");

            if (stock < 0)
                return BadRequest("Số lượng tồn kho không thể âm.");

            var inventory = await _context.Inventories
                .Include(i => i.Product)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (inventory == null)
                return NotFound($"Không tìm thấy inventory với Id: {id}");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                inventory.Stock = stock;
                inventory.LastUpdated = DateTime.UtcNow;

                if (inventory.Product != null)
                    inventory.Product.Stock = stock;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Lỗi khi cập nhật stock: {ex.Message}");
            }
        }
    }
}