

// Hàm sinh GUID và Id
function generateGuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
            v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

function generateShortId(prefix) {
    return `${prefix}-${generateGuid().substring(0, 8)}`;
}

async function loadCategories() {
    const categoryList = document.getElementById("category-list");
    if (!categoryList) {
        console.error("Không tìm thấy phần tử 'category-list'");
        return;
    }
    categoryList.innerHTML = "";
    const response = await fetch(`${baseUrl}/api/categories`);
    const categories = await response.json();

    if (categories.length === 0) {
        categoryList.innerHTML = "<tr><td colspan='3'>Không có danh mục nào.</td></tr>";
    } else {
        categories.forEach((category) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${category.name}</td>
                <td>${category.description || "N/A"}</td>
                <td><button onclick="deleteCategory('${category.id}')">Xóa</button></td>
            `;
            categoryList.appendChild(row);
        });
    }
}

function openAddCategoryModal() {
    const modal = document.getElementById("add-category-modal");
    if (modal) modal.style.display = "block";
}

function closeAddCategoryModal() {
    const modal = document.getElementById("add-category-modal");
    if (modal) modal.style.display = "none";
}

async function addCategory(event) {
    event.preventDefault();
    const id = generateShortId("CAT"); // Sinh Id ở FE
    const name = document.getElementById("category-name").value;
    const description = document.getElementById("category-description").value;

    if (!name) {
        alert("Vui lòng nhập tên danh mục!");
        return;
    }

    const newCategory = { id, name, description }; // Gửi Id từ FE

    await fetch(`${baseUrl}/api/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
    });
    loadCategories();
    closeAddCategoryModal();
    document.getElementById("add-category-form").reset();
    if (document.getElementById("products") && document.getElementById("products").classList.contains("active")) {
        updateCategoryOptions("product-category");
        updateCategoryOptions("edit-product-category");
    }
}

async function deleteCategory(id) {
    if (confirm("Bạn có chắc chắn muốn xóa loại sản phẩm này?")) {
        await fetch(`${baseUrl}/api/categories/${id}`, { method: "DELETE" });
        loadCategories();
        if (document.getElementById("products") && document.getElementById("products").classList.contains("active")) {
            updateCategoryOptions("product-category");
            updateCategoryOptions("edit-product-category");
        }
    }
}

// Load danh mục khi trang khởi động
document.addEventListener("DOMContentLoaded", loadCategories);