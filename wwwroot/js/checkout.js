

// Tạo QR Code dựa trên phương thức thanh toán
function generateQRCode() {
    const paymentMethod = document.getElementById("payment-method")?.value;
    const qrCodeContainer = document.getElementById("qrcode");

    if (!qrCodeContainer) {
        console.error("QR code container (#qrcode) not found in HTML.");
        return;
    }

    qrCodeContainer.innerHTML = "";

    let paymentData = "";
    if (paymentMethod === "bank") {
        paymentData = "Bank Transfer: Account Number 123456789 - Vietcombank";
    } else if (paymentMethod === "momo") {
        paymentData = "MoMo: Phone Number 0901234567";
    } else {
        qrCodeContainer.style.display = "none";
        return;
    }

    qrCodeContainer.style.display = "block";
    new QRCode(qrCodeContainer, {
        text: paymentData,
        width: 128,
        height: 128,
    });
}

// Hoàn tất thanh toán
async function completeCheckout(event) {
    event.preventDefault();

    const isLoggedIn = JSON.parse(localStorage.getItem("isLoggedIn") || "false");
    if (!isLoggedIn) {
        alert("Vui lòng đăng nhập để thanh toán!");
        window.location.href = "login.html";
        return;
    }

    const nameInput = document.querySelector('#checkout-form input[placeholder="Họ và tên"]');
    const addressInput = document.querySelector('#checkout-form input[placeholder="Địa chỉ"]');
    const phoneInput = document.querySelector('#checkout-form input[placeholder="Số điện thoại"]');
    const paymentMethodSelect = document.getElementById("payment-method");

    if (!nameInput || !addressInput || !phoneInput || !paymentMethodSelect) {
        alert("Vui lòng kiểm tra lại form thanh toán. Thiếu các trường thông tin cần thiết!");
        return;
    }

    const name = nameInput.value.trim();
    const address = addressInput.value.trim();
    const phone = phoneInput.value.trim();
    const paymentMethod = paymentMethodSelect.value;

    if (!name || !address || !phone || !paymentMethod) {
        alert("Vui lòng điền đầy đủ họ tên, địa chỉ, số điện thoại và chọn phương thức thanh toán!");
        return;
    }

    const customerId = localStorage.getItem("customerId");
    const token = localStorage.getItem("token");
    if (!customerId || !token) {
        alert("Không tìm thấy thông tin khách hàng. Vui lòng đăng nhập lại!");
        window.location.href = "login.html";
        return;
    }

    const checkoutData = {
        CustomerId: customerId,
        Name: name,
        Address: address,
        Phone: phone,
        PaymentMethod: paymentMethod === "cod" ? "ThanhToanKhiNhanHang" : paymentMethod === "bank" ? "ChuyenKhoanNganHang" : "ChuyenKhoanMoMo"
    };

    try {
        const response = await fetch(`${baseUrl}/api/checkout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(checkoutData),
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
                localStorage.clear();
                window.location.href = "login.html";
                return;
            }
            const errorData = await response.json();
            throw new Error(errorData.message || "Không thể tạo đơn hàng.");
        }

        const order = await response.json();
        let orderHistory = JSON.parse(localStorage.getItem("orderHistory") || "[]");
        orderHistory.push(order);
        localStorage.setItem("orderHistory", JSON.stringify(orderHistory));
        localStorage.setItem("lastOrder", JSON.stringify(order));

        // Đồng bộ lại giỏ hàng sau khi thanh toán
        await fetchCartItems(customerId);

        alert("Thanh toán thành công!");
        window.location.href = "order-confirmation.html";
    } catch (error) {
        console.error("Lỗi khi thanh toán:", error);
        alert(error.message || "Có lỗi xảy ra khi thanh toán. Vui lòng thử lại!");
    }
}

// Tải giỏ hàng từ backend (dùng chung với cart.js)
async function fetchCartItems(customerId) {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`${baseUrl}/api/cart/${customerId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
                localStorage.clear();
                window.location.href = "login.html";
                return;
            }
            throw new Error("Không thể tải giỏ hàng.");
        }

        const cartItems = await response.json();
        const cart = cartItems.map((item) => ({
            id: item.id,
            productId: item.productId,
            name: item.productName,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
        }));
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartDisplay();
    } catch (error) {
        console.error("Lỗi khi tải giỏ hàng:", error);
    }
}

// Cập nhật giao diện giỏ hàng (dùng chung với cart.js)
function updateCartDisplay() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    document.querySelectorAll("#cart-count").forEach((count) => {
        count.textContent = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    });
}

// Khởi tạo trang
document.addEventListener("DOMContentLoaded", () => {
    try {
        const customerId = localStorage.getItem("customerId");
        const token = localStorage.getItem("token");
        if (customerId && token) {
            fetchCartItems(customerId);
        }

        const paymentMethodElement = document.getElementById("payment-method");
        if (paymentMethodElement) {
            paymentMethodElement.addEventListener("change", generateQRCode);
            if (paymentMethodElement.value) generateQRCode();
        }

        const checkoutForm = document.getElementById("checkout-form");
        if (checkoutForm) {
            checkoutForm.addEventListener("submit", completeCheckout);
        }
    } catch (error) {
        console.error("Lỗi khi khởi tạo trang thanh toán:", error);
    }
});