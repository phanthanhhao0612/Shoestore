# Hướng Dẫn Quản Lý Hệ Thống Với Grafana

## 1. Giám Sát Toàn Bộ Hệ Thống Theo Thời Gian Thực

### Cấu Hình Thu Thập Dữ Liệu
Grafana sử dụng Prometheus để thu thập metrics từ các nguồn khác nhau:

```yaml
# prometheus/prometheus.yml
global:
  scrape_interval: 15s  # Thu thập dữ liệu mỗi 15 giây
  evaluation_interval: 15s

scrape_configs:
  # Giám sát hệ thống
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
  
  # Giám sát container
  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']
  
  # Giám sát ứng dụng .NET
  - job_name: 'dotnet-app'
    static_configs:
      - targets: ['your-app:5000']
    metrics_path: '/metrics'
```

### Metrics Quan Trọng Cần Giám Sát:
- **CPU Usage**: `node_cpu_seconds_total`
- **Memory Usage**: `node_memory_MemTotal_bytes`, `node_memory_MemAvailable_bytes`
- **Disk Usage**: `node_filesystem_size_bytes`, `node_filesystem_avail_bytes`
- **Network**: `node_network_receive_bytes_total`, `node_network_transmit_bytes_total`
- **Application Metrics**: Response time, error rate, throughput

## 2. Hiển Thị Dữ Liệu Dưới Dạng Biểu Đồ, Bảng, Cảnh Báo

### Dashboard Configuration
Tạo file dashboard JSON để hiển thị metrics:

```json
{
  "dashboard": {
    "title": "System Overview",
    "panels": [
      {
        "title": "CPU Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "100 - (avg by(instance) (irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
            "legendFormat": "CPU %"
          }
        ]
      },
      {
        "title": "Memory Usage",
        "type": "stat",
        "targets": [
          {
            "expr": "(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100",
            "legendFormat": "Memory %"
          }
        ]
      }
    ]
  }
}
```

### Các Loại Visualization:
- **Time Series**: Hiển thị dữ liệu theo thời gian
- **Stat**: Hiển thị giá trị hiện tại
- **Table**: Hiển thị dữ liệu dạng bảng
- **Gauge**: Hiển thị phần trăm
- **Heatmap**: Phân tích mật độ

## 3. Cảnh Báo Khi Vượt Ngưỡng

### Cấu Hình Alert Rules
```yaml
# alert-rules/alerts.yml
groups:
  - name: system_alerts
    rules:
      # Cảnh báo CPU > 90%
      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 90
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "CPU usage critical on {{ $labels.instance }}"
          description: "CPU usage is {{ $value }}% for 2 minutes"

      # Cảnh báo Memory > 90%
      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 90
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Memory usage critical on {{ $labels.instance }}"
          description: "Memory usage is {{ $value }}% for 2 minutes"

      # Cảnh báo Disk > 85%
      - alert: HighDiskUsage
        expr: (node_filesystem_size_bytes - node_filesystem_avail_bytes) / node_filesystem_size_bytes * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Disk usage high on {{ $labels.instance }}"
          description: "Disk usage is {{ $value }}% for 5 minutes"

      # Cảnh báo ứng dụng không phản hồi
      - alert: ApplicationDown
        expr: up{job="dotnet-app"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Application is down"
          description: "Application has been down for more than 1 minute"
```

### Cấu Hình AlertManager
```yaml
# alertmanager/alertmanager.yml
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'severity']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'team-notifications'

receivers:
  - name: 'team-notifications'
    email_configs:
      - to: 'admin@company.com'
        send_resolved: true
    webhook_configs:
      - url: 'http://slack-webhook-url'
        send_resolved: true
    pagerduty_configs:
      - service_key: 'your-pagerduty-key'
        send_resolved: true

inhibit_rules:
  # Ức chế cảnh báo warning khi có critical
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'instance']
```

## 4. Hỗ Trợ Ra Quyết Định Và Tìm Lỗi Nhanh

### Dashboard Templates
Tạo các dashboard chuyên biệt:

#### 1. System Overview Dashboard
- CPU, Memory, Disk usage
- Network traffic
- System load
- Uptime

#### 2. Application Dashboard
- Response time
- Error rate
- Throughput
- Database connections
- Cache hit rate

#### 3. Business Metrics Dashboard
- Orders per minute
- Revenue metrics
- User activity
- Conversion rates

### Query Optimization
```promql
# Tìm service chậm nhất
topk(5, rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m]))

# Tìm lỗi nhiều nhất
topk(5, rate(http_requests_total{status=~"5.."}[5m]))

# Phân tích trend
increase(http_requests_total[1h])
```

### Troubleshooting Workflow
1. **Phát hiện vấn đề**: Alert được kích hoạt
2. **Xác định scope**: Dashboard hiển thị metrics liên quan
3. **Phân tích root cause**: Drill-down vào chi tiết
4. **Giải quyết**: Thực hiện action cần thiết
5. **Verify**: Kiểm tra metrics trở về bình thường

## 5. Cấu Hình Nâng Cao

### Custom Metrics cho .NET App
```csharp
// Trong ứng dụng .NET
public class MetricsMiddleware
{
    private readonly Counter _requestCounter;
    private readonly Histogram _requestDuration;

    public MetricsMiddleware()
    {
        _requestCounter = Metrics.CreateCounter("http_requests_total", "Total HTTP requests");
        _requestDuration = Metrics.CreateHistogram("http_request_duration_seconds", "HTTP request duration");
    }
}
```

### Service Discovery
```yaml
# prometheus/prometheus.yml
scrape_configs:
  - job_name: 'dotnet-apps'
    consul_sd_configs:
      - server: 'consul:8500'
    relabel_configs:
      - source_labels: [__meta_consul_tags]
        regex: '.*app.*'
        action: keep
```

### Retention và Storage
```yaml
# prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

# Retention policy
storage:
  tsdb:
    retention.time: 30d
    retention.size: 50GB
```

## 6. Best Practices

### 1. Alert Design
- Sử dụng multiple thresholds (warning, critical)
- Tránh alert fatigue
- Group related alerts
- Sử dụng meaningful labels

### 2. Dashboard Design
- Keep it simple và focused
- Use appropriate visualizations
- Include context information
- Regular review và update

### 3. Performance
- Optimize queries
- Use recording rules cho complex queries
- Monitor Grafana performance
- Regular cleanup

### 4. Security
- Use authentication
- Implement RBAC
- Secure communication
- Regular updates

## 7. Monitoring Stack Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   .NET App  │───▶│ Prometheus  │───▶│   Grafana   │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       │                   ▼                   ▼
       │            ┌─────────────┐    ┌─────────────┐
       └───────────▶│AlertManager │    │  Dashboards │
                    └─────────────┘    └─────────────┘
                             │
                             ▼
                    ┌─────────────┐
                    │Notifications│
                    └─────────────┘
```

Với cấu hình này, Grafana sẽ cung cấp khả năng quản lý hệ thống toàn diện theo đúng yêu cầu của bạn. 