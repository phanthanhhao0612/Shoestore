# 🎯 Hướng Dẫn Xem Phần Quản Lý Grafana - Trực Quan

## 🚀 **BƯỚC 1: TRUY CẬP GRAFANA**

### 📱 **Thông Tin Đăng Nhập:**
```
🌐 URL: http://localhost:3000
👤 Username: admin
🔑 Password: admin
```

### 🖥️ **Giao Diện Chính:**
```
┌─────────────────────────────────────────────────────────┐
│                    GRAFANA DASHBOARD                    │
├─────────────────────────────────────────────────────────┤
│ 🏠 Home  📊 Dashboards  🔍 Explore  🚨 Alerting  ⚙️ Config │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                    MAIN CONTENT                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 📊 **BƯỚC 2: DASHBOARD MANAGEMENT**

### 🎯 **Cách Xem Dashboard:**

#### 1. **Vào Dashboards:**
```
Menu bên trái → 📊 Dashboards → Browse
```

#### 2. **Import Dashboard:**
```
📊 Dashboards → ➕ Import → Upload JSON file
```

#### 3. **Dashboard Templates Có Sẵn:**
```
📁 grafana/dashboards/
├── system-overview.json     # CPU, Memory, Disk, Network
└── application-metrics.json # Response time, Error rate
```

### 📈 **System Overview Dashboard:**
```
┌─────────────────────────────────────────────────────────┐
│                    SYSTEM OVERVIEW                      │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│ │   CPU 90%   │ │ Memory 75%  │ │ Disk 60%    │        │
│ │   ⚠️ WARN    │ │   ✅ OK      │ │   ✅ OK      │        │
│ └─────────────┘ └─────────────┘ └─────────────┘        │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│ │ Network     │ │ Load Avg    │ │ Uptime      │        │
│ │ 1.2 MB/s    │ │ 2.5         │ │ 15 days     │        │
│ └─────────────┘ └─────────────┘ └─────────────┘        │
└─────────────────────────────────────────────────────────┘
```

### 📊 **Application Metrics Dashboard:**
```
┌─────────────────────────────────────────────────────────┐
│                 APPLICATION METRICS                     │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│ │ Request Rate│ │ Response    │ │ Error Rate  │        │
│ │ 150 req/s   │ │ Time 0.3s   │ │ 2.5%        │        │
│ └─────────────┘ └─────────────┘ └─────────────┘        │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│ │ DB Conn     │ │ Cache Hit   │ │ Active      │        │
│ │ 25/100      │ │ Rate 85%    │ │ Users 150   │        │
│ └─────────────┘ └─────────────┘ └─────────────┘        │
└─────────────────────────────────────────────────────────┘
```

## 🚨 **BƯỚC 3: ALERTING MANAGEMENT**

### 🎯 **Cách Xem Alerts:**

#### 1. **Vào Alerting:**
```
Menu bên trái → 🚨 Alerting → Alert Rules
```

#### 2. **Alert Rules Hiện Có:**
```
┌─────────────────────────────────────────────────────────┐
│                    ALERT RULES                         │
├─────────────────────────────────────────────────────────┤
│ 🔴 HighCPUUsage     │ CPU > 90% │ Critical │ Active   │
│ 🔴 HighMemoryUsage  │ Mem > 90% │ Critical │ Active   │
│ 🟡 HighDiskUsage    │ Disk > 85%│ Warning  │ Inactive │
│ 🔴 ApplicationDown  │ App Down  │ Critical │ Inactive │
│ 🟡 HighResponseTime │ RT > 1s   │ Warning  │ Inactive │
└─────────────────────────────────────────────────────────┘
```

#### 3. **Alert Details:**
```
┌─────────────────────────────────────────────────────────┐
│                 ALERT: HighCPUUsage                    │
├─────────────────────────────────────────────────────────┤
│ Status: 🔴 FIRING                                      │
│ Severity: Critical                                     │
│ Duration: 2m 30s                                       │
│ Value: 95.2%                                           │
│ Instance: server-01                                    │
├─────────────────────────────────────────────────────────┤
│ Description: CPU usage is 95.2% for 2 minutes         │
│ Action: Check running processes, restart if needed     │
└─────────────────────────────────────────────────────────┘
```

### 📧 **Contact Points (Notifications):**
```
┌─────────────────────────────────────────────────────────┐
│                  CONTACT POINTS                        │
├─────────────────────────────────────────────────────────┤
│ 📧 Email Notifications                                 │
│    To: admin@company.com                              │
│    Send Resolved: ✅                                   │
├─────────────────────────────────────────────────────────┤
│ 💬 Slack Webhook                                      │
│    URL: https://hooks.slack.com/...                   │
│    Channel: #alerts                                   │
├─────────────────────────────────────────────────────────┤
│ 📱 PagerDuty                                          │
│    Service Key: your-key                               │
│    Escalation: 30m                                    │
└─────────────────────────────────────────────────────────┘
```

## ⚙️ **BƯỚC 4: DATA SOURCES**

### 🎯 **Cách Xem Data Sources:**

#### 1. **Vào Configuration:**
```
Menu bên trái → ⚙️ Configuration → Data Sources
```

#### 2. **Prometheus Configuration:**
```
┌─────────────────────────────────────────────────────────┐
│                  DATA SOURCES                          │
├─────────────────────────────────────────────────────────┤
│ 📊 Prometheus                                         │
│    Type: prometheus                                   │
│    URL: http://prometheus:9090                        │
│    Access: proxy                                       │
│    Status: ✅ Connected                                │
├─────────────────────────────────────────────────────────┤
│ 📈 Node Exporter                                      │
│    Type: prometheus                                   │
│    URL: http://node-exporter:9100                     │
│    Status: ✅ Connected                                │
└─────────────────────────────────────────────────────────┘
```

## 👥 **BƯỚC 5: USERS & PERMISSIONS**

### 🎯 **Cách Xem Users:**

#### 1. **Vào Users:**
```
Menu bên trái → ⚙️ Configuration → Users
```

#### 2. **User Management:**
```
┌─────────────────────────────────────────────────────────┐
│                     USERS                              │
├─────────────────────────────────────────────────────────┤
│ 👤 admin                                              │
│    Role: Admin                                        │
│    Status: ✅ Active                                   │
│    Last Login: 2 hours ago                            │
├─────────────────────────────────────────────────────────┤
│ 👤 viewer                                             │
│    Role: Viewer                                       │
│    Status: ✅ Active                                   │
│    Last Login: 1 day ago                              │
├─────────────────────────────────────────────────────────┤
│ 👤 editor                                             │
│    Role: Editor                                       │
│    Status: ✅ Active                                   │
│    Last Login: 3 hours ago                            │
└─────────────────────────────────────────────────────────┘
```

#### 3. **Permission Levels:**
```
┌─────────────────────────────────────────────────────────┐
│                  PERMISSIONS                           │
├─────────────────────────────────────────────────────────┤
│ 👑 Admin                                              │
│    ✅ View dashboards                                 │
│    ✅ Edit dashboards                                 │
│    ✅ Create dashboards                               │
│    ✅ Manage users                                    │
│    ✅ Configure system                                │
├─────────────────────────────────────────────────────────┤
│ ✏️ Editor                                             │
│    ✅ View dashboards                                 │
│    ✅ Edit dashboards                                 │
│    ✅ Create dashboards                               │
│    ❌ Manage users                                    │
│    ❌ Configure system                                │
├─────────────────────────────────────────────────────────┤
│ 👁️ Viewer                                            │
│    ✅ View dashboards                                 │
│    ❌ Edit dashboards                                 │
│    ❌ Create dashboards                               │
│    ❌ Manage users                                    │
│    ❌ Configure system                                │
└─────────────────────────────────────────────────────────┘
```

## 🔍 **BƯỚC 6: EXPLORE (QUERY BUILDER)**

### 🎯 **Cách Sử Dụng Explore:**

#### 1. **Vào Explore:**
```
Menu bên trái → 🔍 Explore
```

#### 2. **Query Builder Interface:**
```
┌─────────────────────────────────────────────────────────┐
│                      EXPLORE                           │
├─────────────────────────────────────────────────────────┤
│ Data Source: 📊 Prometheus                            │
├─────────────────────────────────────────────────────────┤
│ Query:                                                │
│ 100 - (avg by(instance) (irate(node_cpu_seconds_total │
│ {mode="idle"}[5m])) * 100)                           │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │                GRAPH RESULTS                        │ │
│ │  CPU Usage: 45.2%                                  │ │
│ │  Trend: ↗️ Increasing                              │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

