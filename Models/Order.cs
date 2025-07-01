using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Shoestore.Models
{
    public class Order
    {
        [Key] // Khóa chính
        public string OrderId { get; set; } = $"OD-{Guid.NewGuid().ToString().Substring(0, 8)}";

        [ForeignKey("Customer")] // Khóa ngoại tới Customers
        public string CustomerId { get; set; }
        public string Name { get; set; }
        public string? Address { get; set; }
        public string? Phone { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public int Total { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public string Status { get; set; } = "Đang xử lý";

        public Customer Customer { get; set; }
        public ICollection<OrderDetail> OrderDetails { get; set; }
    }
    public enum PaymentMethod
    {
        ThanhToanKhiNhanHang = 0, // Thanh toán khi nhận hàng (COD)
        ChuyenKhoanMoMo = 1,      // Chuyển khoản MoMo
        ChuyenKhoanNganHang = 2   // Chuyển khoản ngân hàng
    }
}
