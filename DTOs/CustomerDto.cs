namespace Shoestore.Models
{
    public class CustomerDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string? Phone { get; set; }
        public string Role { get; set; } // Nhận chuỗi "admin" hoặc "customer"
    }
}