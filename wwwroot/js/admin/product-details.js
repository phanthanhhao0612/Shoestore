

async function loadProductDetails() {
    const productDetailsList = document.getElementById("product-details-list");
    if (!productDetailsList) return;
    productDetailsList.innerHTML = "<tr><td colspan='8'>Đang tải...</td></tr>";

    try {
        const response = await fetch(`${baseUrl}/api/productdetails`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
            }
        });
        if (!response.ok) throw new Error("Không thể tải danh sách chi tiết sản phẩm.");
        const products = await response.json();

        productDetailsList.innerHTML = "";
        if (!products.length) {
            productDetailsList.innerHTML = "<tr><td colspan='8'>Không có sản phẩm nào.</td></tr>";
        } else {
            products.forEach((product) => {
                const imagePreview = product.detailImages && product.detailImages.length > 0
                    ? product.detailImages.map(img => `<img src="${img}" style="width: 50px; height: 50px; margin: 5px;" />`).join("")
                    : "Chưa có ảnh";

                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${product.name || "N/A"}</td>
                    <td>${product.description || "Chưa có mô tả"}</td>
                    <td>
                        Chất liệu: ${product.specs?.material || "N/A"}<br>
                        Trọng lượng: ${product.specs?.weight || "N/A"}<br>
                        Màu sắc: ${product.specs?.color || "N/A"}<br>
                        Đặc điểm: ${product.specs?.highlights || "N/A"}
                    </td>
                    <td>${product.rating !== null && product.rating !== undefined ? product.rating : "Chưa có"}</td>
                    <td>${product.sold || 0}</td>
                    <td>${product.inventory?.stock !== null && product.inventory?.stock !== undefined ? product.inventory.stock : "N/A"}</td>
                    <td>${imagePreview}</td>
                    <td><button class="edit-btn">Sửa</button></td>
                `;
                productDetailsList.appendChild(row);

                row.querySelector(".edit-btn").addEventListener("click", () => editProductDetails(product.id));
            });
        }
    } catch (error) {
        console.error("Lỗi tải chi tiết sản phẩm:", error);
        productDetailsList.innerHTML = `<tr><td colspan='8'>Lỗi: ${error.message}</td></tr>`;
    }
}

async function editProductDetails(id) {
    try {
        const productResponse = await fetch(`${baseUrl}/api/productdetails/${id}`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token") || ""}` }
        });
        if (!productResponse.ok) throw new Error("Không thể tải sản phẩm.");
        const product = await productResponse.json();

        document.getElementById("edit-product-details-id").value = product.id || "";
        document.getElementById("edit-product-details-name").value = product.name || "";
        document.getElementById("edit-product-details-description").value = product.description || "";
        document.getElementById("edit-product-details-material").value = product.specs?.material || "";
        document.getElementById("edit-product-details-weight").value = product.specs?.weight || "";
        document.getElementById("edit-product-details-colors").value = product.specs?.color || ""; // Sửa từ colors thành color
        document.getElementById("edit-product-details-highlights").value = product.specs?.highlights || "";
        document.getElementById("edit-product-details-rating").value = product.rating !== null && product.rating !== undefined ? product.rating : "";
        document.getElementById("edit-product-details-sold").value = product.sold || "";
        document.getElementById("edit-product-details-stock").value = product.inventory?.stock !== null && product.inventory?.stock !== undefined ? product.inventory.stock : "";

        const imagePreview = document.getElementById("image-preview");
        imagePreview.innerHTML = "";
        if (product.detailImages && product.detailImages.length > 0) {
            product.detailImages.forEach((img, index) => {
                const imgElement = document.createElement("div");
                imgElement.style.display = "inline-block";
                imgElement.style.position = "relative";
                imgElement.style.margin = "5px";
                imgElement.innerHTML = `
                    <img src="${img}" style="width: 100px; height: 100px;" />
                    <span onclick="removeImage('${product.id}', ${index})" style="position: absolute; top: 0; right: 0; cursor: pointer; color: red; font-size: 20px;">×</span>
                `;
                imagePreview.appendChild(imgElement);
            });
        }

        document.getElementById("edit-product-details-modal").style.display = "block";

        const fileInput = document.getElementById("edit-product-details-images");
        fileInput.onchange = function () {
            const files = Array.from(fileInput.files);
            const totalImages = (product.detailImages?.length || 0) + files.length;
            if (totalImages > 5) {
                alert("Bạn chỉ có thể tải lên tối đa 5 ảnh!");
                fileInput.value = "";
                return;
            }
            files.forEach((file) => {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const imgElement = document.createElement("div");
                    imgElement.style.display = "inline-block";
                    imgElement.style.position = "relative";
                    imgElement.style.margin = "5px";
                    imgElement.innerHTML = `<img src="${e.target.result}" style="width: 100px; height: 100px;" />`;
                    imagePreview.appendChild(imgElement);
                };
                reader.readAsDataURL(file);
            });
        };
    } catch (error) {
        console.error("Lỗi tải dữ liệu chỉnh sửa:", error);
        alert(`Lỗi: ${error.message}`);
    }
}

