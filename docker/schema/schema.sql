-- Lược đồ sau U2 scoring-complete (đã gồm migration 002). Chạy bằng tài khoản chủ lược đồ INTERVIEW_OWNER.
-- Cột U2 (ket_luan, refer_*, diem_trung_binh) vẫn cho phép NULL để tương thích bài hoàn thành từ U1; API U2 bắt buộc kết luận.
-- DB đã chạy từ U1 nâng cấp bằng: node scripts/migrate.mjs
-- Trạng thái HĐPV lưu mã ASCII: DRAFT, SENT, CONFIRMED (Xác nhận), INPROGRESS, COMPLETED.

WHENEVER SQLERROR EXIT FAILURE ROLLBACK

CREATE TABLE interviewer (
  employed_id VARCHAR2(50 CHAR)  NOT NULL,
  ten         VARCHAR2(200 CHAR) NOT NULL,
  job         VARCHAR2(200 CHAR),
  don_vi      VARCHAR2(200 CHAR),
  email       VARCHAR2(255 CHAR),
  CONSTRAINT pk_interviewer PRIMARY KEY (employed_id)
);

CREATE TABLE user_account (
  user_id       VARCHAR2(36 CHAR)  NOT NULL,
  email         VARCHAR2(255 CHAR) NOT NULL,
  password_hash VARCHAR2(100 CHAR) NOT NULL,
  employed_id   VARCHAR2(50 CHAR)  NOT NULL,
  ho_ten        VARCHAR2(200 CHAR) NOT NULL,
  trang_thai    VARCHAR2(10 CHAR)  DEFAULT 'ACTIVE' NOT NULL,
  CONSTRAINT pk_user_account PRIMARY KEY (user_id),
  CONSTRAINT uq_user_email UNIQUE (email),
  CONSTRAINT fk_user_interviewer FOREIGN KEY (employed_id) REFERENCES interviewer (employed_id),
  CONSTRAINT ck_user_trang_thai CHECK (trang_thai IN ('ACTIVE', 'LOCKED'))
);

CREATE TABLE login_throttle (
  email        VARCHAR2(255 CHAR) NOT NULL,
  so_lan_sai   NUMBER(3)          DEFAULT 0 NOT NULL,
  khoa_den     TIMESTAMP,
  lan_sai_cuoi TIMESTAMP,
  CONSTRAINT pk_login_throttle PRIMARY KEY (email),
  CONSTRAINT ck_throttle_count CHECK (so_lan_sai >= 0)
);

CREATE TABLE job_position (
  ma_vi_tri  VARCHAR2(50 CHAR)  NOT NULL,
  job        VARCHAR2(200 CHAR) NOT NULL,
  dvql       VARCHAR2(200 CHAR) NOT NULL,
  dvtt1      VARCHAR2(200 CHAR),
  dvtt2      VARCHAR2(200 CHAR),
  dvtt3      VARCHAR2(200 CHAR),
  trang_thai VARCHAR2(10 CHAR)  DEFAULT 'ACTIVE' NOT NULL,
  CONSTRAINT pk_job_position PRIMARY KEY (ma_vi_tri),
  CONSTRAINT ck_position_trang_thai CHECK (trang_thai IN ('ACTIVE', 'INACTIVE'))
);

CREATE TABLE candidate (
  ma_ung_vien VARCHAR2(50 CHAR)   NOT NULL,
  ten         VARCHAR2(200 CHAR)  NOT NULL,
  ma_vi_tri   VARCHAR2(50 CHAR)   NOT NULL,
  sdt         VARCHAR2(30 CHAR),
  email       VARCHAR2(255 CHAR),
  ngay_sinh   DATE,
  gioi_tinh   VARCHAR2(20 CHAR),
  kinh_nghiem VARCHAR2(1000 CHAR),
  trinh_do    VARCHAR2(200 CHAR),
  CONSTRAINT pk_candidate PRIMARY KEY (ma_ung_vien),
  CONSTRAINT fk_candidate_position FOREIGN KEY (ma_vi_tri) REFERENCES job_position (ma_vi_tri)
);

