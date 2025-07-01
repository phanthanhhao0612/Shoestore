

async function login(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email) {
        alert("Vui lòng nhập email!");
        return;
    }
    if (!password) {
        alert("Vui lòng nhập mật khẩu!");
        return;
    }

    const loginData = { email, password };

    try {
        const response = await fetch(`${baseUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`${errorData.message || "Email hoặc mật khẩu không đúng!"} - Chi tiết: ${errorData.detail || "Không có chi tiết"}`);
        }

        const result = await response.json();
        console.log("Phản hồi từ API:", result);

        const token = result.token;
        const role = result.role;
        const customerId = result.customerId;

        if (!token || !customerId) {
            throw new Error("Phản hồi từ server thiếu token hoặc customerId!");
        }

        localStorage.setItem("token", token);
        localStorage.setItem("userRole", role);
        localStorage.setItem("customerId", customerId);
        localStorage.setItem("isLoggedIn", JSON.stringify(true));
        localStorage.setItem("currentUser", JSON.stringify({ email, role }));
        console.log("localStorage sau khi đăng nhập:", {
            token: localStorage.getItem("token"),
            customerId: localStorage.getItem("customerId"),
            userRole: localStorage.getItem("userRole"),
            isLoggedIn: localStorage.getItem("isLoggedIn"),
            currentUser: localStorage.getItem("currentUser")
        });

        if (role === "admin") {
            alert("Đăng nhập thành công với vai trò Admin!");
            window.location.href = "admin.html";
        } else if (role === "customer") {
            alert("Đăng nhập thành công với vai trò Khách Hàng!");
            window.location.href = "index.html";
        }
    } catch (error) {
        console.error("Lỗi khi đăng nhập:", error.message);
        alert(`Có lỗi xảy ra: ${error.message}`);
    }
}