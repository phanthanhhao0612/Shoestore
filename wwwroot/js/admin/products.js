// Dữ liệu mẫu ban đầu
const ITEMS_PER_PAGE = 9;
let currentPage = 1;
const BASE_URL = "https://localhost:7125";
let categoryCache = null; // Bộ nhớ đệm cho danh mục

// Dữ liệu mẫu ban đầu
const FLASH_SALE_PRODUCTS = [
    { name: "Nike Air Max 90", originalPrice: 700000, price: 500000, image: "https://via.placeholder.com/250?text=Nike+Air+Max+90", stock: 2, isFlashSale: true, categoryId: "CAT-31663cf2", size: "39" },
    { name: "Adidas Ultraboost", originalPrice: 700000, price: 600000, image: "https://via.placeholder.com/250?text=Adidas+Ultraboost", stock: 3, isFlashSale: true, categoryId: "CAT-31663cf2", size: "40" },
    { name: "Puma RS-X", originalPrice: 550000, price: 450000, image: "https://via.placeholder.com/250?text=Puma+RS-X", stock: 4, isFlashSale: true, categoryId: "CAT-31663cf2", size: "38" },
    { name: "Nike React", originalPrice: 800000, price: 650000, image: "https://via.placeholder.com/250?text=Nike+React", stock: 1, isFlashSale: true, categoryId: "CAT-31663cf2", size: "41" },
    { name: "Adidas Stan Smith", originalPrice: 600000, price: 500000, image: "https://via.placeholder.com/250?text=Adidas+Stan+Smith", stock: 2, isFlashSale: true, categoryId: "CAT-31663cf2", size: "39" },
    { name: "Puma Suede", originalPrice: 500000, price: 400000, image: "https://via.placeholder.com/250?text=Puma+Suede", stock: 3, isFlashSale: true, categoryId: "CAT-31663cf2", size: "40" },
    { name: "Nike Zoom", originalPrice: 900000, price: 750000, image: "https://via.placeholder.com/250?text=Nike+Zoom", stock: 2, isFlashSale: true, categoryId: "CAT-31663cf2", size: "42" },
    { name: "Adidas NMD", originalPrice: 850000, price: 700000, image: "https://via.placeholder.com/250?text=Adidas+NMD", stock: 1, isFlashSale: true, categoryId: "CAT-31663cf2", size: "41" },
];

const FEATURED_PRODUCTS = [
    { name: "Nike Air Max 90", originalPrice: 700000, price: 500000, image: "https://via.placeholder.com/200", stock: 5, isFlashSale: false, categoryId: "CAT-31663cf2", size: "39" },
    { name: "Adidas Ultraboost", originalPrice: 0, price: 600000, image: "https://via.placeholder.com/200", stock: 5, isFlashSale: false, categoryId: "CAT-31663cf2", size: "40" },
    { name: "Puma RS-X", originalPrice: 0, price: 450000, image: "https://via.placeholder.com/200", stock: 5, isFlashSale: false, categoryId: "CAT-31663cf2", size: "38" },
];

const INITIAL_PRODUCTS = [...FLASH_SALE_PRODUCTS, ...FEATURED_PRODUCTS];

