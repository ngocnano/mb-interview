#!/bin/bash
# Tạo bảng, ràng buộc, chỉ mục và cấp quyền bằng tài khoản chủ lược đồ.
set -euo pipefail

sqlplus -s "interview_owner/\"${DB_OWNER_PASSWORD}\"@//localhost:1521/XEPDB1" @/opt/oracle/schema/schema.sql
