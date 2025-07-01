

// Hàm tải danh sách sản phẩm từ backend
async function loadProducts() {
    const productList = document.getElementById("product-list");
    if (!productList) return;

    productList.innerHTML = "<p>Đang tải sản phẩm...</p>"; // Thông báo đang tải
    try {
        const response = await fetch(`${baseUrl}/api/products?page=1&pageSize=20`);
        if (!response.ok) {
            throw new Error(`Không thể tải danh sách sản phẩm. Mã lỗi: ${response.status}`);
        }
        const data = await response.json();
        const products = data.products || []; // Đảm bảo products luôn là mảng

        console.log("Products from backend:", products);

        productList.innerHTML = ""; // Xóa thông báo đang tải
        if (products.length === 0) {
            productList.innerHTML = "<p>Không có sản phẩm nào.</p>";
            return;
        }

        products.forEach((product) => {
            const productDiv = document.createElement("div");
            productDiv.classList.add("product-item");
            productDiv.setAttribute(
                "data-brand",
                product.category ? product.category.name : "N/A"
            );
            productDiv.setAttribute("data-size", product.size || "N/A");
            productDiv.setAttribute("data-price", product.price || 0);
            productDiv.innerHTML = `
                <img src="${product.image || 'https://via.placeholder.com/100'}" alt="${product.name || 'Không tên'}" />
                <h3>${product.name || 'Không tên'}</h3>
                <p class="price">${(product.price || 0).toLocaleString()} VNĐ</p>
                <div class="product-actions">
                    <button onclick="addToCart('${product.id}', '${product.name || 'Không tên'}', ${product.price || 0}, '${product.image || 'https://via.placeholder.com/100'}')">Thêm vào giỏ</button>
                    <a href="product-detail.html?id=${product.id}" class="view-details">Xem chi tiết</a>
                </div>
            `;
            productList.appendChild(productDiv);
        });
    } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
        productList.innerHTML = `<p>Có lỗi xảy ra khi tải sản phẩm: ${error.message}</p>`;
    }
}

// Hàm tải danh sách danh mục từ backend vào bộ lọc
async function loadCategoryFilter() {
    const categoryFilter = document.getElementById("category-filter");
    if (!categoryFilter) return;

    try {
        const response = await fetch(`${baseUrl}/api/categories`);
        if (!response.ok) {
            throw new Error("Không thể tải danh mục.");
        }
        const categories = await response.json() || [];

        categoryFilter.innerHTML = ""; // Xóa nội dung cũ
        if (categories.length === 0) {
            categoryFilter.innerHTML = "<p>Chưa có danh mục nào.</p>";
        } else {
            categories.forEach((category) => {
                const label = document.createElement("label");
                label.innerHTML = `
                    <input type="checkbox" name="category" value="${category.name}" onchange="applyFilter()" />
                    ${category.name}
                `;
                categoryFilter.appendChild(label);
                categoryFilter.appendChild(document.createElement("br"));
            });
        }
    } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
        categoryFilter.innerHTML = `<p>Có lỗi xảy ra khi tải danh mục: ${error.message}</p>`;
    }
}

// Tìm kiếm sản phẩm
const searchInput = document.getElementById("search-input");
if (searchInput) {
    searchInput.addEventListener("input", () => {
        const searchValue = searchInput.value.toLowerCase().trim();
        const productItems = document.querySelectorAll(".product-item");
        productItems.forEach((product) => {
            const productName = product.querySelector("h3").textContent.toLowerCase();
            product.style.display = productName.includes(searchValue) ? "block" : "none";
        });
    });
}

// Lọc sản phẩm
function applyFilter() {
    const selectedCategories = Array.from(
        document.querySelectorAll('input[name="category"]:checked')
    ).map((cb) => cb.value);
    const sizes = Array.from(
        document.querySelectorAll('input[name="size"]:checked')
    ).map((cb) => cb.value);
    const prices = Array.from(
        document.querySelectorAll('input[name="price"]:checked')
    ).map((cb) => cb.value);
    const productItems = document.querySelectorAll(".product-item");

    productItems.forEach((product) => {
        const productBrand = product.getAttribute("data-brand");
        const productSize = product.getAttribute("data-size");
        const productPrice = parseInt(product.getAttribute("data-price")) || 0;

        let show = true;

        if (selectedCategories.length > 0 && !selectedCategories.includes(productBrand)) {
            show = false;
        }
        if (sizes.length > 0 && !sizes.includes(productSize)) {
            show = false;
        }
        if (prices.length > 0) {
            let priceMatch = false;
            prices.forEach((priceRange) => {
                if (priceRange === "0-500" && productPrice <= 500000) priceMatch = true;
                else if (priceRange === "500-1000" && productPrice > 500000 && productPrice <= 1000000)
                    priceMatch = true;
                else if (priceRange === "1000+" && productPrice > 1000000) priceMatch = true;
            });
            if (!priceMatch) show = false;
        }

        product.style.display = show ? "block" : "none";
    });
}

// Xóa bộ lọc
function clearFilters() {
    document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
        checkbox.checked = false;
    });
    applyFilter();
}

// Hàm kiểm tra trạng thái đăng nhập
function updateLoginStatus() {
    const loginStatus = document.getElementById("login-status");
    if (!loginStatus) return;

    const token = localStorage.getItem("token");
    loginStatus.textContent = token ? "Đã đăng nhập" : "Chưa đăng nhập";
}

// Khởi tạo khi tải trang
window.onload = async () => {
    try {
        await Promise.all([loadProducts(), loadCategoryFilter()]);
        const customerId = localStorage.getItem("customerId");
        const token = localStorage.getItem("token");
        if (customerId && token) {
            await fetchCartItems(customerId); // Đảm bảo hàm này tồn tại trong common.js
        } else {
            console.log("Không gọi fetchCartItems vì thiếu customerId hoặc token");
        }
        updateLoginStatus();
    } catch (error) {
        console.error("Lỗi khi khởi tạo trang:", error);
    }
};