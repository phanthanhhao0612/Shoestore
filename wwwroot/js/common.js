const baseUrl = "https://localhost:7125";

// Khởi tạo trạng thái đăng nhập
let isLoggedIn = JSON.parse(localStorage.getItem("isLoggedIn") || "false");

// Cập nhật giao diện dựa trên trạng thái đăng nhập
function updateLoginStatus() {
    const loginLink = document.querySelector('a[href="login.html"]') || document.querySelector('a[href="#"]');
    if (loginLink) {
        if (isLoggedIn) {
            loginLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> Đăng xuất';
            loginLink.href = "#";
            loginLink.onclick = logout;
        } else {
            loginLink.innerHTML = '<i class="fas fa-sign-in-alt"></i> Đăng nhập';
            loginLink.href = "login.html";
            loginLink.onclick = null;
        }
    }
}

// Cập nhật giao diện giỏ hàng
function updateCartDisplay() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    document.querySelectorAll("#cart-count").forEach((count) => {
        count.textContent = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    });

    const cartItems = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    const emptyCartMessage = document.getElementById("empty-cart-message");

    if (cartItems) {
        cartItems.innerHTML = "";
        let total = 0;
        if (cart.length === 0) {
            cartItems.style.display = "none";
            if (emptyCartMessage) emptyCartMessage.style.display = "block";
        } else {
            cartItems.style.display = "block";
            if (emptyCartMessage) emptyCartMessage.style.display = "none";
            cart.forEach((item, index) => {
                const itemTotal = (item.price || 0) * (item.quantity || 0);
                total += itemTotal;
                const productImage = item.image || "https://via.placeholder.com/100";
                const itemElement = document.createElement("div");
                itemElement.classList.add("cart-item");
                itemElement.innerHTML = `
                    <img src="${productImage}" alt="${item.name || 'Không tên'}" class="cart-item-image" />
                    <div class="cart-item-details">
                        <h3>${item.name || 'Không tên'}</h3>
                        <p>${(item.price || 0).toLocaleString()} VNĐ x ${item.quantity || 0} = ${itemTotal.toLocaleString()} VNĐ</p>
                        <div class="cart-item-quantity">
                            <button onclick="changeQuantity(${index}, -1)">-</button>
                            <input type="number" value="${item.quantity || 0}" min="1" onchange="updateQuantity(${index}, this.value)" />
                            <button onclick="changeQuantity(${index}, 1)">+</button>
                        </div>
                    </div>
                    <button class="cart-item-remove" onclick="removeFromCart(${index})">Xóa</button>
                `;
                cartItems.appendChild(itemElement);
            });
            if (cartTotal) cartTotal.textContent = total.toLocaleString() + " VNĐ";
        }
    }
}

// Tải giỏ hàng từ backend
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

// Đăng xuất
function logout() {
    isLoggedIn = false;
    localStorage.setItem("isLoggedIn", JSON.stringify(isLoggedIn));
    localStorage.removeItem("token");
    localStorage.removeItem("customerId");
    localStorage.setItem("cart", JSON.stringify([]));
    updateCartDisplay();
    alert("Đã đăng xuất!");
    window.location.href = "index.html";
    updateLoginStatus();
}

// Toggle menu mobile
document.querySelectorAll(".menu-toggle").forEach((toggle) => {
    toggle.addEventListener("click", () => {
        const navLinks = toggle.closest(".navbar")?.querySelector(".nav-links");
        if (navLinks) navLinks.classList.toggle("active");
    });
});

// Khởi tạo giao diện khi tải trang
document.addEventListener("DOMContentLoaded", () => {
    try {
        const customerId = localStorage.getItem("customerId");
        if (customerId) {
            fetchCartItems(customerId);
        }
        updateCartDisplay();
        updateLoginStatus();
    } catch (error) {
        console.error("Lỗi khi khởi tạo giao diện:", error);
    }
});