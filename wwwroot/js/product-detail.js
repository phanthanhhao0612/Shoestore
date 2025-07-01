

// Hàm tải thông tin chi tiết sản phẩm từ API
async function loadProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");
    if (!productId) {
        document.querySelector(".product-detail").innerHTML = "<p>Không tìm thấy sản phẩm.</p>";
        return;
    }

    try {
        const response = await fetch(`${baseUrl}/api/ProductDetails/${productId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Không thể tải thông tin sản phẩm: ${response.status}`);
        }

        const product = await response.json();
        console.log("Product data:", product); // Log dữ liệu sản phẩm để debug
        displayProductDetail(product);
    } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error.message);
        document.querySelector(".product-detail").innerHTML = "<p>Có lỗi xảy ra khi tải sản phẩm: " + error.message + "</p>";
    }
}

// Hàm hiển thị thông tin sản phẩm
function displayProductDetail(product) {
    document.getElementById("product-name").textContent = product.name || "Không tên";

    const mainImage = document.getElementById("main-product-image");
    const detailImages = product.detailImages && product.detailImages.length > 0
        ? product.detailImages
        : [product.image || "/images/default-product.jpg"]; // Thay bằng ảnh cục bộ
    mainImage.src = detailImages[0];

    const thumbnails = document.querySelector(".thumbnails");
    thumbnails.innerHTML = "";
    detailImages.forEach((imgSrc, index) => {
        const thumb = document.createElement("img");
        thumb.src = imgSrc;
        thumb.alt = `${product.name || "Không tên"} - Góc ${index + 1}`;
        thumb.onerror = () => thumb.src = "/images/default-product.jpg"; // Dự phòng nếu ảnh lỗi
        thumb.onclick = () => changeMainImage(imgSrc);
        thumbnails.appendChild(thumb);
    });

    const priceElement = document.getElementById("product-price");
    priceElement.innerHTML = `${product.price.toLocaleString()} VNĐ 
        ${product.originalPrice ? `<span class="old-price">${product.originalPrice.toLocaleString()} VNĐ</span>` : ""}`;

    document.getElementById("product-short-description").textContent =
        product.description || "Không có mô tả";

    document.getElementById("description").innerHTML = `<p>${product.description || "Không có mô tả"}</p>`;

    const specs = product.specs || {};
    document.getElementById("specs").innerHTML = `
        <ul>
            <li><strong>Chất liệu:</strong> ${specs.material || "N/A"}</li>
            <li><strong>Kích cỡ:</strong> ${product.size || "N/A"}</li>
            <li><strong>Trọng lượng:</strong> ${specs.weight || "N/A"}</li>
            <li><strong>Màu sắc:</strong> ${specs.color || "N/A"}</li>
            <li><strong>Đặc điểm nổi bật:</strong> ${specs.highlights || "N/A"}</li>
        </ul>`;

    const rating = product.rating || 0;
    const stars = "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));
    document.querySelector(".product-rating").innerHTML =
        `<span class="star">${stars}</span> (${rating}/5) - Đã bán: ${product.sold || 0}`;

    const sizeSelect = document.getElementById("size");
    sizeSelect.innerHTML = "";
    const sizes = product.size ? product.size.split(",") : ["N/A"];
    sizes.forEach((size) => {
        const option = document.createElement("option");
        option.value = size.trim();
        option.textContent = size.trim();
        sizeSelect.appendChild(option);
    });

    const inventory = product.inventory || {};
    const quantityInput = document.getElementById("quantity");
    quantityInput.max = inventory.stock || 100;
}

// Hàm thay đổi ảnh chính
function changeMainImage(src) {
    const mainImage = document.getElementById("main-product-image");
    mainImage.src = src;
    mainImage.onerror = () => mainImage.src = "/images/default-product.jpg"; // Dự phòng nếu ảnh lỗi
}

// Hàm chuyển đổi tab
function openTab(tabName) {
    const tabs = document.querySelectorAll(".tab-content");
    const buttons = document.querySelectorAll(".tab-btn");

    tabs.forEach((tab) => tab.classList.remove("active"));
    buttons.forEach((btn) => btn.classList.remove("active"));

    document.getElementById(tabName).classList.add("active");
    event.currentTarget.classList.add("active");
}

// Hàm gửi đánh giá (giả lập, cần API thật để lưu)
function submitReview() {
    const review = document.querySelector(".review-input").value;
    if (review.trim()) {
        alert("Cảm ơn bạn đã đánh giá sản phẩm!");
        document.querySelector(".review-input").value = "";
    } else {
        alert("Vui lòng nhập đánh giá trước khi gửi!");
    }
}

// Hàm thêm vào giỏ hàng từ trang chi tiết
async function addToCartFromDetail() {
    const isLoggedIn = JSON.parse(localStorage.getItem("isLoggedIn") || "false");
    if (!isLoggedIn) {
        alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
        window.location.href = "login.html";
        return;
    }

    const token = localStorage.getItem("token");
    const customerId = localStorage.getItem("customerId");
    if (!token || !customerId) {
        alert("Không tìm thấy thông tin đăng nhập. Vui lòng đăng nhập lại!");
        window.location.href = "login.html";
        return;
    }

    const productId = new URLSearchParams(window.location.search).get("id");
    const productName = document.getElementById("product-name")?.textContent || "Sản phẩm không tên";
    const priceText = document.getElementById("product-price")?.textContent.split(" ")[0].replace(/\./g, "") || "0";
    const price = parseInt(priceText) || 0;
    const quantity = parseInt(document.getElementById("quantity")?.value) || 1;

    const cartItem = {
        CustomerId: customerId,
        ProductId: productId,
        Quantity: quantity,
        Price: price
    };
    console.log("Dữ liệu gửi lên:", cartItem);
    console.log("Token:", token);

    if (!customerId || !productId || !quantity || quantity <= 0 || !price || price <= 0) {
        alert("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin sản phẩm.");
        return;
    }

    try {
        const response = await fetch(`${baseUrl}/api/cart`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(cartItem),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.log("Phản hồi lỗi từ API:", response.status, errorText);
            throw new Error(`Không thể thêm vào giỏ hàng: ${response.status} - ${errorText}`);
        }

        const updatedCartItem = await response.json();
        console.log("Phản hồi từ server:", updatedCartItem); // Log phản hồi để debug
        alert(`Đã thêm ${quantity} "${productName}" vào giỏ hàng!`);
    } catch (error) {
        console.error("Lỗi khi thêm vào giỏ hàng:", error.message);
        alert(`Lỗi khi thêm vào giỏ hàng: ${error.message}`);
    }
}

// Hàm mua ngay
function buyNow() {
    const isLoggedIn = JSON.parse(localStorage.getItem("isLoggedIn") || "false");
    if (!isLoggedIn) {
        alert("Vui lòng đăng nhập để mua hàng!");
        window.location.href = "login.html";
        return;
    }
    addToCartFromDetail().then(() => {
        window.location.href = "checkout.html";
    });
}

// Khởi tạo khi tải trang
window.onload = async () => {
    await loadProductDetail();
};