#### 3. **Ví Dụ Queries:**
```
┌─────────────────────────────────────────────────────────┐
│                    SAMPLE QUERIES                      │
├─────────────────────────────────────────────────────────┤
│ 🔥 CPU Usage:                                        │
│ 100 - (avg by(instance) (irate(node_cpu_seconds_total │
│ {mode="idle"}[5m])) * 100)                           │
├─────────────────────────────────────────────────────────┤
│ 💾 Memory Usage:                                     │
│ (node_memory_MemTotal_bytes - node_memory_MemAvailable│
│ _bytes) / node_memory_MemTotal_bytes * 100            │
├─────────────────────────────────────────────────────────┤
│ 🚀 Request Rate:                                     │
│ rate(http_requests_total[5m])                         │
├─────────────────────────────────────────────────────────┤
│ ⏱️ Response Time:                                    │
│ histogram_quantile(0.95, rate(http_request_duration_  │
│ seconds_bucket[5m]))                                  │
└─────────────────────────────────────────────────────────┘
```

## 🛠️ **BƯỚC 7: CONFIGURATION FILES**

### 📁 **Files Cấu Hình:**
```
📁 Project Root/
├── 📄 grafana/grafana.ini              # Grafana config
├── 📄 prometheus/prometheus.yml         # Prometheus config
├── 📄 alert-rules/alerts.yml           # Alert rules
├── 📄 alertmanager/alertmanager.yml    # Notification config
├── 📄 grafana/dashboards/              # Dashboard templates
│   ├── 📄 system-overview.json
│   └── 📄 application-metrics.json
└── 📄 docker-compose.yml               # Service orchestration
```

