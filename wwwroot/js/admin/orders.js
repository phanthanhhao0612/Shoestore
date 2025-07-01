async function loadOrders() {
    const orderList = document.getElementById("order-list");
    orderList.innerHTML = "";
    const response = await fetch("/api/orders");
    const orders = await response.json();

    if (orders.length === 0) {
        orderList.innerHTML =
            "<tr><td colspan='6'>Không có đơn hàng nào.</td></tr>";
    } else {
        orders.forEach((order) => {
            const row = document.createElement("tr");
            row.innerHTML = `
          <td>${order.orderId}</td>
          <td>${order.name}</td>
          <td>${order.total.toLocaleString()} VNĐ</td>
          <td>${new Date(order.date).toLocaleString()}</td>
          <td>
            <select onchange="updateOrderStatus('${order.orderId}', this.value)">
              <option value="Đang xử lý" ${order.status === "Đang xử lý" ? "selected" : ""
                }>Đang xử lý</option>
              <option value="Đã giao" ${order.status === "Đã giao" ? "selected" : ""
                }>Đã giao</option>
              <option value="Đã hủy" ${order.status === "Đã hủy" ? "selected" : ""
                }>Đã hủy</option>
            </select>
          </td>
          <td>
            <button onclick="deleteOrder('${order.orderId}')">Xóa</button>
          </td>
        `;
            orderList.appendChild(row);
        });
    }
}

async function updateOrderStatus(orderId, status) {
    await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(status),
    });
    loadOrders();
    if (document.getElementById("dashboard").classList.contains("active")) {
        initDashboard();
    }
}

async function deleteOrder(orderId) {
    if (confirm("Bạn có chắc chắn muốn xóa đơn hàng này?")) {
        await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
        loadOrders();
        if (document.getElementById("dashboard").classList.contains("active")) {
            initDashboard();
        }
    }
}