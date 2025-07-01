using System.ComponentModel.DataAnnotations;

namespace Shoestore.Models
{
    public class Category
    {
        [Key]
        public string Id { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }

        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
