using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Shoestore.Models
{
    public class Product
    {
        [Key]
        public string Id { get; set; } = $"PRD-{Guid.NewGuid().ToString().Substring(0, 8)}";
        [Required]
        public string Name { get; set; }
        [Required]
        public int Price { get; set; } // Giá sau giảm
        public int OriginalPrice { get; set; } // Giá gốc
        public string? Size { get; set; }
        public string? Image { get; set; }
        public int Stock { get; set; } = 5; // Số lượng tồn kho, mặc định là 5
        public bool IsFlashSale { get; set; } = false; // Có phải Flash Sale không, mặc định là false
        public string? Description { get; set; }
        public ProductSpecs? Specs { get; set; }
        public float? Rating { get; set; }
        public int Sold { get; set; }
        public List<string>? DetailImages { get; set; }

        [ForeignKey("Category")]
        [Required(ErrorMessage = "Danh mục là bắt buộc")]
        public string CategoryId { get; set; }

        [JsonIgnore]
        public Category? Category { get; set; }
        [JsonIgnore]
        public Inventory? Inventory { get; set; }
        public ICollection<Cart> CartItems { get; set; } = new List<Cart>();
        public ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
    }

    public class ProductSpecs
    {
        public string? Material { get; set; }
        public string? Weight { get; set; }
        public string? Color { get; set; }
        public string? Highlights { get; set; }
    }
}