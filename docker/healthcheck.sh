#!/bin/bash
# Kiểm tra sức khỏe của Oracle XE (IS-13): DB sẵn sàng VÀ lược đồ ứng dụng đã được tạo xong.
# Ảnh faststart báo sẵn sàng trước khi các script khởi tạo chạy xong, nên chỉ healthcheck.sh gốc là chưa đủ.
healthcheck.sh || exit 1
out=$(echo "select count(*) from criterion;" | sqlplus -s "interview_owner/\"${DB_OWNER_PASSWORD}\"@//localhost:1521/XEPDB1" 2>&1)
echo "$out" | grep -Eq '^[[:space:]]*[0-9]+[[:space:]]*$'
