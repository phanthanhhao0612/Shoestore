using Microsoft.AspNetCore.Mvc;
using Shoestore.Data;
using Shoestore.Models;
using System.Collections.Generic;
using System.Linq;

namespace Shoestore.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly ShoeStoreDbContext _context;

        public CategoriesController(ShoeStoreDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public ActionResult<IEnumerable<Category>> GetCategories()
        {
            return Ok(_context.Categories.ToList());
        }

        [HttpPost]
        public async Task<ActionResult<Category>> AddCategory([FromBody] Category category)
        {
            if (string.IsNullOrEmpty(category.Id) || string.IsNullOrEmpty(category.Name))
            {
                return BadRequest("Id và Name là bắt buộc.");
            }

            _context.Categories.Add(category);
            await _context.SaveChangesAsync(); // Lưu vào database
            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
        }

        [HttpGet("{id}")]
        public ActionResult<Category> GetCategory(string id)
        {
            var category = _context.Categories.FirstOrDefault(c => c.Id == id);
            if (category == null) return NotFound();
            return Ok(category);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteCategory(string id)
        {
            var category = _context.Categories.FirstOrDefault(c => c.Id == id);
            if (category == null) return NotFound();

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync(); // Lưu thay đổi vào database
            return NoContent();
        }
    }
}