// CAPTCHA logic
let captchaText = "";

function generateCaptcha() {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    captchaText = "";
    for (let i = 0; i < 6; i++) {
        captchaText += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const canvas = document.getElementById("captcha-canvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw random lines
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255
            }, 0.5)`;
        ctx.stroke();
    }

    // Draw CAPTCHA text
    ctx.font = "24px Arial";
    ctx.fillStyle = "#333";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let i = 0; i < captchaText.length; i++) {
        ctx.save();
        ctx.translate(25 * i + 25, 25);
        ctx.rotate((Math.random() - 0.5) * 0.4);
        ctx.fillText(captchaText[i], 0, 0);
        ctx.restore();
    }
}

// Refresh CAPTCHA
document.getElementById("refresh-captcha").addEventListener("click", generateCaptcha);

// Generate CAPTCHA on page load
window.onload = generateCaptcha;

// Register function
async function register(event) {
    event.preventDefault();

    const name = document.getElementById("fullname").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const captchaInput = document.getElementById("captcha-input").value;
    const baseUrl = "https://localhost:7125"; // URL của backend

    // Kiểm tra email hợp lệ
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert("Vui lòng nhập email hợp lệ!");
        return;
    }

    // Kiểm tra số điện thoại (10 chữ số)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
        alert("Vui lòng nhập số điện thoại 10 chữ số!");
        return;
    }

    // Kiểm tra mật khẩu
    if (password.length < 6) {
        alert("Mật khẩu phải có ít nhất 6 ký tự!");
        return;
    }

    if (password !== confirmPassword) {
        alert("Mật khẩu xác nhận không khớp!");
        return;
    }

    // Kiểm tra CAPTCHA
    if (captchaInput !== captchaText) {
        alert("Mã CAPTCHA không đúng!");
        generateCaptcha();
        return;
    }

    // Tạo đối tượng khách hàng mới (không cần id, BE sẽ sinh)
    const newCustomer = {
        name,
        email,
        password,
        phone
        // Role không gửi, BE sẽ mặc định là "customer"
    };

    try {
        const response = await fetch(`${baseUrl}/api/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newCustomer)
        });

        if (!response.ok) {
            const errorData = await response.json();
            let errorMessage = errorData.message || "Không thể đăng ký";
            if (errorData.errors) {
                errorMessage = Array.isArray(errorData.errors) ? errorData.errors.join("; ") : errorData.errors;
            }
            throw new Error(errorMessage);
        }

        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        window.location.href = "login.html";
    } catch (error) {
        console.error("Lỗi khi đăng ký:", error.message);
        alert(`Có lỗi xảy ra: ${error.message}`);
    }
}