# Hướng Dẫn Xem Phần Quản Lý Grafana

## 🚀 **Bước 1: Truy Cập Grafana**

### URL và Thông Tin Đăng Nhập:
- **URL**: http://localhost:3000
- **Username**: admin
- **Password**: admin

## 📊 **Bước 2: Giao Diện Quản Lý Chính**

### 1. **Dashboard Management (Quản Lý Dashboard)**

#### Cách Xem Dashboard:
1. **Vào menu bên trái** → Click "Dashboards"
2. **Chọn "Browse"** để xem tất cả dashboard
3. **Import dashboard** từ file JSON:
   - Click "Import" button
   - Upload file `grafana/dashboards/system-overview.json`
   - Chọn Prometheus làm data source
   - Click "Import"

#### Dashboard Quan Trọng:
- **System Overview**: CPU, Memory, Disk, Network
- **Application Metrics**: Response time, Error rate, Database
- **Business Dashboard**: Orders, Revenue, Users

### 2. **Alerting Management (Quản Lý Cảnh Báo)**

#### Xem Alerts:
1. **Vào menu bên trái** → Click "Alerting"
2. **Chọn "Alert Rules"** để xem tất cả rules
3. **Chọn "Contact Points"** để xem notification channels

#### Alert Rules Hiện Có:
```yaml
# System Alerts
- HighCPUUsage: CPU > 90% (Critical)
- HighMemoryUsage: Memory > 90% (Critical)
- HighDiskUsage: Disk > 85% (Warning)

# Application Alerts
- ApplicationDown: App không phản hồi (Critical)
- HighResponseTime: Response time > 1s (Warning)
- HighErrorRate: Error rate > 5% (Critical)
```

#### Cách Tạo Alert Mới:
1. **Vào Alerting** → "Alert Rules"
2. **Click "New Alert Rule"**
3. **Điền thông tin:**
   - **Name**: Tên alert
   - **Query**: PromQL query
   - **Duration**: Thời gian trigger
   - **Severity**: Critical/Warning/Info

### 3. **Data Sources (Nguồn Dữ Liệu)**

#### Xem Data Sources:
1. **Vào menu bên trái** → Click "Configuration" (⚙️)
2. **Chọn "Data Sources"**
3. **Xem Prometheus** đã được cấu hình

#### Cấu Hình Data Source:
```yaml
# Prometheus Configuration
Name: Prometheus
Type: prometheus
URL: http://prometheus:9090
Access: proxy
```

### 4. **Users & Permissions (Quản Lý Người Dùng)**

#### Xem Users:
1. **Vào menu bên trái** → Click "Configuration" (⚙️)
2. **Chọn "Users"**
3. **Xem danh sách users và roles**

#### Phân Quyền:
- **Admin**: Toàn quyền
- **Editor**: Có thể edit dashboard
- **Viewer**: Chỉ xem

## 🔍 **Bước 3: Monitoring Workflow Thực Tế**

### Scenario 1: Kiểm Tra Hệ Thống

#### 1. **Xem System Overview Dashboard:**
```
URL: http://localhost:3000/d/system-overview
```

**Các Panel Quan Trọng:**
- **CPU Usage**: Phần trăm sử dụng CPU
- **Memory Usage**: Phần trăm sử dụng RAM
- **Disk Usage**: Phần trăm sử dụng ổ cứng
- **Network Traffic**: Lưu lượng mạng

#### 2. **Xem Application Metrics:**
```
URL: http://localhost:3000/d/application-metrics
```

**Các Panel Quan Trọng:**
- **HTTP Request Rate**: Số request/giây
- **Response Time**: Thời gian phản hồi
- **Error Rate**: Tỷ lệ lỗi
- **Database Connections**: Kết nối database

### Scenario 2: Xử Lý Alert

#### 1. **Nhận Alert:**
- Email notification
- Slack message
- Dashboard hiển thị alert

#### 2. **Phân Tích Alert:**
1. **Vào Alerting** → "Alert Rules"
2. **Tìm alert đang trigger**
3. **Xem chi tiết alert**

