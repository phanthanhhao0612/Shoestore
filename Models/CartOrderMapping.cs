using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Shoestore.Models
{
    public class CartOrderMapping
    {
        [Key]
        public string Id { get; set; } = $"COM-{Guid.NewGuid().ToString().Substring(0, 8)}";

        [ForeignKey("Cart")]
        public string CartId { get; set; }

        [ForeignKey("Order")]
        public string? OrderId { get; set; }

        public Cart Cart { get; set; }
        public Order? Order { get; set; }
    }
}
