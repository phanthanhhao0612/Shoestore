
// Hàm tải danh sách inventory
async function loadInventory() {
    const inventoryList = document.getElementById("inventory-list");
    if (!inventoryList) {
        console.error("Không tìm thấy phần tử 'inventory-list'.");
        return;
    }

    inventoryList.innerHTML = "<tr><td colspan='5'>Đang tải...</td></tr>";
    try {
        const data = await fetchAPI("/api/inventory?page=1&pageSize=1000");
        const inventories = data.inventories || [];

        inventoryList.innerHTML = "";
        if (!inventories.length) {
            inventoryList.innerHTML = "<tr><td colspan='5'>Không có sản phẩm trong kho.</td></tr>";
        } else {
            inventories.forEach(item => {
                const row = createInventoryRow(item);
                inventoryList.appendChild(row);
            });
        }
    } catch (error) {
        console.error("Lỗi tải inventory:", error);
        inventoryList.innerHTML = `<tr><td colspan='5'>Lỗi: ${error.message}</td></tr>`;
    }
}

// Tạo hàng inventory
function createInventoryRow(item) {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${item.id}</td>
        <td>${item.name}</td>
        <td><input type="number" value="${item.stock}" min="0" onchange="updateStock('${item.id}', this.value)" /></td>
        <td>${new Date(item.lastUpdated).toLocaleString()}</td>
        <td><button onclick="deleteInventory('${item.id}')">Xóa</button></td>
    `;
    return row;
}

// Cập nhật số lượng tồn kho
async function updateStock(id, stock) {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Vui lòng đăng nhập để cập nhật tồn kho!");
        return;
    }

    const newStock = parseInt(stock);
    if (isNaN(newStock) || newStock < 0) {
        alert("Số lượng tồn kho phải là số không âm!");
        return;
    }

    try {
        await fetchAPI(`/api/inventory/${id}/stock`, {
            method: "PATCH",
            body: JSON.stringify(newStock),
            headers: { "Content-Type": "application/json" }
        });
        alert("Cập nhật tồn kho thành công!");
        await loadInventory(); // Tải lại danh sách
        await loadProductDetails(); // Đồng bộ với Product Details nếu có
    } catch (error) {
        console.error("Lỗi cập nhật tồn kho:", error);
        alert(`Lỗi: ${error.message}`);
    }
}

// Xóa inventory
async function deleteInventory(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi kho?")) return;

    const token = localStorage.getItem("token");
    if (!token) {
        alert("Vui lòng đăng nhập để xóa sản phẩm!");
        return;
    }

    try {
        await fetchAPI(`/api/inventory/${id}`, {
            method: "DELETE"
        });
        alert("Xóa sản phẩm khỏi kho thành công!");
        await loadInventory(); // Tải lại danh sách
        await loadProductDetails(); // Đồng bộ với Product Details nếu có
    } catch (error) {
        console.error("Lỗi xóa inventory:", error);
        if (error.message.includes("404")) {
            alert("Sản phẩm không tồn tại hoặc đã bị xóa!");
        } else {
            alert(`Lỗi: ${error.message}`);
        }
        await loadInventory(); // Tải lại để đồng bộ giao diện
    }
}

// Hàm gọi API với xử lý token (được tái sử dụng từ code trước)
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
            response = await fetch(fullUrl, { ...options, headers });
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

// Hàm làm mới token (giả sử có sẵn từ code trước)
async function refreshToken() {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) throw new Error("Không có refresh token!");

    const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken })
    });
    if (!response.ok) throw new Error("Không thể làm mới token!");
    const data = await response.json();
    localStorage.setItem("token", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    return data.accessToken;
}

// Khởi tạo khi trang tải
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("inventory-list")) {
        loadInventory();
    }
});

// Gắn hàm vào global scope để sử dụng trong HTML nếu cần
window.loadInventory = loadInventory;
window.updateStock = updateStock;
window.deleteInventory = deleteInventory;