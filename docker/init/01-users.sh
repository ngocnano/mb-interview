#!/bin/bash
# Tạo hai tài khoản DB (SD-8) và đối tượng thư mục cho Data Pump (IS-10).
# Biến môi trường: ORACLE_PASSWORD (SYS), DB_OWNER_PASSWORD, DB_APP_PASSWORD.
set -euo pipefail

sqlplus -s "sys/${ORACLE_PASSWORD}@//localhost:1521/XEPDB1 as sysdba" <<EOF
WHENEVER SQLERROR EXIT FAILURE ROLLBACK
CREATE USER interview_owner IDENTIFIED BY "${DB_OWNER_PASSWORD}" QUOTA UNLIMITED ON USERS;
GRANT CREATE SESSION, CREATE TABLE, CREATE VIEW TO interview_owner;
CREATE USER interview_app IDENTIFIED BY "${DB_APP_PASSWORD}";
GRANT CREATE SESSION TO interview_app;
CREATE OR REPLACE DIRECTORY backup_dir AS '/opt/oracle/backups';
GRANT READ, WRITE ON DIRECTORY backup_dir TO interview_owner;
EXIT
EOF