// Hàm tạo ID ngắn
function generateShortId(prefix) {
    return `${prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

// Hàm làm mới token (giả sử server hỗ trợ)
async function refreshToken() {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
        throw new Error("Không có refresh token để làm mới!");
    }

    const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) {
        throw new Error("Không thể làm mới token!");
    }
    const data = await response.json();
    localStorage.setItem("token", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken); // Nếu server trả về refresh token mới
    return data.accessToken;
}

// Hàm gọi API với xử lý lỗi và làm mới token
async function fetchAPI(url, options = {}) {
    let token = localStorage.getItem("token");
    const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };
    const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
    let response = await fetch(fullUrl, { ...options, headers });

    if (response.status === 401) {
        try {
            token = await refreshToken();
            headers.Authorization = `Bearer ${token}`;
            response = await fetch(fullUrl, { ...options, headers }); // Thử lại với token mới
        } catch (error) {
            alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            window.location.href = "/html/login.html";
            throw error;
        }
    }

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `${response.status}: ${response.statusText}`);
    }
    if (response.status === 204) return null;
    return response.json();
}

// Đăng xuất
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    window.location.href = "/html/login.html";
}

// Reset dữ liệu sản phẩm
async function resetProducts() {
    if (!confirm("Bạn có chắc chắn muốn đặt lại dữ liệu sản phẩm?")) return;
    const token = localStorage.getItem("token");
    if (!token) return alert("Vui lòng đăng nhập với tài khoản admin!");

    try {
        await fetchAPI("/api/products/reset", { method: "DELETE" });
        for (const product of INITIAL_PRODUCTS) {
            const productData = { id: generateShortId("PRD"), ...product };
            await fetchAPI("/api/products", {
                method: "POST",
                body: JSON.stringify(productData),
            });
        }
        alert("Đã đặt lại dữ liệu thành công!");
        currentPage = 1;
        await loadProducts();
    } catch (error) {
        console.error("Lỗi reset dữ liệu:", error);
        if (error.message.includes("401")) {
            alert("Phiên đăng nhập hết hạn hoặc không có quyền. Vui lòng đăng nhập lại!");
        } else {
            alert(`Lỗi: ${error.message}`);
        }
    }
}

// Tải danh sách sản phẩm
async function loadProducts(searchQuery = "") {
    const productList = document.getElementById("product-list");
    if (!productList) {
        console.error("Không tìm thấy phần tử 'product-list'.");
        return;
    }

    productList.innerHTML = "<tr><td colspan='9'>Đang tải...</td></tr>";
    try {
        const url = searchQuery
            ? `/api/products?search=${encodeURIComponent(searchQuery)}&page=${currentPage}&pageSize=${ITEMS_PER_PAGE}`
            : `/api/products?page=${currentPage}&pageSize=${ITEMS_PER_PAGE}`;
        const data = await fetchAPI(url);
        const products = data.products || [];
        console.log("Danh sách sản phẩm từ API:", products);

        if (!categoryCache) {
            categoryCache = await fetchAPI("/api/categories");
        }
        const categoryMap = new Map(categoryCache.map((cat) => [cat.id, cat.name]));

        productList.innerHTML = "";
        if (!products.length) {
            productList.innerHTML = "<tr><td colspan='9'>Không có sản phẩm nào.</td></tr>";
        } else {
            products.forEach((product) => {
                product.category = { name: categoryMap.get(product.categoryId) || "N/A", id: product.categoryId };
                const row = createProductRow(product);
                productList.appendChild(row);
            });
        }
        updatePagination(data.total || 0);
    } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
        productList.innerHTML = `<tr><td colspan='9'>Lỗi: ${error.message}</td></tr>`;
    }
}

// Tạo hàng sản phẩm
function createProductRow(product) {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td><img src="${product.image || "https://via.placeholder.com/50"}" alt="${product.name}" style="width: 50px;" /></td>
        <td>${product.name}</td>
        <td>${(product.originalPrice || product.price).toLocaleString()} VNĐ</td>
        <td>${product.price.toLocaleString()} VNĐ</td>
        <td>${product.category?.name || "N/A"}</td>
        <td>${product.size || "N/A"}</td>
        <td>${product.stock || 0}</td>
        <td>${product.isFlashSale ? "Có" : "Không"}</td>
        <td>
            <button class="edit-btn">Sửa</button>
            <button class="delete-btn">Xóa</button>
        </td>
    `;
    row.querySelector(".edit-btn").addEventListener("click", () => editProduct(product.id));
    row.querySelector(".delete-btn").addEventListener("click", () => deleteProduct(product.id));
    return row;
}

// Cập nhật phân trang
function updatePagination(totalItems) {
    const pagination = document.getElementById("pagination");
    if (!pagination) return;

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    pagination.innerHTML = `
        <button class="prev-btn" ${currentPage === 1 ? "disabled" : ""}>Trước</button>
        <span>Trang ${currentPage} / ${totalPages}</span>
        <button class="next-btn" ${currentPage === totalPages ? "disabled" : ""}>Tiếp</button>
    `;
    pagination.querySelector(".prev-btn").addEventListener("click", () => changePage(currentPage - 1));
    pagination.querySelector(".next-btn").addEventListener("click", () => changePage(currentPage + 1));
}

// Chuyển trang
async function changePage(newPage) {
    const totalPages = Math.ceil((await fetchAPI(`/api/products?page=1&pageSize=${ITEMS_PER_PAGE}`)).total / ITEMS_PER_PAGE);
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        await loadProducts();
    }
}

// Cập nhật danh mục
async function updateCategoryOptions(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;

    try {
        if (!categoryCache) {
            categoryCache = await fetchAPI("/api/categories");
        }
        select.innerHTML = "<option value=''>Chọn danh mục</option>" +
            categoryCache.map((cat) => `<option value="${cat.id}">${cat.name}</option>`).join("");
    } catch (error) {
        console.error("Lỗi tải danh mục:", error);
        select.innerHTML = "<option value=''>Không có danh mục</option>";
    }
}

