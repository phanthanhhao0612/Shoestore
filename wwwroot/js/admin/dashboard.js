let monthlySalesChart, inventoryChart;


const monthlySalesData = {
    labels: [
        "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
        "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
    ],
    datasets: [
        {
            label: "Doanh số (VNĐ)",
            data: [],
            backgroundColor: "#e74c3c",
            borderColor: "#e74c3c",
            borderWidth: 1,
        },
    ],
};

const inventoryData = {
    labels: [],
    datasets: [
        {
            label: "Tồn Kho",
            data: [],
            backgroundColor: "#e74c3c",
            borderColor: "#e74c3c",
            borderWidth: 1,
        },
    ],
};

async function initDashboard() {
    try {
        // Hàm helper để kiểm tra và parse JSON
        const parseResponse = async (response, errorMessage) => {
            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                let errorData = null;

                if (contentType && contentType.includes("application/json")) {
                    errorData = await response.json();
                    throw new Error(`${errorMessage}: ${errorData.message || response.statusText}`);
                } else {
                    const errorText = await response.text();
                    throw new Error(`${errorMessage}: ${response.status} ${response.statusText} - ${errorText}`);
                }
            }

            const contentLength = response.headers.get("content-length");
            if (contentLength === "0") {
                throw new Error(`${errorMessage}: Response body is empty`);
            }

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const errorText = await response.text();
                throw new Error(`${errorMessage}: Invalid JSON response - ${errorText}`);
            }

            return response.json();
        };

        // Lấy danh sách đơn hàng
        const ordersResponse = await fetch(`${baseUrl}/api/orders`);
        const orders = await parseResponse(ordersResponse, "Không thể tải đơn hàng");

        // Lấy danh sách sản phẩm
        const productsResponse = await fetch(`${baseUrl}/api/products?page=1&pageSize=1000`);
        const productsData = await parseResponse(productsResponse, "Không thể tải sản phẩm");
        const products = productsData.products || [];

        // Lấy danh sách khách hàng
        const customersResponse = await fetch(`${baseUrl}/api/customers`);
        const customers = await parseResponse(customersResponse, "Không thể tải khách hàng");

        // Lấy dữ liệu tồn kho
        const inventoryResponse = await fetch(`${baseUrl}/api/inventory`);
        const inventoryDataFromApi = await parseResponse(inventoryResponse, "Không thể tải tồn kho");
        const inventory = Array.isArray(inventoryDataFromApi.inventories) ? inventoryDataFromApi.inventories : [];

        // Tính toán số liệu tổng quan
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        const totalOrders = orders.length;
        const totalProducts = products.length;
        const totalCustomers = customers.length;

        document.getElementById("total-revenue").textContent = totalRevenue.toLocaleString() + " VNĐ";
        document.getElementById("total-orders").textContent = totalOrders;
        document.getElementById("total-products").textContent = totalProducts;
        document.getElementById("total-customers").textContent = totalCustomers;

        // Doanh số hàng tháng
        const monthlySales = {};
        orders.forEach((order) => {
            const date = new Date(order.date);
            if (isNaN(date.getTime())) {
                console.warn(`Ngày không hợp lệ trong đơn hàng: ${order.date}`);
                return;
            }
            const month = date.getMonth();
            monthlySales[month] = (monthlySales[month] || 0) + (order.total || 0);
        });
        monthlySalesData.datasets[0].data = monthlySalesData.labels.map(
            (_, index) => monthlySales[index] || 0
        );

        // Dữ liệu tồn kho
        inventoryData.labels = inventory.map((item) => item.name || "Không xác định");
        inventoryData.datasets[0].data = inventory.map((item) => item.stock || 0);

        // Hủy biểu đồ cũ trước khi tạo mới
        if (monthlySalesChart) monthlySalesChart.destroy();
        if (inventoryChart) inventoryChart.destroy();

        // Tạo biểu đồ doanh số
        monthlySalesChart = new Chart(
            document.getElementById("monthlySalesChart").getContext("2d"),
            {
                type: "bar",
                data: monthlySalesData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true } },
                    plugins: {
                        legend: { display: true },
                        title: { display: true, text: "Doanh Số Hàng Tháng" },
                    },
                },
            }
        );

        // Tạo biểu đồ tồn kho
        inventoryChart = new Chart(
            document.getElementById("inventoryChart").getContext("2d"),
            {
                type: "bar",
                data: inventoryData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true } },
                    plugins: {
                        legend: { display: true },
                        title: { display: true, text: "Tồn Kho Theo Sản Phẩm" },
                    },
                },
            }
        );
    } catch (error) {
        console.error("Lỗi khi tải dashboard:", error);
        document.getElementById("total-revenue").textContent = "Lỗi tải dữ liệu: " + error.message;
        document.getElementById("total-orders").textContent = "Lỗi tải dữ liệu: " + error.message;
        document.getElementById("total-products").textContent = "Lỗi tải dữ liệu: " + error.message;
        document.getElementById("total-customers").textContent = "Lỗi tải dữ liệu: " + error.message;
    }
}

// Tự động tải khi trang khởi động
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("monthlySalesChart") && document.getElementById("inventoryChart")) {
        initDashboard();
    }
});