#!/bin/bash

# Grafana Admin Demo Script
# Hướng dẫn xem phần quản lý của Grafana

echo "🚀 GRAFANA ADMIN DEMO"
echo "======================"

# Kiểm tra services
echo "📊 Kiểm tra trạng thái services..."
docker-compose ps

echo ""
echo "🔍 Kiểm tra Grafana health..."
curl -s http://localhost:3000/api/health || echo "Grafana chưa sẵn sàng"

echo ""
echo "📈 Kiểm tra Prometheus health..."
curl -s http://localhost:9090/-/healthy || echo "Prometheus chưa sẵn sàng"

echo ""
echo "🎯 GRAFANA ADMIN INTERFACE"
echo "=========================="
echo ""
echo "1. 📊 DASHBOARD MANAGEMENT"
echo "   URL: http://localhost:3000"
echo "   Login: admin/admin"
echo "   - Vào Dashboards → Browse"
echo "   - Import dashboard từ file JSON"
echo "   - Xem System Overview và Application Metrics"
echo ""

echo "2. 🚨 ALERTING MANAGEMENT"
echo "   - Vào Alerting → Alert Rules"
echo "   - Xem các alert rules đã cấu hình:"
echo "     * HighCPUUsage (CPU > 90%)"
echo "     * HighMemoryUsage (Memory > 90%)"
echo "     * ApplicationDown (App không phản hồi)"
echo "     * HighResponseTime (Response time > 1s)"
echo ""

echo "3. ⚙️ DATA SOURCES"
echo "   - Vào Configuration → Data Sources"
echo "   - Xem Prometheus đã được cấu hình"
echo "   - URL: http://prometheus:9090"
echo ""

echo "4. 👥 USERS & PERMISSIONS"
echo "   - Vào Configuration → Users"
echo "   - Xem danh sách users và roles"
echo "   - Admin: Toàn quyền"
echo "   - Editor: Có thể edit dashboard"
echo "   - Viewer: Chỉ xem"
echo ""

echo "5. 🔍 EXPLORE (Query Builder)"
echo "   - Vào Explore (🔍 icon)"
echo "   - Chọn Data Source: Prometheus"
echo "   - Thử các queries:"
echo "     * CPU Usage: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)"
echo "     * Memory Usage: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100"
echo ""

echo "6. 📋 DASHBOARD TEMPLATES"
echo "   Files có sẵn:"
echo "   - grafana/dashboards/system-overview.json"
echo "   - grafana/dashboards/application-metrics.json"
echo ""

echo "7. 🛠️ CONFIGURATION FILES"
echo "   - grafana/grafana.ini: Cấu hình Grafana"
echo "   - prometheus/prometheus.yml: Cấu hình Prometheus"
echo "   - alert-rules/alerts.yml: Alert rules"
echo "   - alertmanager/alertmanager.yml: Notification config"
echo ""

echo "8. 📊 MONITORING WORKFLOW"
echo "   Scenario 1: Kiểm tra hệ thống"
echo "   - Xem System Overview Dashboard"
echo "   - Kiểm tra CPU, Memory, Disk usage"
echo "   - Xem Network traffic"
echo ""

echo "   Scenario 2: Xử lý alert"
echo "   - Nhận alert notification"
echo "   - Vào Alerting → Alert Rules"
echo "   - Tìm alert đang trigger"
echo "   - Drill-down investigation"
echo ""

echo "   Scenario 3: Tạo dashboard mới"
echo "   - Vào Dashboards → New Dashboard"
echo "   - Thêm Panel → Add Panel"
echo "   - Cấu hình query và visualization"
echo ""

echo "9. 🔧 TROUBLESHOOTING"
echo "   Kiểm tra logs:"
echo "   - docker-compose logs grafana"
echo "   - docker-compose logs prometheus"
echo "   - docker-compose logs alertmanager"
echo ""

echo "10. 📈 ADVANCED FEATURES"
echo "    - Annotations: Ghi chú trên timeline"
echo "    - Variables: Biến trong dashboard"
echo "    - Recording Rules: Tối ưu queries"
echo "    - Alert Suppression: Tránh alert fatigue"
echo ""

echo "🎯 QUICK START GUIDE"
echo "==================="
echo "1. Mở browser: http://localhost:3000"
echo "2. Login: admin/admin"
echo "3. Import dashboard: grafana/dashboards/system-overview.json"
echo "4. Vào Alerting → Alert Rules để xem alerts"
echo "5. Vào Explore để test queries"
echo ""

echo "📚 DOCUMENTATION"
echo "================"
echo "- GRAFANA_ADMIN_GUIDE.md: Hướng dẫn chi tiết"
echo "- GRAFANA_MANAGEMENT_GUIDE.md: Quản lý hệ thống"
echo "- GRAFANA_PRACTICAL_GUIDE.md: Thực hành"
echo "- GRAFANA_MANAGEMENT_SUMMARY.md: Tóm tắt"
echo ""

echo "✅ Demo hoàn tất! Hãy truy cập http://localhost:3000 để bắt đầu." 