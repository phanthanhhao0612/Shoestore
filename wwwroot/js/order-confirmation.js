// Hiển thị thông tin đơn hàng cuối cùng
const lastOrder = JSON.parse(localStorage.getItem("lastOrder") || "null");
const isOrderConfirmationPage = window.location.pathname.endsWith(
  "order-confirmation.html"
);

if (lastOrder && isOrderConfirmationPage) {
  const orderDetails = document.querySelector(".order-details");
  if (orderDetails) {
    orderDetails.innerHTML = `
      <p><strong>Mã đơn hàng:</strong> ${lastOrder.orderId || "N/A"}</p>
      <p><strong>Họ và tên:</strong> ${lastOrder.name || "Chưa cung cấp"}</p>
      <p><strong>Địa chỉ:</strong> ${lastOrder.address || "Chưa cung cấp"}</p>
      <p><strong>Số điện thoại:</strong> ${
        lastOrder.phone || "Chưa cung cấp"
      }</p>
      <p><strong>Phương thức thanh toán:</strong> ${
        lastOrder.paymentMethod || "Chưa chọn"
      }</p>
      <p><strong>Tổng tiền:</strong> ${(
        lastOrder.total || 0
      ).toLocaleString()} VNĐ</p>
      <p><strong>Ngày đặt hàng:</strong> ${
        lastOrder.date && !isNaN(new Date(lastOrder.date))
          ? new Date(lastOrder.date).toLocaleString()
          : "Chưa xác định"
      }</p>
      <h3>Sản phẩm:</h3>
      <ul>
        ${
          Array.isArray(lastOrder.items) && lastOrder.items.length > 0
            ? lastOrder.items
                .map(
                  (item) =>
                    `<li>${item.name || "Không tên"} - ${(
                      item.price || 0
                    ).toLocaleString()} VNĐ x ${item.quantity || 0}</li>`
                )
                .join("")
            : "<li>Không có sản phẩm</li>"
        }
      </ul>
    `;
  } else {
    console.error("Không tìm thấy phần tử .order-details trong HTML.");
  }
}

// Hiển thị lịch sử đơn hàng
function displayOrderHistory() {
  const orderHistory = JSON.parse(localStorage.getItem("orderHistory") || "[]");
  const orderList = document.querySelector(".order-history-list");
  if (orderList && isOrderConfirmationPage) {
    if (Array.isArray(orderHistory) && orderHistory.length > 0) {
      orderList.innerHTML = orderHistory
        .map(
          (order, index) => `
            <div class="order-item">
              <p><strong>Đơn hàng #${index + 1}</strong></p>
              <p><strong>Mã đơn hàng:</strong> ${order.orderId || "N/A"}</p>
              <p><strong>Tổng tiền:</strong> ${(
                order.total || 0
              ).toLocaleString()} VNĐ</p>
              <p><strong>Ngày đặt:</strong> ${
                order.date && !isNaN(new Date(order.date))
                  ? new Date(order.date).toLocaleString()
                  : "Chưa xác định"
              }</p>
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
      orderList.innerHTML = "<p>Chưa có đơn hàng nào.</p>";
    }
  } else if (!orderList) {
    console.error("Không tìm thấy phần tử .order-history-list trong HTML.");
  }
}

// Hiển thị chi tiết đơn hàng
function showOrderDetails(orderId) {
  const orderHistory = JSON.parse(localStorage.getItem("orderHistory") || "[]");
  const order = orderHistory.find((o) => o.orderId === orderId);
  if (order) {
    const details = `
      Mã đơn hàng: ${order.orderId || "N/A"}
      Tên: ${order.name || "Chưa cung cấp"}
      Địa chỉ: ${order.address || "Chưa cung cấp"}
      Số điện thoại: ${order.phone || "Chưa cung cấp"}
      Phương thức thanh toán: ${order.paymentMethod || "Chưa chọn"}
      Tổng tiền: ${(order.total || 0).toLocaleString()} VNĐ
      Ngày đặt: ${
        order.date && !isNaN(new Date(order.date))
          ? new Date(order.date).toLocaleString()
          : "Chưa xác định"
      }
      Sản phẩm:
      ${
        Array.isArray(order.items) && order.items.length > 0
          ? order.items
              .map(
                (item) =>
                  `${item.name || "Không tên"} - ${(
                    item.price || 0
                  ).toLocaleString()} VNĐ x ${item.quantity || 0}`
              )
              .join("\n")
          : "Không có sản phẩm"
      }
    `;
    alert(details);
  } else {
    alert("Không tìm thấy đơn hàng với mã: " + orderId);
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
      displayOrderHistory(); // Cập nhật giao diện lịch sử đơn hàng
      alert("Đã xóa đơn hàng!");
    }
  } else {
    alert("Không tìm thấy đơn hàng để xóa!");
  }
}

// Gọi hiển thị lịch sử đơn hàng nếu trang phù hợp
if (isOrderConfirmationPage) {
  displayOrderHistory();
}
