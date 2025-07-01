
// Thêm sản phẩm vào giỏ hàng qua API
async function addToCart(productId, productName, price, image) {
    if (!isLoggedIn) {
        alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
        window.location.href = "login.html";
        return;
    }

    const customerId = localStorage.getItem("customerId");
    const token = localStorage.getItem("token");
    if (!customerId || !token) {
        alert("Không tìm thấy thông tin khách hàng. Vui lòng đăng nhập lại!");
        window.location.href = "login.html";
        return;
    }

    const cartItem = { CustomerId: customerId, ProductId: productId, Quantity: 1, Price: price, Image: image };

    try {
        const response = await fetch(`${baseUrl}/api/cart`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(cartItem),
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
                localStorage.clear();
                window.location.href = "login.html";
                return;
            }
            const errorData = await response.json();
            throw new Error(errorData.message || "Không thể thêm vào giỏ hàng.");
        }

        const updatedCartItem = await response.json();
        let cart = JSON.parse(localStorage.getItem("cart") || "[]");
        const existingItem = cart.find((item) => item.productId === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: updatedCartItem.id,
                productId: updatedCartItem.productId,
                name: productName,
                price: updatedCartItem.price,
                quantity: updatedCartItem.quantity,
                image: updatedCartItem.image,
            });
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartDisplay();
        alert(`Đã thêm "${productName}" vào giỏ hàng!`);
    } catch (error) {
        console.error("Lỗi khi thêm vào giỏ hàng:", error);
        alert(error.message);
    }
}

// Thêm sản phẩm từ trang chi tiết
async function addToCartFromDetail() {
    if (!isLoggedIn) {
        alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
        window.location.href = "login.html";
        return;
    }

    const customerId = localStorage.getItem("customerId");
    const token = localStorage.getItem("token");
    if (!customerId || !token) {
        alert("Không tìm thấy thông tin khách hàng. Vui lòng đăng nhập lại!");
        window.location.href = "login.html";
        return;
    }

    const productId = new URLSearchParams(window.location.search).get("id");
    const productName = document.getElementById("product-name")?.textContent || "Unknown Product";
    const priceText = document.getElementById("product-price")?.textContent.split(" ")[0].replace(/\./g, "");
    const price = parseInt(priceText) || 0;
    const quantity = parseInt(document.getElementById("quantity")?.value) || 1;
    const image = document.getElementById("main-product-image")?.src || "https://via.placeholder.com/100";

    if (!productId) {
        alert("Không tìm thấy ID sản phẩm!");
        return;
    }

    const cartItem = { CustomerId: customerId, ProductId: productId, Quantity: quantity, Price: price, Image: image };

    try {
        const response = await fetch(`${baseUrl}/api/cart`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(cartItem),
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
                localStorage.clear();
                window.location.href = "login.html";
                return;
            }
            const errorData = await response.json();
            throw new Error(errorData.message || "Không thể thêm vào giỏ hàng.");
        }

        const updatedCartItem = await response.json();
        let cart = JSON.parse(localStorage.getItem("cart") || "[]");
        const existingItem = cart.find((item) => item.productId === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: updatedCartItem.id,
                productId: updatedCartItem.productId,
                name: productName,
                price: updatedCartItem.price,
                quantity: updatedCartItem.quantity,
                image: updatedCartItem.image,
            });
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartDisplay();
        alert(`Đã thêm ${quantity} "${productName}" vào giỏ hàng!`);
    } catch (error) {
        console.error("Lỗi khi thêm vào giỏ hàng:", error);
        alert(error.message);
    }
}

// Thay đổi số lượng sản phẩm
async function changeQuantity(index, delta) {
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (index >= 0 && index < cart.length) {
        const newQuantity = (cart[index].quantity || 0) + delta;
        if (newQuantity < 1) return;
        await updateCartItemOnServer(cart[index].id, newQuantity);
    }
}

// Cập nhật số lượng sản phẩm
async function updateQuantity(index, value) {
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (index >= 0 && index < cart.length) {
        const newQuantity = parseInt(value) || 1;
        if (newQuantity < 1) return;
        await updateCartItemOnServer(cart[index].id, newQuantity);
    }
}

// Gửi yêu cầu cập nhật số lượng lên server
async function updateCartItemOnServer(cartId, quantity) {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`${baseUrl}/api/cart/${cartId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(quantity),
        });
        if (!response.ok) {
            if (response.status === 401) {
                alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
                localStorage.clear();
                window.location.href = "login.html";
                return;
            }
            const errorData = await response.json();
            throw new Error(errorData.message || "Không thể cập nhật số lượng.");
        }
        let cart = JSON.parse(localStorage.getItem("cart") || "[]");
        const item = cart.find((item) => item.id === cartId);
        if (item) {
            item.quantity = quantity;
            localStorage.setItem("cart", JSON.stringify(cart));
            updateCartDisplay();
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật số lượng:", error);
        alert(error.message);
    }
}

// Xóa sản phẩm khỏi giỏ hàng
async function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (index >= 0 && index < cart.length) {
        const cartId = cart[index].id;
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${baseUrl}/api/cart/${cartId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) {
                if (response.status === 401) {
                    alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
                    localStorage.clear();
                    window.location.href = "login.html";
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể xóa sản phẩm.");
            }
            cart.splice(index, 1);
            localStorage.setItem("cart", JSON.stringify(cart));
            updateCartDisplay();
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm:", error);
            alert(error.message);
        }
    }
}

// Xóa toàn bộ giỏ hàng
async function clearCart() {
    const customerId = localStorage.getItem("customerId");
    const token = localStorage.getItem("token");
    if (!customerId || !token) {
        alert("Vui lòng đăng nhập để thực hiện thao tác này!");
        window.location.href = "login.html";
        return;
    }
    try {
        const response = await fetch(`${baseUrl}/api/cart/clear/${customerId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
            if (response.status === 401) {
                alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
                localStorage.clear();
                window.location.href = "login.html";
                return;
            }
            const errorData = await response.json();
            throw new Error(errorData.message || "Không thể xóa giỏ hàng.");
        }
        localStorage.setItem("cart", JSON.stringify([]));
        updateCartDisplay();
        alert("Đã xóa toàn bộ giỏ hàng!");
    } catch (error) {
        console.error("Lỗi khi xóa giỏ hàng:", error);
        alert(error.message);
    }
}

// Gắn các hàm vào window để HTML có thể truy cập
window.addToCart = addToCart;
window.addToCartFromDetail = addToCartFromDetail;
window.changeQuantity = changeQuantity;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;