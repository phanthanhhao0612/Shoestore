// Kiểm tra xem đây có phải trang lịch sử đơn hàng không
const isOrderHistoryPage =
  window.location.pathname.endsWith("order-history.html");

// Hiển thị lịch sử đơn hàng
function displayOrderHistory() {
  const orderHistory = JSON.parse(localStorage.getItem("orderHistory") || "[]");
  const orderList = document.querySelector(".order-history-list");
  if (orderList && isOrderHistoryPage) {
    if (orderHistory.length > 0) {
      orderList.innerHTML = orderHistory
        .map(
          (order, index) => `
            <div class="order-item">
              <p><strong>Đơn hàng #${index + 1}</strong></p>
              <p><strong>Mã đơn hàng:</strong> ${order.orderId}</p>
              <p><strong>Tổng tiền:</strong> ${order.total.toLocaleString()} VNĐ</p>
              <p><strong>Ngày đặt:</strong> ${new Date(
                order.date
              ).toLocaleString()}</p>
              <button onclick="showOrderDetails('${
                order.orderId
              }')">Xem chi tiết</button>
              <button onclick="deleteOrder('${
                order.orderId
              }')" class="delete-btn">Xóa</button>
            </div>
          `
        )
        .join("");
    } else {
      orderList.innerHTML =
        '<p class="empty-history">Chưa có đơn hàng nào.</p>';
    }
  }
}

// Hiển thị chi tiết đơn hàng
function showOrderDetails(orderId) {
  const orderHistory = JSON.parse(localStorage.getItem("orderHistory") || "[]");
  const order = orderHistory.find((o) => o.orderId === orderId);
  if (order) {
    alert(`
      Mã đơn hàng: ${order.orderId}
      Tên: ${order.name}
      Địa chỉ: ${order.address}
      Số điện thoại: ${order.phone}
      Phương thức thanh toán: ${order.paymentMethod}
      Tổng tiền: ${order.total.toLocaleString()} VNĐ
      Ngày đặt: ${new Date(order.date).toLocaleString()}
      Sản phẩm:
      ${order.items
        .map(
          (item) =>
            `${item.name} - ${item.price.toLocaleString()} VNĐ x ${
              item.quantity
            }`
        )
        .join("\n")}
    `);
  } else {
    alert("Không tìm thấy đơn hàng!");
  }
}

// Xóa đơn hàng
function deleteOrder(orderId) {
  let orderHistory = JSON.parse(localStorage.getItem("orderHistory") || "[]");
  const orderIndex = orderHistory.findIndex((o) => o.orderId === orderId);
  if (orderIndex !== -1) {
    if (confirm("Bạn có chắc muốn xóa đơn hàng này?")) {
      orderHistory.splice(orderIndex, 1);
      localStorage.setItem("orderHistory", JSON.stringify(orderHistory));
      displayOrderHistory();
      alert("Đã xóa đơn hàng!");
    }
  } else {
    alert("Không tìm thấy đơn hàng để xóa!");
  }
}

// Gọi hàm hiển thị khi tải trang
if (isOrderHistoryPage) {
  displayOrderHistory();
}
