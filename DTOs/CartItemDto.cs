namespace Shoestore.Models
{
    public class CartItemDto
    {
        public string Id { get; set; }
        public string CustomerId { get; set; }
        public string ProductId { get; set; }
        public string ProductName { get; set; }
        public int Quantity { get; set; }
        public int Price { get; set; }
        public string Image { get; set; }
        public bool IsProcessed { get; set; }
    }
}