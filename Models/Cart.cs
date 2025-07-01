using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Shoestore.Models
{
    public class Cart
    {
        [Key] // Khóa chính
        public string Id { get; set; } = $"CRT-{Guid.NewGuid().ToString().Substring(0, 8)}";

        [ForeignKey("Customer")] // Khóa ngoại tới Customers
        public string CustomerId { get; set; }

        [ForeignKey("Product")] // Khóa ngoại tới Products
        public string ProductId { get; set; }
        public int Quantity { get; set; } = 1;
        public int Price { get; set; }
        public string? Image { get; set; }
        public bool IsProcessed { get; set; } = false;

        public Customer Customer { get; set; }
        public Product Product { get; set; }
    }
}
    