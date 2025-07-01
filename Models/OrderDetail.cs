using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Shoestore.Models
{
    public class OrderDetail
    {
        [Key] // Khóa chính
        public string Id { get; set; } = $"ODT-{Guid.NewGuid().ToString().Substring(0, 8)}";

        [ForeignKey("Order")] // Khóa ngoại tới Orders
        public string OrderId { get; set; }

        [ForeignKey("Product")] // Khóa ngoại tới Products
        public string ProductId { get; set; }
        public string Name { get; set; }
        public int Price { get; set; }
        public int Quantity { get; set; }
        public string? Image { get; set; }

        public Order Order { get; set; }
        public Product Product { get; set; }
    }
}