// Mở modal thêm sản phẩm
function openAddProductModal() {
    const modal = document.getElementById("add-product-modal");
    if (modal) {
        modal.style.display = "block";
        updateCategoryOptions("product-category");
    }
}

// Đóng modal thêm sản phẩm
function closeAddProductModal() {
    const modal = document.getElementById("add-product-modal");
    if (modal) modal.style.display = "none";
}

// Thêm sản phẩm
async function addProduct(event) {
    event.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("Vui lòng đăng nhập với tài khoản admin!");

    const inputs = getProductInputs("add");
    if (!validateProductInputs(inputs)) return;

    try {
        const productData = {
            id: inputs.id,
            name: inputs.name,
            price: inputs.price,
            originalPrice: inputs.originalPrice,
            categoryId: inputs.categoryId,
            size: inputs.size || "",
            image: inputs.image || "",
            stock: inputs.stock || 5,
            isFlashSale: inputs.isFlashSale,
        };
        await fetchAPI("/api/products", {
            method: "POST",
            body: JSON.stringify(productData),
        });
        alert("Thêm sản phẩm thành công!");
        await loadProducts();
        closeAddProductModal();
        document.getElementById("add-product-form")?.reset();
    } catch (error) {
        console.error("Lỗi thêm sản phẩm:", error);
        if (error.message.includes("401")) {
            alert("Phiên đăng nhập hết hạn hoặc không có quyền. Vui lòng đăng nhập lại!");
        } else {
            alert(`Lỗi: ${error.message}`);
        }
    }
}

// Xóa sản phẩm
async function deleteProduct(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    const token = localStorage.getItem("token");
    if (!token) return alert("Vui lòng đăng nhập với tài khoản admin!");

    try {
        await fetchAPI(`/api/products/${id}`, { method: "DELETE" });
        alert("Xóa sản phẩm thành công!");
        await loadProducts();
    } catch (error) {
        console.error("Lỗi xóa sản phẩm:", error);
        if (error.message.includes("404")) {
            alert("Sản phẩm không tồn tại hoặc đã bị xóa trước đó!");
            await loadProducts();
        } else if (error.message.includes("401")) {
            alert("Phiên đăng nhập hết hạn hoặc không có quyền. Vui lòng đăng nhập lại!");
        } else {
            alert(`Lỗi: ${error.message}`);
        }
    }
}

// Chỉnh sửa sản phẩm
async function editProduct(id) {
    await openEditProductModal(id);
}

async function openEditProductModal(productId) {
    const modal = document.getElementById("edit-product-modal");
    if (!modal) return;

    try {
        const product = await fetchAPI(`/api/products/${productId}`);
        if (!product) throw new Error("Sản phẩm không tồn tại!");

        const inputs = {
            id: document.getElementById("edit-product-id"),
            name: document.getElementById("edit-product-name"),
            price: document.getElementById("edit-product-price"),
            originalPrice: document.getElementById("edit-product-original-price"),
            size: document.getElementById("edit-product-size"),
            image: document.getElementById("edit-product-image"),
            stock: document.getElementById("edit-product-stock"),
            isFlashSale: document.getElementById("edit-product-is-flash-sale"),
            category: document.getElementById("edit-product-category"),
        };

        if (inputs.id) inputs.id.value = product.id || "";
        if (inputs.name) inputs.name.value = product.name || "";
        if (inputs.price) inputs.price.value = product.price || 0;
        if (inputs.originalPrice) inputs.originalPrice.value = product.originalPrice || product.price || 0;
        if (inputs.size) inputs.size.value = product.size || "";
        if (inputs.image) inputs.image.value = product.image || "";
        if (inputs.stock) inputs.stock.value = product.stock || 0;
        if (inputs.isFlashSale) inputs.isFlashSale.checked = product.isFlashSale || false;
        if (inputs.category) inputs.category.value = product.category?.id || product.categoryId || "";

        await updateCategoryOptions("edit-product-category");
        modal.style.display = "block";
    } catch (error) {
        console.error("Lỗi mở modal chỉnh sửa:", error);
        if (error.message.includes("404")) {
            alert("Sản phẩm không tồn tại hoặc đã bị xóa!");
            await loadProducts();
        } else if (error.message.includes("401")) {
            alert("Phiên đăng nhập hết hạn hoặc không có quyền. Vui lòng đăng nhập lại!");
        } else {
            alert(`Lỗi: ${error.message}`);
        }
    }
}

function closeEditProductModal() {
    const modal = document.getElementById("edit-product-modal");
    if (modal) modal.style.display = "none";
}

