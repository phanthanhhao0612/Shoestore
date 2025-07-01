using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Shoestore.Models
{
    public class Inventory
    {
        [Key] // Khóa chính
        [ForeignKey("Product")] // Khóa ngoại tới Products (1-1)
        public string Id { get; set; }
        public string Name { get; set; }
        public int Stock { get; set; } = 0;
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

        public Product Product { get; set; }
    }
}
