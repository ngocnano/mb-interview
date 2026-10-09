-- Migration 002 (U2 scoring-complete): chạy bằng `node scripts/migrate.mjs` với tài khoản chủ lược đồ.
-- Các lệnh cách nhau bằng một dòng chỉ có dấu "/". Mỗi lệnh chỉ thêm hoặc điền bù, không xóa dữ liệu (BR9.1..BR9.3).

-- Điền bù điểm trung bình cho bài hoàn thành từ U1 theo đúng công thức: trung bình các điểm quy về thang 5, làm tròn nửa lên hai chữ số.
update interview_evaluation e
   set diem_trung_binh = (
         select round(avg(s.diem * 5 / c.diem_toi_da), 2)
           from evaluation_score s
           join criterion c on c.ma_tieu_chi = s.ma_tieu_chi
          where s.evaluation_id = e.evaluation_id)
 where e.diem_trung_binh is null
/
-- Refer chỉ có khi kết luận là KHAC.
alter table interview_evaluation
  add constraint ck_eval_refer_khac check (refer_ma_vi_tri is null or (ket_luan is not null and ket_luan = 'KHAC'))
/
-- Lý do refer chỉ có khi đã chọn vị trí refer.
alter table interview_evaluation
  add constraint ck_eval_refer_ly_do check (refer_ly_do is null or refer_ma_vi_tri is not null)
/