CREATE TABLE interview_panel (
  ma_hdpv      VARCHAR2(50 CHAR)  NOT NULL,
  ten          VARCHAR2(200 CHAR) NOT NULL,
  dia_diem     VARCHAR2(300 CHAR),
  ngay         DATE               NOT NULL,
  hinh_thuc    VARCHAR2(10 CHAR)  NOT NULL,
  da_gui_email NUMBER(1)          DEFAULT 0 NOT NULL,
  trang_thai   VARCHAR2(12 CHAR)  NOT NULL,
  CONSTRAINT pk_interview_panel PRIMARY KEY (ma_hdpv),
  CONSTRAINT ck_panel_hinh_thuc CHECK (hinh_thuc IN ('Online', 'Offline')),
  CONSTRAINT ck_panel_trang_thai CHECK (trang_thai IN ('DRAFT', 'SENT', 'CONFIRMED', 'INPROGRESS', 'COMPLETED'))
);

CREATE TABLE panel_candidate (
  id            VARCHAR2(36 CHAR) NOT NULL,
  ma_hdpv       VARCHAR2(50 CHAR) NOT NULL,
  ma_ung_vien   VARCHAR2(50 CHAR) NOT NULL,
  tu_thoi_gian  VARCHAR2(5 CHAR)  NOT NULL,
  den_thoi_gian VARCHAR2(5 CHAR)  NOT NULL,
  xac_nhan      CHAR(1)           NOT NULL,
  CONSTRAINT pk_panel_candidate PRIMARY KEY (id),
  CONSTRAINT uq_panel_candidate UNIQUE (ma_hdpv, ma_ung_vien),
  CONSTRAINT fk_pc_panel FOREIGN KEY (ma_hdpv) REFERENCES interview_panel (ma_hdpv),
  CONSTRAINT fk_pc_candidate FOREIGN KEY (ma_ung_vien) REFERENCES candidate (ma_ung_vien),
  CONSTRAINT ck_pc_tu CHECK (REGEXP_LIKE(tu_thoi_gian, '^([01][0-9]|2[0-3]):[0-5][0-9]$')),
  CONSTRAINT ck_pc_den CHECK (REGEXP_LIKE(den_thoi_gian, '^([01][0-9]|2[0-3]):[0-5][0-9]$')),
  CONSTRAINT ck_pc_order CHECK (tu_thoi_gian < den_thoi_gian),
  CONSTRAINT ck_pc_xac_nhan CHECK (xac_nhan IN ('Y', 'N'))
);

CREATE TABLE panel_interviewer (
  id            VARCHAR2(36 CHAR) NOT NULL,
  ma_hdpv       VARCHAR2(50 CHAR) NOT NULL,
  ma_cbql       VARCHAR2(50 CHAR) NOT NULL,
  tu_thoi_gian  VARCHAR2(5 CHAR),
  den_thoi_gian VARCHAR2(5 CHAR),
  xac_nhan      CHAR(1),
  CONSTRAINT pk_panel_interviewer PRIMARY KEY (id),
  CONSTRAINT uq_panel_interviewer UNIQUE (ma_hdpv, ma_cbql),
  CONSTRAINT fk_pi_panel FOREIGN KEY (ma_hdpv) REFERENCES interview_panel (ma_hdpv),
  CONSTRAINT fk_pi_interviewer FOREIGN KEY (ma_cbql) REFERENCES interviewer (employed_id),
  CONSTRAINT ck_pi_xac_nhan CHECK (xac_nhan IS NULL OR xac_nhan IN ('Y', 'N'))
);

CREATE TABLE criterion (
  ma_tieu_chi   VARCHAR2(20 CHAR)  NOT NULL,
  ten_tieu_chi  VARCHAR2(200 CHAR) NOT NULL,
  diem_toi_thieu NUMBER(1)         NOT NULL,
  diem_toi_da   NUMBER(1)          NOT NULL,
  thu_tu        NUMBER(5)          NOT NULL,
  trang_thai    VARCHAR2(10 CHAR)  DEFAULT 'ACTIVE' NOT NULL,
  CONSTRAINT pk_criterion PRIMARY KEY (ma_tieu_chi),
  CONSTRAINT ck_criterion_scale CHECK (diem_toi_thieu >= 1 AND diem_toi_thieu < diem_toi_da AND diem_toi_da <= 5),
  CONSTRAINT ck_criterion_trang_thai CHECK (trang_thai IN ('ACTIVE', 'INACTIVE'))
);