function closeEditProductDetailsModal() {
    document.getElementById("edit-product-details-modal").style.display = "none";
}

async function removeImage(productId, imageIndex) {
    try {
        const productResponse = await fetch(`${baseUrl}/api/productdetails/${productId}`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token") || ""}` }
        });
        if (!productResponse.ok) throw new Error("Không thể tải sản phẩm.");
        const product = await productResponse.json();

        if (product && product.detailImages) {
            product.detailImages.splice(imageIndex, 1);
            await fetch(`${baseUrl}/api/productdetails/${productId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
                },
                body: JSON.stringify(product),
            });
            editProductDetails(productId); // Cập nhật giao diện
        }
    } catch (error) {
        console.error("Lỗi xóa ảnh:", error);
        alert(`Lỗi: ${error.message}`);
    }
}

async function saveEditProductDetails(event) {
    event.preventDefault();
    const id = document.getElementById("edit-product-details-id").value;
    const description = document.getElementById("edit-product-details-description").value || null;
    const material = document.getElementById("edit-product-details-material").value || null;
    const weight = document.getElementById("edit-product-details-weight").value || null;
    const color = document.getElementById("edit-product-details-colors").value || null; // Sửa từ colors thành color
    const highlights = document.getElementById("edit-product-details-highlights").value || null;
    const rating = parseFloat(document.getElementById("edit-product-details-rating").value) || null;
    const sold = parseInt(document.getElementById("edit-product-details-sold").value) || 0;
    const stock = parseInt(document.getElementById("edit-product-details-stock").value) || 0;

    try {
        const productResponse = await fetch(`${baseUrl}/api/productdetails/${id}`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token") || ""}` }
        });
        if (!productResponse.ok) throw new Error("Không thể tải sản phẩm.");
        const product = await productResponse.json();

        // Xử lý ảnh mới
        const fileInput = document.getElementById("edit-product-details-images");
        const files = Array.from(fileInput.files);
        const newImages = [];
        if (files.length > 0) {
            const totalImages = (product.detailImages?.length || 0) + files.length;
            if (totalImages > 5) {
                alert("Tổng số ảnh không được vượt quá 5!");
                return;
            }
            for (const file of files) {
                const reader = new FileReader();
                const result = await new Promise((resolve) => {
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(file);
                });
                newImages.push(result);
            }
        }

        // Cập nhật thông tin sản phẩm
        product.description = description;
        product.specs = { material, weight, color, highlights }; // Sửa từ colors thành color
        product.rating = rating;
        product.sold = sold;
        product.detailImages = [...(product.detailImages || []), ...newImages];

        await fetch(`${baseUrl}/api/productdetails/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
            },
            body: JSON.stringify(product),
        });

        // Cập nhật tồn kho
        if (stock >= 0) {
            await fetch(`${baseUrl}/api/productdetails/${id}/stock`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
                },
                body: JSON.stringify(stock),
            });
        }

        loadProductDetails();
        closeEditProductDetailsModal();
        alert("Cập nhật sản phẩm thành công!");
    } catch (error) {
        console.error("Lỗi lưu chỉnh sửa:", error);
        alert(`Lỗi: ${error.message}`);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("product-details")?.classList.contains("active")) {
        loadProductDetails();
    }
});