### 🔧 **Cấu Hình Quan Trọng:**

#### Grafana Configuration:
```ini
[server]
http_port = 3000
domain = localhost

[security]
admin_user = admin
admin_password = admin

[auth.anonymous]
enabled = false
```

#### Prometheus Configuration:
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
```

## 📊 **BƯỚC 8: MONITORING WORKFLOW**

### 🎯 **Scenario 1: Kiểm Tra Hệ Thống**
```
1. 📊 Mở System Overview Dashboard
2. 🔍 Kiểm tra CPU, Memory, Disk usage
3. 📈 Xem Network traffic trends
4. ⚠️ Xem alerts nếu có
```

### 🚨 **Scenario 2: Xử Lý Alert**
```
1. 📧 Nhận alert notification
2. 🔍 Vào Alerting → Alert Rules
3. 📊 Tìm alert đang trigger
4. 🔬 Drill-down investigation
5. 🛠️ Thực hiện action cần thiết
```

### 📈 **Scenario 3: Tạo Dashboard Mới**
```
1. ➕ Vào Dashboards → New Dashboard
2. 📊 Thêm Panel → Add Panel
3. 🔍 Cấu hình query
4. 🎨 Chọn visualization type
5. 💾 Save dashboard
```

## 🎯 **QUICK START CHECKLIST**

### ✅ **Bước 1: Truy Cập**
- [ ] Mở browser: http://localhost:3000
- [ ] Login: admin/admin
- [ ] Xác nhận kết nối thành công

### ✅ **Bước 2: Import Dashboard**
- [ ] Vào Dashboards → Import
- [ ] Upload system-overview.json
- [ ] Chọn Prometheus data source
- [ ] Import thành công

### ✅ **Bước 3: Xem Alerts**
- [ ] Vào Alerting → Alert Rules
- [ ] Xem danh sách alert rules
- [ ] Kiểm tra alert status

### ✅ **Bước 4: Test Explore**
- [ ] Vào Explore
- [ ] Chọn Prometheus data source
- [ ] Test query: CPU usage
- [ ] Xem kết quả real-time

### ✅ **Bước 5: Kiểm Tra Configuration**
- [ ] Vào Configuration → Data Sources
- [ ] Xác nhận Prometheus connected
- [ ] Vào Configuration → Users
- [ ] Xem user permissions

## 🎉 **KẾT LUẬN**

Với hướng dẫn này, bạn có thể:

1. **📊 Xem dashboard** để monitor hệ thống real-time
2. **🚨 Quản lý alerts** để nhận thông báo khi có vấn đề
3. **🔍 Sử dụng Explore** để test queries
4. **👥 Quản lý users** và permissions
5. **⚙️ Cấu hình system** theo nhu cầu

**Grafana cung cấp giao diện trực quan và mạnh mẽ để quản lý hệ thống monitoring!** 🚀 