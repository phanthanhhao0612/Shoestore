# Hướng Dẫn Thực Hành Grafana Quản Lý Hệ Thống

## 1. Khởi Động Hệ Thống Monitoring

### Bước 1: Khởi động các service
```bash
# Khởi động toàn bộ stack
docker-compose up -d

# Kiểm tra trạng thái
docker-compose ps
```

### Bước 2: Truy cập Grafana
- URL: http://localhost:3000
- Username: admin
- Password: admin

## 2. Cấu Hình Dashboard

### Bước 1: Import Dashboard
1. Vào Grafana → Dashboards → Import
2. Upload file `grafana/dashboards/system-overview.json`
3. Chọn Prometheus làm data source
4. Import dashboard

### Bước 2: Tạo Dashboard Tùy Chỉnh
1. Tạo dashboard mới
2. Thêm panel cho CPU Usage:
   ```promql
   100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
   ```
3. Thêm panel cho Memory Usage:
   ```promql
   (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100
   ```

## 3. Thiết Lập Alerting

### Bước 1: Cấu Hình Alert Rules
1. Vào Alerting → Alert Rules
2. Tạo rule mới:
   - **Name**: High CPU Usage
   - **Query**: `100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 90`
   - **Duration**: 2m
   - **Severity**: Critical

### Bước 2: Cấu Hình Notification
1. Vào Alerting → Contact Points
2. Tạo contact point cho email:
   ```yaml
   name: email-notifications
   type: email
   settings:
     addresses: admin@company.com
   ```

## 4. Monitoring Workflow Thực Tế

### Scenario 1: Phát Hiện Vấn Đề CPU Cao

**Bước 1: Nhận Alert**
- Alert "High CPU Usage" được kích hoạt
- Email notification được gửi

**Bước 2: Phân Tích Dashboard**
1. Mở System Overview Dashboard
2. Kiểm tra CPU panel - thấy CPU > 90%
3. Kiểm tra các panel khác để tìm nguyên nhân

**Bước 3: Drill-down Investigation**
```promql
# Tìm process sử dụng CPU nhiều nhất
topk(5, rate(process_cpu_seconds_total[5m]))

# Kiểm tra load average
node_load1, node_load5, node_load15
```

**Bước 4: Giải Quyết**
- Restart service nếu cần
- Scale up resources
- Optimize code

### Scenario 2: Ứng Dụng Chậm

**Bước 1: Phát Hiện**
- Response time > 1s
- Error rate tăng

**Bước 2: Phân Tích**
```promql
# Tìm endpoint chậm nhất
topk(5, histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])))

# Kiểm tra database connections
dotnet_database_connections_active

# Kiểm tra memory usage
dotnet_total_memory_bytes
```

**Bước 3: Root Cause Analysis**
- Database connection pool exhausted
- Memory leak
- Slow query

### Scenario 3: Business Impact

**Bước 1: Monitor Business Metrics**
```promql
# Orders per minute
rate(orders_created_total[5m]) * 60

# Revenue per hour
rate(revenue_total[1h])

# Active users
dotnet_active_users_total
```

**Bước 2: Set Business Alerts**
- Alert khi không có đơn hàng mới trong 10 phút
- Alert khi revenue giảm đột ngột

## 5. Advanced Queries

### Performance Analysis
```promql
# Top 5 slowest endpoints
topk(5, histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])))

# Error rate by endpoint
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) * 100

# Memory usage trend
increase(dotnet_total_memory_bytes[1h])
```

### Capacity Planning
```promql
# Disk usage prediction
predict_linear(node_filesystem_avail_bytes[6h], 24 * 3600)

# Memory usage prediction
predict_linear(dotnet_total_memory_bytes[1h], 3600)
```

### Troubleshooting Queries
```promql
# Find bottlenecks
topk(10, rate(http_requests_total[5m]))

# Database performance
rate(sqlserver_connections_total[5m])
rate(sqlserver_requests_total[5m])

# Cache performance
rate(cache_hits_total[5m]) / (rate(cache_hits_total[5m]) + rate(cache_misses_total[5m]))
```

## 6. Dashboard Best Practices

### 1. Layout Design
- **Top Row**: Critical metrics (CPU, Memory, Disk)
- **Middle Row**: Application metrics (Response time, Error rate)
- **Bottom Row**: Business metrics (Orders, Revenue)

### 2. Visualization Choices
- **Time Series**: Cho metrics thay đổi theo thời gian
- **Stat**: Cho giá trị hiện tại quan trọng
- **Gauge**: Cho phần trăm
- **Table**: Cho danh sách top items

### 3. Color Coding
- **Green**: Normal (< 70%)
- **Yellow**: Warning (70-90%)
- **Red**: Critical (> 90%)

## 7. Alert Management

### Alert Hierarchy
1. **Critical**: System down, data loss
2. **Warning**: Performance degradation
3. **Info**: Business metrics

### Alert Fatigue Prevention
- Set appropriate thresholds
- Use different time windows
- Group related alerts
- Implement alert suppression

### Escalation Policy
```yaml
# alertmanager/alertmanager.yml
route:
  group_by: ['alertname', 'severity']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  
  # Escalation after 30 minutes
  routes:
    - match:
        severity: critical
      repeat_interval: 30m
      receiver: 'pager-duty'
```

## 8. Performance Optimization

### Query Optimization
```promql
# Bad: Complex query
rate(http_requests_total[1m]) * 60

# Good: Use recording rules
# recording_rules.yml
groups:
  - name: http_requests
    rules:
      - record: http_requests_per_minute
        expr: rate(http_requests_total[1m]) * 60
```

### Dashboard Performance
- Limit time range (last 1h instead of 7d)
- Use appropriate refresh intervals
- Avoid too many panels per dashboard

## 9. Security Considerations

### Authentication
```ini
# grafana/grafana.ini
[auth.anonymous]
enabled = false

[auth.basic]
enabled = true
```

### Data Source Security
- Use HTTPS for external data sources
- Implement network segmentation
- Regular security updates

## 10. Maintenance

### Regular Tasks
1. **Daily**: Check alerts, review dashboards
2. **Weekly**: Update thresholds, optimize queries
3. **Monthly**: Review retention policies, cleanup old data

### Backup Strategy
```bash
# Backup Grafana configuration
docker exec grafana tar czf /tmp/grafana-backup.tar.gz /etc/grafana

# Backup Prometheus data
docker exec prometheus tar czf /tmp/prometheus-backup.tar.gz /prometheus
```

Với hướng dẫn này, bạn có thể sử dụng Grafana để quản lý hệ thống một cách hiệu quả theo đúng yêu cầu đã nêu. 