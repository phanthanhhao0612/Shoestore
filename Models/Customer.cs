using System.ComponentModel.DataAnnotations;

namespace Shoestore.Models
{
    public class Customer
    {
        [Key] // Khóa chính
        public string Id { get; set; } 
        public string Name { get; set; }
        [EmailAddress]
        public string Email { get; set; }
        public string Password { get; set; }
        public string? Phone { get; set; }
        public bool Role { get; set; } = false; // true = admin, false = customer

        public ICollection<Cart> CartItems { get; set; } = new List<Cart>();
        
    }
}