async function saveEditProduct(event) {
    event.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("Vui lòng đăng nhập với tài khoản admin!");

    const inputs = getProductInputs("edit", true);
    if (!validateProductInputs(inputs)) return;

    try {
        const productData = {
            id: inputs.id,
            name: inputs.name,
            price: inputs.price,
            originalPrice: inputs.originalPrice,
            categoryId: inputs.categoryId,
            size: inputs.size || "",
            image: inputs.image || "",
            stock: inputs.stock || 5,
            isFlashSale: inputs.isFlashSale,
        };

        console.log("Sending PUT request to:", `/api/products/${inputs.id}`, productData);
        await fetchAPI(`/api/products/${inputs.id}`, {
            method: "PUT",
            body: JSON.stringify(productData),
        });
        alert("Cập nhật sản phẩm thành công!");
        await loadProducts();
        closeEditProductModal();
    } catch (error) {
        console.error("Lỗi cập nhật sản phẩm:", error);
        if (error.message.includes("405")) {
            alert("Phương thức không được phép. Vui lòng kiểm tra endpoint hoặc quyền truy cập!");
        } else if (error.message.includes("404")) {
            alert("Sản phẩm không tồn tại hoặc đã bị xóa!");
            await loadProducts();
        } else if (error.message.includes("401")) {
            alert("Phiên đăng nhập hết hạn hoặc không có quyền. Vui lòng đăng nhập lại!");
        } else {
            alert(`Lỗi: ${error.message}`);
        }
    }
}

// Lấy dữ liệu từ form
function getProductInputs(prefix, isEdit = false) {
    const basePrefix = prefix === "add" ? "product" : `${prefix}-product`;
    const ids = {
        id: `${basePrefix}-id`,
        name: `${basePrefix}-name`,
        price: `${basePrefix}-price`,
        originalPrice: `${basePrefix}-original-price`,
        size: `${basePrefix}-size`,
        image: `${basePrefix}-image`,
        stock: `${basePrefix}-stock`,
        isFlashSale: `${basePrefix}-is-flash-sale`,
        category: `${basePrefix}-category`,
    };
    const inputs = Object.fromEntries(
        Object.entries(ids).map(([key, id]) => [key, document.getElementById(id)])
    );

    return isEdit
        ? {
            id: inputs.id?.value || "",
            name: inputs.name?.value || "",
            price: parseFloat(inputs.price?.value) || 0,
            originalPrice: parseFloat(inputs.originalPrice?.value) || parseFloat(inputs.price?.value) || 0,
            categoryId: inputs.category?.value || "",
            size: inputs.size?.value || "",
            image: inputs.image?.value || "",
            stock: parseInt(inputs.stock?.value) || 5,
            isFlashSale: inputs.isFlashSale?.checked || false,
        }
        : {
            id: generateShortId("PRD"),
            name: inputs.name?.value || "",
            price: parseFloat(inputs.price?.value) || 0,
            originalPrice: parseFloat(inputs.originalPrice?.value) || parseFloat(inputs.price?.value) || 0,
            categoryId: inputs.category?.value || "",
            size: inputs.size?.value || "",
            image: inputs.image?.value || "",
            stock: parseInt(inputs.stock?.value) || 5,
            isFlashSale: inputs.isFlashSale?.checked || false,
        };
}

// Validate dữ liệu
function validateProductInputs(inputs) {
    if (!inputs.name || isNaN(inputs.price) || inputs.price <= 0 || !inputs.categoryId) {
        alert("Vui lòng điền đầy đủ thông tin hợp lệ (Tên, Giá > 0, Danh mục)!");
        return false;
    }
    return true;
}

// Khởi tạo
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("products")?.classList.contains("active")) {
        loadProducts();
    }
    const searchInput = document.getElementById("product-search");
    if (searchInput) {
        searchInput.addEventListener("input", debounce(() => loadProducts(searchInput.value), 300));
    }
});

// Hàm debounce để tối ưu tìm kiếm
function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// Gắn hàm vào global scope
window.loadProducts = loadProducts;
window.resetProducts = resetProducts;
window.openAddProductModal = openAddProductModal;
window.closeAddProductModal = closeAddProductModal;
window.addProduct = addProduct;
window.deleteProduct = deleteProduct;
window.editProduct = editProduct;
window.openEditProductModal = openEditProductModal;
window.closeEditProductModal = closeEditProductModal;
window.saveEditProduct = saveEditProduct;
window.changePage = changePage;
window.updateCategoryOptions = updateCategoryOptions;
window.logout = logout;