CREATE TABLE interview_evaluation (
  evaluation_id   VARCHAR2(36 CHAR)   NOT NULL,
  user_id         VARCHAR2(36 CHAR)   NOT NULL,
  ma_hdpv         VARCHAR2(50 CHAR)   NOT NULL,
  ma_ung_vien     VARCHAR2(50 CHAR)   NOT NULL,
  nhan_xet        VARCHAR2(2000 CHAR),
  idempotency_key VARCHAR2(36 CHAR)   NOT NULL,
  trang_thai      VARCHAR2(10 CHAR)   DEFAULT 'SUBMITTED' NOT NULL,
  submitted_at    TIMESTAMP           NOT NULL,
  ket_luan        VARCHAR2(10 CHAR),
  refer_ma_vi_tri VARCHAR2(50 CHAR),
  refer_ly_do     VARCHAR2(500 CHAR),
  diem_trung_binh NUMBER(4, 2),
  CONSTRAINT pk_interview_evaluation PRIMARY KEY (evaluation_id),
  CONSTRAINT uq_eval_triple UNIQUE (user_id, ma_hdpv, ma_ung_vien),
  CONSTRAINT uq_eval_idem UNIQUE (user_id, idempotency_key),
  CONSTRAINT fk_eval_user FOREIGN KEY (user_id) REFERENCES user_account (user_id),
  CONSTRAINT fk_eval_panel FOREIGN KEY (ma_hdpv) REFERENCES interview_panel (ma_hdpv),
  CONSTRAINT fk_eval_candidate FOREIGN KEY (ma_ung_vien) REFERENCES candidate (ma_ung_vien),
  CONSTRAINT fk_eval_refer FOREIGN KEY (refer_ma_vi_tri) REFERENCES job_position (ma_vi_tri),
  CONSTRAINT ck_eval_trang_thai CHECK (trang_thai IN ('SUBMITTED')),
  CONSTRAINT ck_eval_ket_luan CHECK (ket_luan IS NULL OR ket_luan IN ('DAT', 'LOAI', 'CAN_NHAC', 'KHAC')),
  CONSTRAINT ck_eval_refer_khac CHECK (refer_ma_vi_tri IS NULL OR (ket_luan IS NOT NULL AND ket_luan = 'KHAC')),
  CONSTRAINT ck_eval_refer_ly_do CHECK (refer_ly_do IS NULL OR refer_ma_vi_tri IS NOT NULL)
);

CREATE TABLE evaluation_score (
  evaluation_id VARCHAR2(36 CHAR) NOT NULL,
  ma_tieu_chi   VARCHAR2(20 CHAR) NOT NULL,
  diem          NUMBER(1)         NOT NULL,
  CONSTRAINT pk_evaluation_score PRIMARY KEY (evaluation_id, ma_tieu_chi),
  CONSTRAINT fk_score_eval FOREIGN KEY (evaluation_id) REFERENCES interview_evaluation (evaluation_id),
  CONSTRAINT fk_score_criterion FOREIGN KEY (ma_tieu_chi) REFERENCES criterion (ma_tieu_chi)
);

-- Theo dõi migration (BR9.2). DB dựng mới đã gồm kết quả của 002 nên đánh dấu 002 là đã áp dụng.
CREATE TABLE schema_migrations (
  id         VARCHAR2(100 CHAR) NOT NULL,
  applied_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT pk_schema_migrations PRIMARY KEY (id)
);
INSERT INTO schema_migrations (id) VALUES ('002-u2-constraints');
COMMIT;

-- Chỉ mục theo PD-3
CREATE INDEX idx_pi_cbql ON panel_interviewer (ma_cbql, ma_hdpv);
CREATE INDEX idx_pc_panel ON panel_candidate (ma_hdpv, xac_nhan, tu_thoi_gian, ma_ung_vien);
CREATE INDEX idx_pc_candidate ON panel_candidate (ma_ung_vien);
CREATE INDEX idx_candidate_position ON candidate (ma_vi_tri);
CREATE INDEX idx_criterion_active ON criterion (trang_thai, thu_tu);
CREATE INDEX idx_eval_user_panel ON interview_evaluation (user_id, ma_hdpv);
CREATE INDEX idx_user_employed ON user_account (employed_id);

-- Quyền tối thiểu cho tài khoản chạy ứng dụng (SD-8)
GRANT SELECT ON interviewer TO interview_app;
GRANT SELECT ON user_account TO interview_app;
GRANT SELECT ON job_position TO interview_app;
GRANT SELECT ON candidate TO interview_app;
GRANT SELECT ON interview_panel TO interview_app;
GRANT SELECT ON panel_candidate TO interview_app;
GRANT SELECT ON panel_interviewer TO interview_app;
GRANT SELECT ON criterion TO interview_app;
GRANT SELECT, INSERT ON interview_evaluation TO interview_app;
GRANT SELECT, INSERT ON evaluation_score TO interview_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON login_throttle TO interview_app;

EXIT
