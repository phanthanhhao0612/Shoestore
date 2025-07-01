const API_BASE_URL = "https://localhost:7125/api/customers";

// Hàm tạo ID
function generateCustomerId() {
    const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `CUS-${randomPart}`;
}

// Hiển thị danh sách tài khoản
async function loadCustomers() {
    const customerList = document.getElementById("customer-list");
    if (!customerList) {
        console.error("Không tìm thấy phần tử 'customer-list'");
        return;
    }
    customerList.innerHTML = "";

    try {
        const response = await fetch(API_BASE_URL, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
            throw new Error(`Lỗi khi lấy danh sách khách hàng: ${response.status} ${response.statusText}`);
        }
        const customers = await response.json();

        if (customers.length === 0) {
            customerList.innerHTML = "<tr><td colspan='7'>Không có tài khoản nào.</td></tr>";
        } else {
            customers.forEach((customer) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${customer.id}</td>
                    <td>${customer.name}</td>
                    <td>${customer.email}</td>
                    <td>${customer.phone || ""}</td>
                    <td>${customer.role ? "Admin" : "Khách Hàng"}</td>
                    <td>
                        <button onclick="editCustomer('${customer.id}')">Sửa</button>
                        <button onclick="deleteCustomer('${customer.id}')">Xóa</button>
                    </td>
                `;
                customerList.appendChild(row);
            });
        }
    } catch (error) {
        console.error("Lỗi khi tải danh sách khách hàng:", error);
        customerList.innerHTML = "<tr><td colspan='7'>Lỗi khi tải dữ liệu: " + error.message + "</td></tr>";
    }
}

// Mở modal thêm tài khoản
function openAddCustomerModal() {
    const modal = document.getElementById("add-customer-modal");
    if (modal) modal.style.display = "block";
}

// Đóng modal thêm tài khoản
function closeAddCustomerModal() {
    const modal = document.getElementById("add-customer-modal");
    if (modal) {
        modal.style.display = "none";
        document.getElementById("add-customer-form").reset();
    }
}

// Thêm tài khoản mới
async function addCustomer(event) {
    event.preventDefault();
    const roleValue = document.getElementById("customer-role").value; // "admin" hoặc "customer"
    const customer = {
        id: generateCustomerId(),
        name: document.getElementById("customer-name").value,
        email: document.getElementById("customer-email").value,
        password: document.getElementById("customer-password").value,
        phone: document.getElementById("customer-phone").value || null,
        role: roleValue // Gửi trực tiếp "admin" hoặc "customer"
    };

    try {
        const response = await fetch(API_BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(customer),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Lỗi khi thêm khách hàng: ${response.status} ${response.statusText}`);
        }

        await loadCustomers();
        closeAddCustomerModal();
    } catch (error) {
        console.error("Lỗi khi thêm khách hàng:", error);
        alert(`Lỗi: ${error.message}`);
    }
}

// Mở modal chỉnh sửa tài khoản
async function editCustomer(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
            throw new Error(`Không tìm thấy khách hàng: ${response.status} ${response.statusText}`);
        }
        const customer = await response.json();

        document.getElementById("edit-customer-id").value = customer.id;
        document.getElementById("edit-customer-name").value = customer.name;
        document.getElementById("edit-customer-email").value = customer.email;
        document.getElementById("edit-customer-password").value = customer.password;
        document.getElementById("edit-customer-phone").value = customer.phone || "";
        document.getElementById("edit-customer-role").value = customer.role ? "admin" : "customer";

        const modal = document.getElementById("edit-customer-modal");
        if (modal) modal.style.display = "block";
    } catch (error) {
        console.error("Lỗi khi tải thông tin khách hàng:", error);
        alert(`Lỗi khi tải thông tin khách hàng: ${error.message}`);
    }
}

// Đóng modal chỉnh sửa tài khoản
function closeEditCustomerModal() {
    const modal = document.getElementById("edit-customer-modal");
    if (modal) modal.style.display = "none";
}

// Lưu thay đổi khi chỉnh sửa tài khoản
async function saveEditCustomer(event) {
    event.preventDefault();
    const id = document.getElementById("edit-customer-id").value;
    const roleValue = document.getElementById("edit-customer-role").value;
    const customer = {
        id,
        name: document.getElementById("edit-customer-name").value,
        email: document.getElementById("edit-customer-email").value,
        password: document.getElementById("edit-customer-password").value,
        phone: document.getElementById("edit-customer-phone").value || null,
        role: roleValue // Gửi trực tiếp "admin" hoặc "customer"
    };

    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(customer),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Lỗi khi cập nhật khách hàng: ${response.status} ${response.statusText}`);
        }

        await loadCustomers();
        closeEditCustomerModal();
    } catch (error) {
        console.error("Lỗi khi cập nhật khách hàng:", error);
        alert(`Lỗi: ${error.message}`);
    }
}

// Xóa tài khoản
async function deleteCustomer(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) return;

    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
            throw new Error(`Lỗi khi xóa khách hàng: ${response.status} ${response.statusText}`);
        }

        await loadCustomers();
    } catch (error) {
        console.error("Lỗi khi xóa khách hàng:", error);
        alert(`Lỗi: ${error.message}`);
    }
}

// Tải danh sách khi trang được load
document.addEventListener("DOMContentLoaded", loadCustomers);