#### 3. **Drill-down Investigation:**
```promql
# Tìm root cause
topk(5, rate(http_requests_total[5m]))
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

### Scenario 3: Tạo Dashboard Mới

#### 1. **Tạo Dashboard:**
1. **Vào Dashboards** → "New Dashboard"
2. **Thêm Panel** → "Add Panel"
3. **Chọn Visualization Type**

#### 2. **Cấu Hình Panel:**
```promql
# CPU Usage
100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Memory Usage
(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100
```

## 📈 **Bước 4: Advanced Monitoring Features**

### 1. **Query Builder (Trình Tạo Query)**

#### Cách Sử Dụng:
1. **Vào Explore** (🔍 icon)
2. **Chọn Data Source**: Prometheus
3. **Nhập PromQL query**
4. **Xem kết quả real-time**

#### Ví Dụ Queries:
```promql
# Top 5 endpoints chậm nhất
topk(5, histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])))

# Error rate theo endpoint
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) * 100

# Memory usage trend
increase(dotnet_total_memory_bytes[1h])
```

### 2. **Annotations (Ghi Chú)**

#### Cách Thêm Annotation:
1. **Trong Dashboard** → Click "Annotations"
2. **Thêm annotation** cho sự kiện quan trọng
3. **Hiển thị trên timeline**

### 3. **Variables (Biến)**

#### Cách Tạo Variables:
1. **Dashboard Settings** → "Variables"
2. **Thêm variable** cho instance, job, etc.
3. **Sử dụng trong queries**

## 🛠️ **Bước 5: Configuration Management**

### 1. **Grafana Configuration**

#### Xem Cấu Hình:
```bash
# Xem file config
docker exec monitoring-grafana cat /etc/grafana/grafana.ini
```

#### Cấu Hình Quan Trọng:
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

### 2. **Data Source Configuration**

#### Prometheus Settings:
```yaml
# prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
```

### 3. **Alert Rules Configuration**

#### Xem Alert Rules:
```bash
# Xem file alert rules
cat alert-rules/alerts.yml
```

## 📊 **Bước 6: Performance Monitoring**

### 1. **System Metrics Dashboard**

#### Các Metrics Quan Trọng:
- **CPU Usage**: Real-time percentage
- **Memory Usage**: Available vs Total
- **Disk Usage**: Space utilization
- **Network**: Traffic in/out
- **Load Average**: System load

### 2. **Application Metrics Dashboard**

#### Các Metrics Quan Trọng:
- **Response Time**: 95th percentile
- **Error Rate**: 4xx/5xx errors
- **Throughput**: Requests per second
- **Database**: Connection pool
- **Cache**: Hit rate

### 3. **Business Metrics Dashboard**

#### Các Metrics Quan Trọng:
- **Orders**: Per minute rate
- **Revenue**: Hourly trends
- **Users**: Active sessions
- **Conversion**: Success rate

## 🔧 **Bước 7: Troubleshooting**

### 1. **Kiểm Tra Service Status**

#### Docker Services:
```bash
# Kiểm tra status
docker-compose ps

# Xem logs
docker-compose logs grafana
docker-compose logs prometheus
```

### 2. **Kiểm Tra Data Source**

#### Prometheus Health:
```bash
# Kiểm tra Prometheus
curl http://localhost:9090/-/healthy

# Xem targets
curl http://localhost:9090/api/v1/targets
```

### 3. **Kiểm Tra Alerts**

#### Alert Status:
```bash
# Xem alerts
curl http://localhost:9090/api/v1/alerts
```

## 📋 **Bước 8: Best Practices**

### 1. **Dashboard Design**
- **Keep it simple**: Không quá nhiều panel
- **Use appropriate visualizations**: Time series cho trends
- **Color coding**: Green/Yellow/Red cho thresholds
- **Refresh intervals**: 5-10s cho real-time

### 2. **Alert Management**
- **Set appropriate thresholds**: Tránh alert fatigue
- **Use meaningful names**: Dễ hiểu
- **Group related alerts**: Tổ chức logic
- **Test alerts**: Verify trước khi deploy

### 3. **Performance Optimization**
- **Limit time range**: 1h thay vì 7d
- **Use recording rules**: Cho complex queries
- **Optimize queries**: Tránh expensive operations
- **Monitor Grafana itself**: Self-monitoring

## 🎯 **Kết Luận**

Với hướng dẫn này, bạn có thể:

1. **Xem dashboard** để monitor hệ thống real-time
2. **Quản lý alerts** để nhận thông báo khi có vấn đề
3. **Tạo dashboard mới** cho nhu cầu cụ thể
4. **Troubleshoot** khi có vấn đề
5. **Optimize performance** cho hệ thống monitoring

Grafana cung cấp một giao diện trực quan và mạnh mẽ để quản lý hệ thống monitoring một cách hiệu quả! 🚀 