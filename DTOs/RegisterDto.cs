using System.ComponentModel.DataAnnotations;

namespace Shoestore.Models
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "Tên là bắt buộc.")]
        [StringLength(100, MinimumLength = 1, ErrorMessage = "Tên phải từ 1 đến 100 ký tự.")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Email là bắt buộc.")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ.")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Mật khẩu là bắt buộc.")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Mật khẩu phải từ 6 đến 100 ký tự.")]
        public string Password { get; set; }

        [StringLength(10, MinimumLength = 10, ErrorMessage = "Số điện thoại phải là 10 chữ số.")]
        [RegularExpression(@"^\d{10}$", ErrorMessage = "Số điện thoại phải là 10 chữ số.")]
        public string? Phone { get; set; } // Không bắt buộc

        [Required(ErrorMessage = "Vai trò là bắt buộc.")]
        [RegularExpression("^(admin|customer)$", ErrorMessage = "Vai trò phải là 'admin' hoặc 'customer'.")]
        public string Role { get; set; } = "customer"; // Mặc định là "customer"
    }
}