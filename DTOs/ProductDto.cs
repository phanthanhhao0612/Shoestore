namespace Shoestore.Models
{
    public class ProductDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public int Price { get; set; }
        public int OriginalPrice { get; set; }
        public string? Size { get; set; }
        public string? Image { get; set; }
        public int Stock { get; set; }
        public bool IsFlashSale { get; set; }
        public string CategoryId { get; set; }
        public string CategoryName { get; set; } // Tên danh mục
        public string? Description { get; set; }
        public ProductSpecs? Specs { get; set; }
        public float? Rating { get; set; }
        public int Sold { get; set; }
        public List<string>? DetailImages { get; set; }
    }
}