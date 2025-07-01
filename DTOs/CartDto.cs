namespace Shoestore.Models
{
    public class CartDto
    {
        public string CustomerId { get; set; }
        public string ProductId { get; set; }
        public int Quantity { get; set; }
        public int Price { get; set; }
        
    }
}