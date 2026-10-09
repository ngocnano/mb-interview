/// Mọi chuỗi chữ tiếng Việt của app nằm ở một nơi (NFR-9, khả năng đa ngôn ngữ về sau).
class S {
  // Chung
  static const retry = 'Thử lại';
  static const loading = 'Đang tải…';
  static const errorNetwork = 'Không kết nối được máy chủ, vui lòng thử lại';
  static const errorUnavailable =
      'Hệ thống tạm thời không khả dụng, vui lòng thử lại';
  static const errorGeneric = 'Có lỗi xảy ra, vui lòng thử lại';
  static const errorCodePrefix = 'Mã lỗi';

  // Đăng nhập (S1)
  static const loginTitle = 'Đăng nhập';
  static const email = 'Email';
  static const password = 'Mật khẩu';
  static const showPassword = 'Hiện mật khẩu';
  static const hidePassword = 'Ẩn mật khẩu';
  static const emailInvalid = 'Email không đúng định dạng';
  static const passwordRequired = 'Vui lòng nhập mật khẩu';
  static const invalidCredentials = 'Email hoặc mật khẩu không đúng';
  static const accountLocked = 'Tài khoản đã bị khóa';
  static const loginThrottled = 'Đăng nhập tạm khóa, thử lại sau 15 phút';

  // Danh sách HĐPV (S2)
  static const panelsTitle = 'Hội đồng phỏng vấn';
  static const panelsEmpty =
      'Bạn chưa được gán vào hội đồng phỏng vấn nào đang diễn ra';
  static String candidateCount(int n) => '$n ứng viên';

  // Danh sách ứng viên (S3)
  static const candidatesEmpty = 'Chưa có ứng viên xác nhận lịch';
  static const scored = 'Đã chấm';
  static const notScored = 'Chưa chấm';

  // Chấm điểm (S4)
  static const scoringTitle = 'Chấm điểm';
  static const criteriaTitle = 'Tiêu chí';
  static const noCriteria = 'Chưa cấu hình tiêu chí';
  static const notScoredYet = 'Chưa chọn điểm';
  static const comment = 'Nhận xét (tùy chọn)';
  static const complete = 'Hoàn thành đánh giá';
  static const confirmTitle = 'Sau khi hoàn thành sẽ không sửa được';
  static const confirmBody = 'Bạn chắc chắn muốn hoàn thành đánh giá này?';
  static const cancel = 'Hủy';
  static const confirm = 'Hoàn thành';
  static const completedSnack = 'Đã hoàn thành đánh giá';
  static const notCompleted = 'Chưa hoàn thành được';
  static const alreadyCompleted = 'Bạn đã hoàn thành đánh giá cho ứng viên này';
  static const leaveTitle = 'Dữ liệu chưa lưu sẽ mất';
  static const leaveBody = 'Bạn muốn ở lại hay rời đi?';
  static const stay = 'Ở lại';
  static const leave = 'Rời đi';
  static String completedAt(String when) => 'Đã hoàn thành lúc $when';
  static const experience = 'Kinh nghiệm';
  static const education = 'Trình độ';
  static String score(int n) => 'Điểm $n';
  static const invalidData = 'Dữ liệu chưa hợp lệ, vui lòng kiểm tra lại';

  // Kết luận (US5.3)
  static const conclusionTitle = 'Kết luận';
  static const conclusionNote =
      'Đề xuất của người phỏng vấn, không phải kết luận cuối';
  static const conclusionMissing = 'Chưa chọn kết luận';
  static const noConclusion = 'Chưa ghi kết luận';
  static String ketLuanLabel(String code) => switch (code) {
    'DAT' => 'Đạt',
    'LOAI' => 'Loại',
    'CAN_NHAC' => 'Cân nhắc',
    _ => 'Khác',
  };

  // Giới thiệu sang vị trí khác (US5.4)
  static const referTitle = 'Giới thiệu sang vị trí khác (tùy chọn)';
  static const referNone = 'Không refer';
  static const referPosition = 'Giới thiệu sang vị trí khác';
  static const referReason = 'Lý do giới thiệu (tùy chọn)';
  static const referShown = 'Đã hiện ô giới thiệu sang vị trí khác';
  static const referLoadError = 'Không tải được danh sách vị trí';

  // Điểm trung bình (US5.8)
  static const avgTitle = 'Điểm trung bình';
  static const avgEmpty = '—';
  static const avgNoneHint = 'Chưa chọn điểm nào';
  static String avgPartial(int k, int n) =>
      'Tạm tính theo $k/$n tiêu chí đã chọn';
  static String avgFull(int n) => 'Trung bình $n tiêu chí';
  static const avgNote = 'Chỉ để tham khảo, không thay thế kết luận của bạn';
  static String avgValue(String v) => '$v / 5';
  static String avgLabel(String v) => 'Điểm TB $v';

  // Xem lại bài đã hoàn thành (S5) và đăng xuất
  static const reviewTitle = 'Bài đã hoàn thành';
  static const referredTo = 'Giới thiệu sang';
  static const referReasonLabel = 'Lý do';
  static const logout = 'Đăng xuất';
  static String scoredCount(String done, int total) => 'Đã chấm $done/$total';
}
