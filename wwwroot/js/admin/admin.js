// Khởi tạo dữ liệu toàn cục (không cần nữa nếu dùng BE)
let products = JSON.parse(localStorage.getItem("products")) || [];
let orders = JSON.parse(localStorage.getItem("orders")) || [];
let inventory = JSON.parse(localStorage.getItem("inventory")) || [];
let customers = JSON.parse(localStorage.getItem("customers")) || [];
let categories = JSON.parse(localStorage.getItem("categories")) || [];

const baseUrl = "https://localhost:7125"; // URL của backend

// Hàm mở tab
function openTab(tabName) {
    const tabs = document.querySelectorAll(".tab-content");
    const buttons = document.querySelectorAll(".tab-btn");
    const sidebarLinks = document.querySelectorAll(".sidebar ul li");
    tabs.forEach((tab) => tab.classList.remove("active"));
    buttons.forEach((btn) => btn.classList.remove("active"));
    sidebarLinks.forEach((link) => link.classList.remove("active"));
    document.getElementById(tabName).classList.add("active");
    document.querySelector(`.tab-btn[onclick="openTab('${tabName}')"]`).classList.add("active");
    document.querySelector(`.sidebar ul li a[onclick="openTab('${tabName}')"]`).parentElement.classList.add("active");

    if (tabName === "dashboard") initDashboard();
    else if (tabName === "products") {
        if (typeof window.loadProducts === "function") {
            window.loadProducts();
        } else {
            console.error("loadProducts is not defined yet. Ensure products.js is loaded.");
        }
    }
    else if (tabName === "orders") loadOrders();
    else if (tabName === "inventory") loadInventory();
    else if (tabName === "customers") loadCustomers();
    else if (tabName === "categories") loadCategories();
    else if (tabName === "product-details") loadProductDetails();
}

// Hàm đăng xuất
function logout() {
    if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
        window.location.href = "login.html";
    }
}

// Hàm tải danh sách Inventory từ BE
async function loadInventory() {
    const inventoryList = document.getElementById("inventory-list");
    if (!inventoryList) return;

    inventoryList.innerHTML = "<tr><td colspan='3'>Đang tải...</td></tr>";

    try {
        const response = await fetch(`${baseUrl}/api/inventory`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (!response.ok) throw new Error("Không thể tải danh sách tồn kho.");
        const inventoryData = await response.json();

        inventoryList.innerHTML = "";
        if (!inventoryData.length) {
            inventoryList.innerHTML = "<tr><td colspan='3'>Không có sản phẩm trong kho.</td></tr>";
        } else {
            inventoryData.forEach((item) => {
                const row = document.createElement("tr");
                row.innerHTML = `
          <td>${item.name}</td>
          <td><input type="number" value="${item.stock}" onchange="updateStock('${item.id}', this.value)" min="0" /></td>
          <td><button onclick="deleteInventory('${item.id}')">Xóa</button></td>
        `;
                inventoryList.appendChild(row);
            });
        }
    } catch (error) {
        console.error("Lỗi tải tồn kho:", error);
        inventoryList.innerHTML = "<tr><td colspan='3'>Lỗi tải dữ liệu.</td></tr>";
    }
}

// Hàm cập nhật Stock qua API
async function updateStock(id, stock) {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Vui lòng đăng nhập với tài khoản admin!");
        return;
    }

    try {
        const response = await fetch(`${baseUrl}/api/inventory/${id}/stock`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(parseInt(stock))
        });

        if (!response.ok) throw new Error("Không thể cập nhật tồn kho.");
        await loadInventory(); // Tải lại danh sách Inventory
        // Nếu cần đồng bộ với Products, gọi loadProducts() ở đây
    } catch (error) {
        console.error("Lỗi cập nhật tồn kho:", error);
        alert(`Lỗi: ${error.message}`);
    }
}

// Hàm xóa Inventory qua API
async function deleteInventory(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm khỏi kho?")) return;

    const token = localStorage.getItem("token");
    if (!token) {
        alert("Vui lòng đăng nhập với tài khoản admin!");
        return;
    }

    try {
        const response = await fetch(`${baseUrl}/api/inventory/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error("Không thể xóa sản phẩm khỏi kho.");
        await loadInventory(); // Tải lại danh sách Inventory
        // Nếu cần đồng bộ với Products, gọi loadProducts() ở đây
    } catch (error) {
        console.error("Lỗi xóa tồn kho:", error);
        alert(`Lỗi: ${error.message}`);
    }
}

// Khởi tạo khi tải trang
window.onload = () => {
    openTab("dashboard");
};